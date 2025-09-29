<?php
require_once '../includes/session.php';

// Require authentication
requireAuth();

// Get user data
$user = $current_user;
$user_type = $user['user_type'] ?? 'student';

// Fetch user's applications
$applications = [];
try {
    $applications = makeApiCall('/applications/student/' . $user['id'], 'GET', null, true);
} catch (Exception $e) {
    error_log('Failed to fetch applications: ' . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>My Applications - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    let applications = <?php echo json_encode($applications); ?>;

    function loadMyApplications() {
      const list = document.getElementById('list');
      list.innerHTML = '';
      
      if (!applications.length) {
        const empty = document.createElement('div');
        empty.className = 'subtitle';
        empty.textContent = 'No applications yet. Browse jobs to apply!';
        list.replaceChildren(empty);
        return;
      }
      
      for (const app of applications) {
        const card = document.createElement('div');
        card.className = 'card';
        
        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = app.job_title || 'Unknown Job';
        
        const company = document.createElement('div');
        company.className = 'subtitle';
        company.textContent = `${app.job_company || ''} • ${app.job_location || ''}`;
        
        const status = document.createElement('div');
        status.className = 'subtitle';
        status.innerHTML = `Status: <span class="status-${app.status}">${app.status}</span>`;
        
        const appliedDate = document.createElement('div');
        appliedDate.className = 'subtitle';
        appliedDate.textContent = `Applied: ${new Date(app.applied_at).toLocaleDateString()}`;
        
        if (app.cover_letter) {
          const coverLetter = document.createElement('div');
          coverLetter.className = 'description';
          coverLetter.innerHTML = `<strong>Cover Letter:</strong><br>${app.cover_letter}`;
          card.appendChild(coverLetter);
        }
        
        if (app.resume) {
          const resume = document.createElement('div');
          resume.className = 'subtitle';
          resume.innerHTML = `<strong>Resume:</strong> <a href="${app.resume}" target="_blank">View Resume</a>`;
          card.appendChild(resume);
        }
        
        card.appendChild(title);
        card.appendChild(company);
        card.appendChild(status);
        card.appendChild(appliedDate);
        
        list.appendChild(card);
      }
    }

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

    document.addEventListener('DOMContentLoaded', () => {
      loadMyApplications();
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
    <h2 class="mt-24">My Job Applications</h2>
    <p class="subtitle">Track the status of your job applications</p>
    <div id="list" class="mt-24" style="display:grid; gap:16px;"></div>
  </div>
</body>
</html>
