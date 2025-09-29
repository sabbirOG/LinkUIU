<?php
require_once '../includes/session.php';

// Require authentication
requireAuth();

// Get user data
$user = $current_user;

// Fetch user's connections
$connections = [];
try {
    $connections = makeApiCall('/connections/' . $user['id'], 'GET', null, true);
} catch (Exception $e) {
    error_log('Failed to fetch connections: ' . $e->getMessage());
}

// Handle form submission
$error_message = '';
$success_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'add_connection') {
        try {
            $targetUserId = (int)($_POST['targetUserId'] ?? 0);
            
            if ($targetUserId <= 0) {
                throw new Exception('Please enter a valid user ID');
            }
            
            $result = makeApiCall('/connections/' . $user['id'], 'POST', ['targetUserId' => $targetUserId], true);
            $success_message = 'Connection request sent successfully!';
            
        } catch (Exception $e) {
            $error_message = $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Connections - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    let connections = <?php echo json_encode($connections); ?>;

    function loadConnections() {
      const list = document.getElementById('connections-list');
      list.innerHTML = '';
      
      if (!connections.length) {
        const empty = document.createElement('div');
        empty.className = 'subtitle';
        empty.textContent = 'No connections yet';
        list.appendChild(empty);
        return;
      }
      
      for (const r of connections) {
        const card = document.createElement('div');
        card.className = 'connection-card';
        const t = document.createElement('div');
        t.className = 'title';
        t.textContent = r.target_name || '';
        const s = document.createElement('div');
        s.className = 'subtitle';
        s.textContent = `Status: ${r.status || ''}`;
        card.appendChild(t);
        card.appendChild(s);
        list.appendChild(card);
      }
    }

    async function searchUsers(e) {
      e.preventDefault();
      const err = document.getElementById('error');
      err.textContent = '';
      
      const searchQuery = document.getElementById('searchQuery').value.trim();
      
      if (!searchQuery) {
        err.textContent = 'Please enter a search term';
        return;
      }
      
      try {
        const response = await fetch('<?php echo $api_base; ?>/search/users?q=' + encodeURIComponent(searchQuery), {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
            'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
          }
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to search users');
        }
        
        const searchResults = await response.json();
        displaySearchResults(searchResults);
      } catch (e) {
        err.textContent = e.message;
      }
    }

    function displaySearchResults(results) {
      const list = document.getElementById('search-results');
      list.innerHTML = '';
      
      if (!results || !results.length) {
        const empty = document.createElement('div');
        empty.className = 'subtitle';
        empty.textContent = 'No users found';
        list.appendChild(empty);
        return;
      }
      
      for (const user of results) {
        const card = document.createElement('div');
        card.className = 'search-result-card';
        
        const userInfo = document.createElement('div');
        userInfo.innerHTML = `
          <div class="title">${user.name || 'Unknown User'}</div>
          <div class="subtitle">${user.email || ''}</div>
          <div class="subtitle">ID: ${user.id || ''}</div>
          <div class="subtitle">${user.current_job || 'No job title'}</div>
        `;
        
        const actionButton = document.createElement('button');
        actionButton.className = 'btn btn-primary';
        actionButton.textContent = 'Send Request';
        actionButton.onclick = () => sendConnectionRequest(user.id);
        
        card.appendChild(userInfo);
        card.appendChild(actionButton);
        list.appendChild(card);
      }
    }

    async function sendConnectionRequest(targetUserId) {
      try {
        const response = await fetch('<?php echo $api_base; ?>/connections/<?php echo $user['id']; ?>', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
            'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
          },
          body: JSON.stringify({ targetUserId: Number(targetUserId) })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to send connection request');
        }
        
        alert('Connection request sent successfully!');
        loadConnections(); // Reload connections list
      } catch (e) {
        alert('Error: ' + e.message);
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
      loadConnections();
      document.getElementById('conn-form').addEventListener('submit', searchUsers);
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
    <div class="connections-layout">
      <!-- Left Side - Search and Current Connections -->
      <div class="connections-left">
        <div class="card mt-24">
          <form id="conn-form" method="GET" action="">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
            
            <?php if ($error_message): ?>
              <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
            <?php endif; ?>
            
            <?php if ($success_message): ?>
              <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
            <?php endif; ?>
            
            <div class="field"><label class="label">Search for users</label><input id="searchQuery" name="searchQuery" class="input" type="text" placeholder="Enter name, email, or user ID..." required /></div>
            <button class="btn btn-primary">Search</button>
            <div id="error" class="error"></div>
          </form>
        </div>
        
        <div class="card mt-24">
          <h3 class="title">My Connections</h3>
          <div id="connections-list" style="display:grid; gap:16px;"></div>
        </div>
      </div>
      
      <!-- Right Side - Search Results -->
      <div class="connections-right">
        <div class="card mt-24">
          <h3 class="title">Search Results</h3>
          <div id="search-results" style="display:grid; gap:16px;"></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
