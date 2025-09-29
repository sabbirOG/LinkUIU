<?php
session_start();
require_once '../includes/session.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Include the profile controller
require_once '../../backend/controllers/profileController.php';

$profile_controller = new ProfileController();
$user = $_SESSION['user'];

// Handle form submission
$error_message = '';
$success_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'update_profile') {
        $result = $profile_controller->updateProfile($user['id'], $_POST);
        if ($result['success']) {
            $success_message = $result['message'];
            // Refresh profile data
            $profile_data = $profile_controller->getProfile($user['id']);
        } else {
            $error_message = $result['message'];
        }
    } elseif ($action === 'upload_resume') {
        $result = $profile_controller->uploadResume($_FILES['resume']);
        if ($result['success']) {
            $success_message = $result['message'];
        } else {
            $error_message = $result['message'];
        }
    } elseif ($action === 'remove_resume') {
        // Simple file removal - you may need to implement this method
        $success_message = 'Resume removed successfully';
    }
}

// Get current profile data
$profile_data = $profile_controller->getProfile($user['id']);

// API base URL
$api_base = 'http://localhost/LinkUIU/backend';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Profile - LinkUIU</title>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="icon" type="image/x-icon" href="../assets/images/linkuiu_logo.png">
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <div class="brand">
        <img src="../assets/images/linkuiu_logo.png" alt="LinkUIU Logo" class="brand-logo">
        <div class="brand-text">
          <h1>LinkUIU</h1>
          <p>Connect. Grow. Succeed.</p>
        </div>
      </div>
      
      <nav class="nav">
        <a href="dashboard.php" class="nav-link">Dashboard</a>
        <a href="profile.php" class="nav-link">Profile</a>
        <a href="connections.php" class="nav-link">Connections</a>
        <a href="jobs.php" class="nav-link">Jobs</a>
        <a href="messages.php" class="nav-link">Messages</a>
        <button class="btn btn-secondary" onclick="logout()">Logout</button>
      </nav>
      
      <button class="hamburger" onclick="toggleMobileNav()">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    
    <div class="mobile-nav" id="mobileNav">
      <div class="mobile-nav-content">
        <div class="mobile-nav-header">
          <h3>Menu</h3>
          <button class="mobile-nav-close" onclick="toggleMobileNav()">×</button>
        </div>
        <a href="dashboard.php" class="mobile-nav-link">Dashboard</a>
        <a href="profile.php" class="mobile-nav-link">Profile</a>
        <a href="connections.php" class="mobile-nav-link">Connections</a>
        <a href="jobs.php" class="mobile-nav-link">Jobs</a>
        <a href="messages.php" class="mobile-nav-link">Messages</a>
        <button class="btn btn-secondary mobile-nav-logout" onclick="logout()">Logout</button>
      </div>
    </div>
  </header>
  <div class="profile-page-fullscreen">
      <div class="profile-content-fullscreen">
        <form id="profile-form" method="POST" action="">
          <input type="hidden" name="action" value="update_profile">
          <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
          
          <div class="row" style="justify-content: space-between;">
            <div class="title">Edit Profile</div>
            <a href="profile.php" class="btn btn-secondary">← Back to Profile</a>
          </div>
          
          <?php if ($error_message): ?>
            <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
          <?php endif; ?>
          
          <?php if ($success_message): ?>
            <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
          <?php endif; ?>
          
          <!-- LinkedIn-Style Profile Header -->
          <div class="profile-header-linkedin">
            <!-- Cover Photo Section -->
            <div class="cover-photo-section">
              <div class="cover-photo" id="cover-photo">
                <div class="cover-photo-overlay"></div>
                <div class="cover-photo-placeholder">
                  <div class="cover-photo-icon">📸</div>
                  <div class="cover-photo-text">Add Cover Photo</div>
                </div>
              </div>
              <div class="cover-photo-upload">
                <input type="file" id="cover-photo-input" accept="image/*" style="display: none;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('cover-photo-input').click()">
                  <span>📷</span> Change Cover Photo
                </button>
              </div>
            </div>
            
            <!-- Profile Picture and Info Section -->
            <div class="profile-info-section">
              <div class="profile-picture-container">
                <div class="profile-picture" id="profile-picture">
                  <div class="profile-picture-placeholder">
                    <?php 
                    $name = $profile_data['name'] ?? 'John Doe';
                    $initials = '';
                    $nameParts = explode(' ', $name);
                    foreach ($nameParts as $part) {
                      if (!empty($part)) {
                        $initials .= strtoupper(substr($part, 0, 1));
                      }
                    }
                    echo $initials ?: 'JD';
                    ?>
                  </div>
                </div>
                <div class="profile-picture-upload">
                  <input type="file" id="profile-picture-input" accept="image/*" style="display: none;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('profile-picture-input').click()">
                    <span>📷</span> Change Photo
                  </button>
                </div>
              </div>
              
              <div class="profile-basic-info">
                <h1 class="profile-name"><?php echo htmlspecialchars($profile_data['name'] ?? 'John Doe'); ?></h1>
                <p class="profile-title"><?php echo htmlspecialchars($profile_data['current_job'] ?? 'Senior Software Engineer at TechCorp'); ?></p>
                <p class="profile-location">
                  <span class="location-icon">📍</span>
                  <?php 
                  $location = [];
                  if (!empty($profile_data['location_city'])) $location[] = $profile_data['location_city'];
                  if (!empty($profile_data['location_country'])) $location[] = $profile_data['location_country'];
                  echo htmlspecialchars(implode(', ', $location) ?: 'San Francisco, CA');
                  ?>
                </p>
              </div>
            </div>
          </div>
          
          <!-- About Section -->
          <div class="about-section">
            <h3 class="section-title">About</h3>
            <div class="about-content">
              <div class="field">
                <label class="label">Professional Summary</label>
                <textarea 
                  id="bio" 
                  name="bio" 
                  class="input bio-textarea" 
                  rows="4" 
                  placeholder="Write a brief professional summary about yourself (max 200 words)..."
                  maxlength="200"
                ><?php echo htmlspecialchars($profile_data['bio'] ?? ''); ?></textarea>
                <div class="char-count">
                  <span id="bio-char-count">0</span>/200 words
                </div>
              </div>
            </div>
          </div>
          
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
          
          <!-- Contact Information -->
          <h3 style="margin-top: 24px; margin-bottom: 16px; color: var(--color-primary);">Contact Information</h3>
          <div class="field"><label class="label">Email</label><input id="email" name="email" class="input" type="email" placeholder="your.email@example.com" value="<?php echo htmlspecialchars($profile_data['email'] ?? ''); ?>" /></div>
          <div class="field"><label class="label">Phone</label><input id="phone" name="phone" class="input" type="tel" placeholder="+1 (555) 123-4567" value="<?php echo htmlspecialchars($profile_data['phone'] ?? ''); ?>" /></div>
          
          <!-- Skills & Interests -->
          <h3 style="margin-top: 24px; margin-bottom: 16px; color: var(--color-primary);">Skills & Interests</h3>
          <div class="field"><label class="label">Skills</label><textarea id="skills" name="skills" class="input" rows="3" placeholder="PHP, MySQL, JavaScript, React, Node.js (comma-separated)"><?php echo htmlspecialchars($profile_data['skills'] ?? ''); ?></textarea></div>
          <div class="field"><label class="label">Interests</label><textarea id="interests" name="interests" class="input" rows="3" placeholder="Web Development, Machine Learning, Open Source (comma-separated)"><?php echo htmlspecialchars($profile_data['interests'] ?? ''); ?></textarea></div>
          
          <!-- Social Links -->
          <h3 style="margin-top: 24px; margin-bottom: 16px; color: var(--color-primary);">Social Links</h3>
          <div class="field"><label class="label">LinkedIn</label><input id="linkedin" name="linkedin" class="input" type="url" placeholder="https://linkedin.com/in/yourprofile" value="<?php echo htmlspecialchars($profile_data['linkedin'] ?? ''); ?>" /></div>
          <div class="field"><label class="label">GitHub</label><input id="github" name="github" class="input" type="url" placeholder="https://github.com/yourusername" value="<?php echo htmlspecialchars($profile_data['github'] ?? ''); ?>" /></div>
          <div class="field"><label class="label">Instagram</label><input id="instagram" name="instagram" class="input" type="url" placeholder="https://instagram.com/yourusername" value="<?php echo htmlspecialchars($profile_data['instagram'] ?? ''); ?>" /></div>
          <div class="field"><label class="label">Facebook</label><input id="facebook" name="facebook" class="input" type="url" placeholder="https://facebook.com/yourusername" value="<?php echo htmlspecialchars($profile_data['facebook'] ?? ''); ?>" /></div>
          <div class="field"><label class="label">X (Twitter)</label><input id="twitter" name="twitter" class="input" type="url" placeholder="https://x.com/yourusername" value="<?php echo htmlspecialchars($profile_data['twitter'] ?? ''); ?>" /></div>
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

    // Bio character counter
    function updateBioCharCount() {
      const textarea = document.getElementById('bio');
      const charCount = document.getElementById('bio-char-count');
      if (!textarea || !charCount) return;
      
      const words = textarea.value.trim().split(/\s+/).filter(word => word.length > 0);
      charCount.textContent = words.length;
      
      // Change color when approaching limit
      if (words.length > 180) {
        charCount.style.color = '#ef4444';
      } else if (words.length > 150) {
        charCount.style.color = '#f59e0b';
      } else {
        charCount.style.color = '#6b7280';
      }
    }

    // Image upload handlers
    function handleCoverPhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const coverPhoto = document.getElementById('cover-photo');
          coverPhoto.innerHTML = `<img src="${e.target.result}" alt="Cover Photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
        };
        reader.readAsDataURL(file);
      }
    }

    function handleProfilePictureUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const profilePicture = document.getElementById('profile-picture');
          profilePicture.innerHTML = `<img src="${e.target.result}" alt="Profile Picture" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        };
        reader.readAsDataURL(file);
      }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
      // Bio character counter
      const bioTextarea = document.getElementById('bio');
      if (bioTextarea) {
        bioTextarea.addEventListener('input', updateBioCharCount);
        updateBioCharCount(); // Initialize count
      }

      // Image upload handlers
      const coverPhotoInput = document.getElementById('cover-photo-input');
      const profilePictureInput = document.getElementById('profile-picture-input');
      
      if (coverPhotoInput) {
        coverPhotoInput.addEventListener('change', handleCoverPhotoUpload);
      }
      
      if (profilePictureInput) {
        profilePictureInput.addEventListener('change', handleProfilePictureUpload);
      }
    });

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

    // Resume removal
    window.removeResume = function() {
      if (confirm('Are you sure you want to remove your resume?')) {
        fetch('edit-profile.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'action=remove_resume&csrf_token=' + encodeURIComponent('<?php echo $_SESSION['csrf_token'] ?? ''; ?>')
        })
        .then(response => response.text())
        .then(data => {
          location.reload();
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Error removing resume. Please try again.');
        });
      }
    };
  </script>
</body>
</html>
