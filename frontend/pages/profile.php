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
                'bio' => trim($_POST['bio'] ?? ''),
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
  <div class="profile-page-fullscreen">
      <div class="profile-content-fullscreen">
        
        <!-- LinkedIn-Style Profile Header -->
        <div class="profile-header-linkedin">
          <!-- Cover Photo Section -->
          <div class="cover-photo-section">
            <div class="cover-photo-menu">
              <button class="menu-dots cover-menu-dots" onclick="toggleMenu('cover-menu')">⋯</button>
              <div class="dropdown-menu" id="cover-menu">
                <a href="#" onclick="editCoverPhoto()">Edit Cover Photo</a>
              </div>
            </div>
            <div class="cover-photo" id="cover-photo">
              <div class="cover-photo-overlay"></div>
              <div class="cover-photo-placeholder">
                <div class="cover-photo-icon">📸</div>
                <div class="cover-photo-text">Add Cover Photo</div>
              </div>
            </div>
          </div>
          
          <!-- Profile Picture and Info Section -->
          <div class="profile-info-section">
            <div class="profile-picture-container">
              <div class="profile-picture-menu">
                <button class="menu-dots profile-menu-dots" onclick="toggleMenu('profile-menu')">⋯</button>
                <div class="dropdown-menu" id="profile-menu">
                  <a href="#" onclick="editProfilePhoto()">Edit Profile Photo</a>
                </div>
              </div>
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
                        <div class="profile-id">
                            <span class="id-label">Student ID:</span>
                            <span class="id-value"><?php echo htmlspecialchars($profile_data['student_id'] ?? $user['student_id'] ?? 'N/A'); ?></span>
                        </div>
                    </div>
          </div>
        </div>
        
        <!-- About Section -->
        <div class="about-section">
          <div class="section-header">
            <h3 class="section-title">About</h3>
            <div class="section-menu">
              <button class="menu-dots" onclick="toggleMenu('about-menu')">⋯</button>
              <div class="dropdown-menu" id="about-menu">
                <a href="#" onclick="editSection('about')">Edit</a>
                <a href="#" onclick="changeLocation()">Change Location</a>
                <a href="#" onclick="deleteSection('about')">Delete</a>
              </div>
            </div>
          </div>
          <div class="about-content">
            <p class="about-text"><?php echo htmlspecialchars($profile_data['bio'] ?? 'Passionate software engineer with 5+ years of experience in full-stack development. I specialize in building scalable web applications using modern technologies like React, Node.js, and cloud platforms. Always eager to learn new technologies and contribute to innovative projects.'); ?></p>
          </div>
        </div>
        
        <!-- Experience Section -->
        <div class="experience-section">
          <div class="section-header">
            <h3 class="section-title">Experience</h3>
            <div class="section-menu">
              <button class="menu-dots" onclick="toggleMenu('experience-menu')">⋯</button>
              <div class="dropdown-menu" id="experience-menu">
                <a href="#" onclick="editSection('experience')">Edit</a>
                <a href="#" onclick="addSection('experience')">Add New</a>
                <a href="#" onclick="deleteSection('experience')">Delete All</a>
              </div>
            </div>
          </div>
          <div class="experience-list">
            <div class="experience-item">
              <div class="experience-header">
                <h4 class="experience-title">Senior Software Engineer</h4>
                <p class="experience-company">TechCorp Inc.</p>
                <p class="experience-duration">Jan 2022 - Present</p>
              </div>
              <p class="experience-description">Leading development of microservices architecture and implementing CI/CD pipelines. Mentoring junior developers and driving technical decisions for the platform team.</p>
            </div>
            <div class="experience-item">
              <div class="experience-header">
                <h4 class="experience-title">Software Engineer</h4>
                <p class="experience-company">StartupXYZ</p>
                <p class="experience-duration">Jun 2020 - Dec 2021</p>
              </div>
              <p class="experience-description">Developed full-stack web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions.</p>
            </div>
          </div>
        </div>
        
        <!-- Education Section -->
        <div class="education-section">
          <div class="section-header">
            <h3 class="section-title">Education</h3>
            <div class="section-menu">
              <button class="menu-dots" onclick="toggleMenu('education-menu')">⋯</button>
              <div class="dropdown-menu" id="education-menu">
                <a href="#" onclick="editSection('education')">Edit</a>
                <a href="#" onclick="addSection('education')">Add New</a>
                <a href="#" onclick="deleteSection('education')">Delete All</a>
              </div>
            </div>
          </div>
          <div class="education-list">
            <div class="education-item">
              <div class="education-header">
                <h4 class="education-degree">Bachelor of Science in Computer Science</h4>
                <p class="education-school">University of California, Berkeley</p>
                <p class="education-duration">2016 - 2020</p>
              </div>
              <p class="education-description">Graduated Magna Cum Laude with focus on software engineering and data structures.</p>
            </div>
          </div>
        </div>
        
        <!-- Skills Section -->
        <div class="skills-section">
          <div class="section-header">
            <h3 class="section-title">Skills</h3>
            <div class="section-menu">
              <button class="menu-dots" onclick="toggleMenu('skills-menu')">⋯</button>
              <div class="dropdown-menu" id="skills-menu">
                <a href="#" onclick="editSection('skills')">Edit</a>
                <a href="#" onclick="addSection('skills')">Add New</a>
                <a href="#" onclick="deleteSection('skills')">Delete All</a>
              </div>
            </div>
          </div>
          <div class="skills-list">
            <span class="skill-tag">JavaScript</span>
            <span class="skill-tag">React</span>
            <span class="skill-tag">Node.js</span>
            <span class="skill-tag">Python</span>
            <span class="skill-tag">AWS</span>
            <span class="skill-tag">Docker</span>
            <span class="skill-tag">MongoDB</span>
            <span class="skill-tag">PostgreSQL</span>
            <span class="skill-tag">Git</span>
            <span class="skill-tag">Agile</span>
          </div>
        </div>
        
        <!-- Contact Information -->
        <div class="contact-section">
          <div class="section-header">
            <h3 class="section-title">Contact Information</h3>
            <div class="section-menu">
              <button class="menu-dots" onclick="toggleMenu('contact-menu')">⋯</button>
              <div class="dropdown-menu" id="contact-menu">
                <a href="#" onclick="editSection('contact')">Edit</a>
                <a href="#" onclick="addSection('contact')">Add New</a>
                <a href="#" onclick="deleteSection('contact')">Delete All</a>
              </div>
            </div>
          </div>
          <div class="contact-info">
            <?php if (!empty($profile_data['email'])): ?>
              <div class="contact-item">
                <span class="contact-icon">📧</span>
                <span class="contact-label">Email:</span>
                <a href="mailto:<?php echo htmlspecialchars($profile_data['email']); ?>" class="contact-value"><?php echo htmlspecialchars($profile_data['email']); ?></a>
              </div>
            <?php endif; ?>
            
            <?php if (!empty($profile_data['phone'])): ?>
              <div class="contact-item">
                <span class="contact-icon">📱</span>
                <span class="contact-label">Phone:</span>
                <a href="tel:<?php echo htmlspecialchars($profile_data['phone']); ?>" class="contact-value"><?php echo htmlspecialchars($profile_data['phone']); ?></a>
              </div>
            <?php endif; ?>
          </div>
        </div>
        
        <!-- Social Links -->
        <div class="social-section">
          <div class="section-header">
            <h3 class="section-title">Social Links</h3>
            <div class="section-menu">
              <button class="menu-dots" onclick="toggleMenu('social-menu')">⋯</button>
              <div class="dropdown-menu" id="social-menu">
                <a href="#" onclick="editSection('social')">Edit</a>
                <a href="#" onclick="addSection('social')">Add New</a>
                <a href="#" onclick="deleteSection('social')">Delete All</a>
              </div>
            </div>
          </div>
          <div class="social-links">
            <?php if (!empty($profile_data['linkedin'])): ?>
              <a href="<?php echo htmlspecialchars($profile_data['linkedin']); ?>" target="_blank" class="social-link linkedin">
                <span class="social-icon">💼</span>
                LinkedIn
              </a>
            <?php endif; ?>
            
            <?php if (!empty($profile_data['github'])): ?>
              <a href="<?php echo htmlspecialchars($profile_data['github']); ?>" target="_blank" class="social-link github">
                <span class="social-icon">🐙</span>
                GitHub
              </a>
            <?php endif; ?>
            
            <?php if (!empty($profile_data['instagram'])): ?>
              <a href="<?php echo htmlspecialchars($profile_data['instagram']); ?>" target="_blank" class="social-link instagram">
                <span class="social-icon">📷</span>
                Instagram
              </a>
            <?php endif; ?>
            
            <?php if (!empty($profile_data['facebook'])): ?>
              <a href="<?php echo htmlspecialchars($profile_data['facebook']); ?>" target="_blank" class="social-link facebook">
                <span class="social-icon">👥</span>
                Facebook
              </a>
            <?php endif; ?>
            
            <?php if (!empty($profile_data['twitter'])): ?>
              <a href="<?php echo htmlspecialchars($profile_data['twitter']); ?>" target="_blank" class="social-link twitter">
                <span class="social-icon">🐦</span>
                X (Twitter)
              </a>
            <?php endif; ?>
            
            <?php if (!empty($profile_data['website'])): ?>
              <a href="<?php echo htmlspecialchars($profile_data['website']); ?>" target="_blank" class="social-link website">
                <span class="social-icon">🌐</span>
                Website
              </a>
            <?php endif; ?>
          </div>
        </div>
        
        <!-- Resume Section -->
          <?php if (!empty($profile_data['resume'])): ?>
          <div class="resume-section">
            <div class="section-header">
              <h3 class="section-title">Resume</h3>
              <div class="section-menu">
                <button class="menu-dots" onclick="toggleMenu('resume-menu')">⋯</button>
                <div class="dropdown-menu" id="resume-menu">
                  <a href="#" onclick="editSection('resume')">Edit</a>
                  <a href="#" onclick="uploadResume()">Upload New</a>
                  <a href="#" onclick="deleteSection('resume')">Delete</a>
                </div>
              </div>
            </div>
            <div class="resume-download">
              <a href="/storage/resumes/<?php echo htmlspecialchars($profile_data['resume']); ?>" target="_blank" class="btn btn-primary">
                <span>📄</span> Download Resume
              </a>
        </div>
      </div>
        <?php endif; ?>
        
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

    // 3-dot menu functionality
    function toggleMenu(menuId) {
      // Close all other menus first
      const allMenus = document.querySelectorAll('.dropdown-menu');
      allMenus.forEach(menu => {
        if (menu.id !== menuId) {
          menu.classList.remove('show');
        }
      });
      
      // Toggle current menu
      const menu = document.getElementById(menuId);
      menu.classList.toggle('show');
    }

    // Close menus when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.section-menu')) {
        const allMenus = document.querySelectorAll('.dropdown-menu');
        allMenus.forEach(menu => {
          menu.classList.remove('show');
        });
      }
    });

    // Menu action functions
    function editSection(section) {
      console.log('Edit section:', section);
      // You can implement your edit functionality here
      alert('Edit ' + section + ' functionality will be implemented');
    }

    function addSection(section) {
      console.log('Add new to section:', section);
      // You can implement your add functionality here
      alert('Add new ' + section + ' functionality will be implemented');
    }

    function deleteSection(section) {
      console.log('Delete section:', section);
      if (confirm('Are you sure you want to delete this section?')) {
        // You can implement your delete functionality here
        alert('Delete ' + section + ' functionality will be implemented');
      }
    }

    function uploadResume() {
      console.log('Upload resume');
      // You can implement your upload functionality here
      alert('Upload resume functionality will be implemented');
    }

    function editCoverPhoto() {
      console.log('Edit cover photo');
      // You can implement your cover photo edit functionality here
      alert('Edit cover photo functionality will be implemented');
    }

    function editProfilePhoto() {
      console.log('Edit profile photo');
      // You can implement your profile photo edit functionality here
      alert('Edit profile photo functionality will be implemented');
    }

    function changeLocation() {
      console.log('Change location');
      // You can implement your location change functionality here
      alert('Change location functionality will be implemented');
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Profile page loaded');
    });
  </script>
</body>
</html>
