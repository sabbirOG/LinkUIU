<?php
require_once '../includes/session.php';

// Require authentication
requireAuth();

// Get user data
$user = $current_user;
$profile_data = $user;

// Fetch additional profile data from backend
try {
    $profileData = makeApiCall('/profile/' . $user['id'], 'GET', null, true);
    $profile_data = array_merge($profile_data, $profileData);
} catch (Exception $e) {
    // Use session data if API call fails
    error_log('Failed to fetch profile data: ' . $e->getMessage());
}

// Handle form submission
$error_message = '';
$success_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'update_profile') {
        try {
            $updateData = [
                'name' => trim($_POST['name'] ?? ''),
                'current_job' => trim($_POST['current_job'] ?? ''),
                'designation' => trim($_POST['designation'] ?? ''),
                'company' => trim($_POST['company'] ?? ''),
                'location_city' => trim($_POST['location_city'] ?? ''),
                'location_country' => trim($_POST['location_country'] ?? ''),
                'skills' => trim($_POST['skills'] ?? ''),
                'interests' => trim($_POST['interests'] ?? ''),
                'linkedin' => trim($_POST['linkedin'] ?? ''),
                'github' => trim($_POST['github'] ?? ''),
                'website' => trim($_POST['website'] ?? ''),
                'profile_visibility' => $_POST['profile_visibility'] ?? 'public'
            ];
            
            $result = makeApiCall('/profile/' . $user['id'], 'PUT', $updateData, true);
            $success_message = 'Profile updated successfully!';
            
            // Update session data
            $_SESSION['auth_user'] = array_merge($_SESSION['auth_user'], $updateData);
            $profile_data = array_merge($profile_data, $updateData);
            
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
  <title>Profile - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    async function removeResume() {
      if (!confirm('Remove current resume?')) return;
      try {
        const response = await fetch('<?php echo $api_base; ?>/profile/<?php echo $user['id']; ?>', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
            'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
          },
          body: JSON.stringify({ resume: null })
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove resume');
        }
        
        document.getElementById('current-resume').innerHTML = '';
        alert('Resume removed successfully');
      } catch (e) {
        alert('Error removing resume: ' + e.message);
      }
    }
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
    <div class="card mt-24">
      <form id="profile-form" method="POST" action="">
        <input type="hidden" name="action" value="update_profile">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
        
        <div class="row" style="justify-content: space-between;">
          <div class="title">Edit Profile</div>
        </div>
        
        <?php if ($error_message): ?>
          <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
        <?php endif; ?>
        
        <?php if ($success_message): ?>
          <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
        <?php endif; ?>
        
        <!-- Basic Information -->
        <h3 style="margin-top: 24px; margin-bottom: 16px; color: var(--color-primary);">Basic Information</h3>
        <div class="field"><label class="label">Full Name *</label><input id="name" name="name" class="input" value="<?php echo htmlspecialchars($profile_data['name'] ?? ''); ?>" required /></div>
        <div class="field"><label class="label">Current Job/Position</label><input id="current_job" name="current_job" class="input" placeholder="e.g., Software Engineer" value="<?php echo htmlspecialchars($profile_data['current_job'] ?? ''); ?>" /></div>
        <div class="field"><label class="label">Designation</label><input id="designation" name="designation" class="input" placeholder="e.g., Senior Developer" value="<?php echo htmlspecialchars($profile_data['designation'] ?? ''); ?>" /></div>
        <div class="field"><label class="label">Company</label><input id="company" name="company" class="input" placeholder="e.g., Tech Corp" value="<?php echo htmlspecialchars($profile_data['company'] ?? ''); ?>" /></div>
        
        <!-- Location -->
        <h3 style="margin-top: 24px; margin-bottom: 16px; color: var(--color-primary);">Location</h3>
        <div class="field"><label class="label">City</label><input id="location_city" name="location_city" class="input" placeholder="e.g., Dhaka" value="<?php echo htmlspecialchars($profile_data['location_city'] ?? ''); ?>" /></div>
        <div class="field"><label class="label">Country</label><input id="location_country" name="location_country" class="input" placeholder="e.g., Bangladesh" value="<?php echo htmlspecialchars($profile_data['location_country'] ?? ''); ?>" /></div>
        
        <!-- Skills & Interests -->
        <h3 style="margin-top: 24px; margin-bottom: 16px; color: var(--color-primary);">Skills & Interests</h3>
        <div class="field"><label class="label">Skills</label><textarea id="skills" name="skills" class="input" rows="3" placeholder="PHP, MySQL, JavaScript, React, Node.js (comma-separated)"><?php echo htmlspecialchars($profile_data['skills'] ?? ''); ?></textarea></div>
        <div class="field"><label class="label">Interests</label><textarea id="interests" name="interests" class="input" rows="3" placeholder="Web Development, Machine Learning, Open Source (comma-separated)"><?php echo htmlspecialchars($profile_data['interests'] ?? ''); ?></textarea></div>
        
        <!-- Social Links -->
        <h3 style="margin-top: 24px; margin-bottom: 16px; color: var(--color-primary);">Social Links</h3>
        <div class="field"><label class="label">LinkedIn</label><input id="linkedin" name="linkedin" class="input" type="url" placeholder="https://linkedin.com/in/yourprofile" value="<?php echo htmlspecialchars($profile_data['linkedin'] ?? ''); ?>" /></div>
        <div class="field"><label class="label">GitHub</label><input id="github" name="github" class="input" type="url" placeholder="https://github.com/yourusername" value="<?php echo htmlspecialchars($profile_data['github'] ?? ''); ?>" /></div>
        <div class="field"><label class="label">Website/Portfolio</label><input id="website" name="website" class="input" type="url" placeholder="https://yourwebsite.com" value="<?php echo htmlspecialchars($profile_data['website'] ?? ''); ?>" /></div>
        
        <!-- Privacy -->
        <h3 style="margin-top: 24px; margin-bottom: 16px; color: var(--color-primary);">Privacy</h3>
        <div class="field">
          <label class="label">Profile Visibility</label>
          <select id="profile_visibility" name="profile_visibility" class="input">
            <option value="public" <?php echo ($profile_data['profile_visibility'] ?? 'public') === 'public' ? 'selected' : ''; ?>>Public - Visible to all users</option>
            <option value="private" <?php echo ($profile_data['profile_visibility'] ?? 'public') === 'private' ? 'selected' : ''; ?>>Private - Only visible to connections</option>
          </select>
        </div>
        
        <button class="btn btn-primary" type="submit">Save Profile</button>
      </form>
      
      <hr class="mt-24" />
      
      <!-- Resume Upload Section -->
      <div class="mt-16">
        <h3 style="margin-bottom: 16px; color: var(--color-primary);">Resume</h3>
        <div id="current-resume">
          <?php if (!empty($profile_data['resume'])): ?>
            <div class="subtitle">
              <strong>Current Resume:</strong> 
              <a href="/storage/resumes/<?php echo htmlspecialchars($profile_data['resume']); ?>" target="_blank">View Resume</a>
              <button type="button" class="btn btn-secondary" onclick="removeResume()" style="margin-left: 8px;">Remove</button>
            </div>
          <?php endif; ?>
        </div>
        <form id="upload-form" class="mt-16" enctype="multipart/form-data">
          <div class="field"><label class="label">Upload Resume (PDF only, max 5MB)</label><input id="resume" name="resume" type="file" accept="application/pdf" /></div>
          <button class="btn btn-primary" type="submit">Upload Resume</button>
        </form>
      </div>
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

    // Handle resume upload
    document.getElementById('upload-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      const fileInput = document.getElementById('resume');
      
      if (!fileInput.files[0]) {
        alert('Please select a PDF file');
        return;
      }
      
      formData.append('resume', fileInput.files[0]);
      
      try {
        const response = await fetch('<?php echo $api_base; ?>/profile/<?php echo $user['id']; ?>/resume', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
            'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
          },
          body: formData
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }
        
        alert('Resume uploaded successfully');
        location.reload(); // Reload to show new resume
      } catch (e) {
        alert('Error uploading resume: ' + e.message);
      }
    });
  </script>
</body>
</html>
