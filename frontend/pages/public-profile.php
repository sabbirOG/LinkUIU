<?php
require_once '../includes/session.php';

// Get user ID from URL parameter
$profile_user_id = $_GET['id'] ?? null;

if (!$profile_user_id) {
    header('Location: ./search.php');
    exit;
}

// Fetch profile data from backend
$profile_data = [];
try {
    $profile_data = makeApiCall('/profile/' . $profile_user_id, 'GET', null, false);
} catch (Exception $e) {
    error_log('Failed to fetch profile data: ' . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Profile - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    let profileData = <?php echo json_encode($profile_data); ?>;
    let currentUserId = '<?php echo $profile_user_id; ?>';

    async function loadPublicProfile() {
      if (!profileData || Object.keys(profileData).length === 0) {
        document.getElementById('content').innerHTML = '<div class="error">Profile not found</div>';
        return;
      }
      
      displayProfile(profileData);
    }

    function displayProfile(data) {
      const content = document.getElementById('content');
      
      content.innerHTML = `
        <div class="card">
          <div class="profile-header">
            <div class="profile-avatar">
              <div class="avatar-placeholder">${data.name ? data.name.charAt(0).toUpperCase() : 'U'}</div>
            </div>
            <div class="profile-info">
              <h1 class="profile-name">${data.name || 'Unknown User'}</h1>
              <div class="profile-title">${data.current_job || 'No position specified'}</div>
              <div class="profile-company">${data.company || ''}</div>
              <div class="profile-location">${[data.location_city, data.location_country].filter(Boolean).join(', ') || 'Location not specified'}</div>
            </div>
          </div>
          
          ${data.skills ? `
            <div class="profile-section">
              <h3>Skills</h3>
              <div class="skills-list">${data.skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}</div>
            </div>
          ` : ''}
          
          ${data.interests ? `
            <div class="profile-section">
              <h3>Interests</h3>
              <div class="interests-list">${data.interests.split(',').map(interest => `<span class="interest-tag">${interest.trim()}</span>`).join('')}</div>
            </div>
          ` : ''}
          
          <div class="profile-section">
            <h3>Contact & Links</h3>
            <div class="contact-links">
              ${data.linkedin ? `<a href="${data.linkedin}" target="_blank" class="contact-link linkedin">LinkedIn</a>` : ''}
              ${data.github ? `<a href="${data.github}" target="_blank" class="contact-link github">GitHub</a>` : ''}
              ${data.website ? `<a href="${data.website}" target="_blank" class="contact-link website">Website</a>` : ''}
              ${data.resume ? `<a href="/storage/resumes/${data.resume}" target="_blank" class="contact-link resume">View Resume</a>` : ''}
            </div>
          </div>
          
          <div class="profile-actions">
            <button class="btn btn-primary" onclick="sendMessage()">Send Message</button>
            <button class="btn btn-secondary" onclick="requestConnection()">Connect</button>
          </div>
        </div>
      `;
    }

    async function sendMessage() {
      if (!currentUserId) return;
      location.href = `./messages.php?user=${currentUserId}`;
    }

    async function requestConnection() {
      if (!currentUserId) return;
      
      try {
        const me = <?php echo json_encode($current_user); ?>;
        if (!me || !me.id) {
          alert('Please login to send connection requests');
          location.href = './login.php';
          return;
        }
        
        const response = await fetch('<?php echo $api_base; ?>/connections/' + me.id, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
            'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
          },
          body: JSON.stringify({ targetUserId: parseInt(currentUserId) })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to send connection request');
        }
        
        alert('Connection request sent!');
      } catch (e) {
        if (e.message.includes('Already')) {
          alert('You are already connected or have a pending request with this user.');
        } else {
          alert('Error sending connection request: ' + e.message);
        }
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
      loadPublicProfile();
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
    <div id="content" class="mt-24">
      <div class="subtitle">Loading profile...</div>
    </div>
  </div>
</body>
</html>
