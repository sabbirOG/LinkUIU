<?php
require_once '../includes/session.php';

// Require authentication
requireAuth();

// Get user data
$user = $current_user;
$user_type = $user['user_type'] ?? 'student';
$user_name = $user['name'] ?? 'UIU Member';

// Fetch additional user data from backend
try {
    $userData = makeApiCall('/auth/me', 'GET', null, true);
    $user = array_merge($user, $userData);
} catch (Exception $e) {
    // Use session data if API call fails
    error_log('Failed to fetch user data: ' . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dashboard - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css?v=2" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    document.addEventListener('DOMContentLoaded', async () => {
      // Update welcome message with user type
      const welcomeElement = document.getElementById('welcome');
      const userTypeBadge = document.getElementById('user-type-badge');
      
      if ('<?php echo $user_type; ?>' === 'alumni') {
        welcomeElement.innerHTML = `Welcome back, <strong><?php echo htmlspecialchars($user_name); ?></strong>`;
        userTypeBadge.innerHTML = '🌟 Alumni';
        userTypeBadge.className = 'user-type-badge alumni';
      } else {
        welcomeElement.innerHTML = `Welcome, <strong><?php echo htmlspecialchars($user_name); ?></strong>`;
        userTypeBadge.innerHTML = '🎓 Student';
        userTypeBadge.className = 'user-type-badge student';
      }
    });
  </script>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <div class="brand-left">
        <img class="uiu-logo" src="../assets/images/uiu_logo.png?v=2" alt="UIU logo" />
      </div>
      <div class="brand-center"></div>
      <div class="brand-right">
        <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" onclick="location.href='./dashboard.php'" style="cursor: pointer;" />
      </div>
      <button class="hamburger" aria-label="Toggle mobile menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="nav">
        <span class="nav-link" onclick="location.href='./dashboard.php'" style="cursor: pointer;">Home</span>
        <span class="nav-link" onclick="location.href='./profile.php'" style="cursor: pointer;">Profile</span>
        <span class="nav-link" onclick="location.href='./jobs.php'" style="cursor: pointer;">Jobs</span>
        <span class="nav-link" onclick="location.href='./applications.php'" style="cursor: pointer;">My Applications</span>
        <span class="nav-link" onclick="location.href='./connections.php'" style="cursor: pointer;">Connections</span>
        <span class="nav-link" onclick="location.href='./messages.php'" style="cursor: pointer;">Messages</span>
        <span class="nav-link" onclick="location.href='./search.php'" style="cursor: pointer;">Search</span>
        <button class="btn btn-primary" onclick="logout()">Logout</button>
      </nav>
    </div>
    
    <!-- Mobile Navigation -->
    <div class="mobile-nav">
      <div class="mobile-nav-content">
        <div class="mobile-nav-header">
          <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" style="height: 30px;" />
          <button class="mobile-nav-close" aria-label="Close mobile menu">&times;</button>
        </div>
        <div class="mobile-nav-links">
          <span onclick="location.href='./dashboard.php'; closeMobileMenu();" style="cursor: pointer;">Home</span>
          <span onclick="location.href='./profile.php'; closeMobileMenu();" style="cursor: pointer;">Profile</span>
          <span onclick="location.href='./jobs.php'; closeMobileMenu();" style="cursor: pointer;">Jobs</span>
          <span onclick="location.href='./applications.php'; closeMobileMenu();" style="cursor: pointer;">My Applications</span>
          <span onclick="location.href='./connections.php'; closeMobileMenu();" style="cursor: pointer;">Connections</span>
          <span onclick="location.href='./messages.php'; closeMobileMenu();" style="cursor: pointer;">Messages</span>
          <span onclick="location.href='./search.php'; closeMobileMenu();" style="cursor: pointer;">Search</span>
          <button class="btn btn-primary" onclick="logout(); closeMobileMenu();">Logout</button>
        </div>
      </div>
    </div>
  </header>
  <div class="container">
    <div class="welcome-section">
      <h2 id="welcome" class="mt-24"></h2>
      <div id="user-type-badge" class="user-type-badge"></div>
    </div>
    <div class="mt-24 row">
      <a class="btn btn-primary" href="./profile.php">Edit Profile</a>
      <a class="btn btn-primary" href="./jobs.php">Browse Jobs</a>
      <a class="btn btn-primary" href="./applications.php">My Applications</a>
    </div>
  </div>

  <script>
    function logout() {
      // Clear session data
      fetch('<?php echo $api_base; ?>/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
          'Content-Type': 'application/json'
        }
      }).then(() => {
        // Clear local storage and session
        localStorage.clear();
        // Redirect to login
        location.href = './login.php';
      }).catch(() => {
        // Even if logout fails, clear local data and redirect
        localStorage.clear();
        location.href = './login.php';
      });
    }
  </script>
</body>
</html>
