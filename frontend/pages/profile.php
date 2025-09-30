<?php
require_once '../includes/session.php';

// Require authentication
requireAuth();

// Debug: Check authentication status
if (!isset($_SESSION['auth_token']) || empty($_SESSION['auth_token'])) {
    error_log('Profile page accessed without valid auth token');
    header('Location: ./login.php');
    exit;
}

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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    // Ensure token is available in localStorage on page load
    document.addEventListener('DOMContentLoaded', function() {
      const phpToken = '<?php echo $_SESSION['auth_token'] ?? ''; ?>';
      if (phpToken && typeof localStorage !== 'undefined') {
        localStorage.setItem('auth_token', phpToken);
        const authUser = <?php echo json_encode($_SESSION['auth_user'] ?? null); ?>;
        if (authUser) {
          localStorage.setItem('auth_user', JSON.stringify(authUser));
        }
      }
    });
    
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
                            <button class="btn-resume" onclick="generateResume()" title="Generate Resume">
                                <span class="resume-icon">📄</span>
                                Resume
                            </button>
                        </div>
                        <div class="resume-visibility-toggle">
                            <label class="toggle-label">
                                <input type="checkbox" id="resumeVisibilityToggle" <?php echo ($profile_data['resume_visibility'] ?? 'private') === 'public' ? 'checked' : ''; ?> onchange="toggleResumeVisibility()">
                                <span class="toggle-slider">
                                    <span class="toggle-icon">🔒</span>
                                    <span class="toggle-text">Private</span>
                                </span>
                            </label>
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
        <div class="resume-section">
          <div class="section-header">
            <h3 class="section-title">Resume</h3>
            <div class="section-menu">
              <button class="menu-dots" onclick="toggleMenu('resume-menu')">⋯</button>
              <div class="dropdown-menu" id="resume-menu">
                <a href="#" onclick="generateResume()">Generate Resume</a>
                <?php if (!empty($profile_data['resume'])): ?>
                  <a href="/storage/resumes/<?php echo htmlspecialchars($profile_data['resume']); ?>" target="_blank">Download Uploaded</a>
                  <a href="#" onclick="editSection('resume')">Edit</a>
                  <a href="#" onclick="uploadResume()">Upload New</a>
                  <a href="#" onclick="deleteSection('resume')">Delete</a>
                <?php else: ?>
                  <a href="#" onclick="uploadResume()">Upload Resume</a>
                <?php endif; ?>
              </div>
            </div>
          </div>
          <div class="resume-actions">
            <button class="btn btn-primary" onclick="generateResume()">
              <span>📄</span> Generate Resume
            </button>
            <?php if (!empty($profile_data['resume'])): ?>
              <a href="/storage/resumes/<?php echo htmlspecialchars($profile_data['resume']); ?>" target="_blank" class="btn btn-secondary">
                <span>📥</span> Download Uploaded
              </a>
            <?php endif; ?>
            <div class="resume-status">
              <span class="status-label">Resume Status:</span>
              <span class="status-value <?php echo ($profile_data['resume_visibility'] ?? 'private') === 'public' ? 'public' : 'private'; ?>">
                <?php echo ($profile_data['resume_visibility'] ?? 'private') === 'public' ? '🔓 Public' : '🔒 Private'; ?>
              </span>
            </div>
          </div>
        </div>
        
    </div>
  </div>

  <!-- Popup Modal -->
  <div id="popupModal" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modalTitle">Modal Title</h3>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body" id="modalBody">
        <!-- Dynamic content will be inserted here -->
      </div>
      <div class="modal-footer" id="modalFooter">
        <!-- Dynamic buttons will be inserted here -->
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
      if (!event.target.closest('.section-menu') && 
          !event.target.closest('.cover-photo-menu') && 
          !event.target.closest('.profile-picture-menu')) {
        const allMenus = document.querySelectorAll('.dropdown-menu');
        allMenus.forEach(menu => {
          menu.classList.remove('show');
        });
      }
    });

    // Menu action functions
    function editSection(section) {
      console.log('Edit section:', section);
      
      switch(section) {
        case 'about':
          editAboutSection();
          break;
        case 'experience':
          editExperienceSection();
          break;
        case 'education':
          editEducationSection();
          break;
        case 'skills':
          editSkillsSection();
          break;
        case 'contact':
          editContactSection();
          break;
        case 'social':
          editSocialSection();
          break;
        case 'resume':
          editResumeSection();
          break;
        default:
          alert('Edit ' + section + ' functionality will be implemented');
      }
    }

    function addSection(section) {
      console.log('Add new to section:', section);
      
      switch(section) {
        case 'experience':
          addExperienceItem();
          break;
        case 'education':
          addEducationItem();
          break;
        case 'skills':
          addSkillItem();
          break;
        case 'contact':
          addContactItem();
          break;
        case 'social':
          addSocialItem();
          break;
        default:
          alert('Add new ' + section + ' functionality will be implemented');
      }
    }

    function deleteSection(section) {
      console.log('Delete section:', section);
      
      if (confirm('Are you sure you want to delete this section?')) {
        switch(section) {
          case 'about':
            deleteAboutSection();
            break;
          case 'experience':
            deleteExperienceSection();
            break;
          case 'education':
            deleteEducationSection();
            break;
          case 'skills':
            deleteSkillsSection();
            break;
          case 'contact':
            deleteContactSection();
            break;
          case 'social':
            deleteSocialSection();
            break;
          case 'resume':
            deleteResumeSection();
            break;
          default:
            alert('Delete ' + section + ' functionality will be implemented');
        }
      }
    }

    function uploadResume() {
      const content = `
        <div class="modal-file-upload" onclick="document.getElementById('resumeInput').click()">
          <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
          <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">Upload Resume</div>
          <div style="color: #6b7280;">Click here or drag and drop your resume file</div>
          <div style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Supports: PDF, DOC, DOCX (Max 10MB)</div>
        </div>
        <input type="file" id="resumeInput" accept=".pdf,.doc,.docx" style="display: none;" onchange="handleResumeUpload(this.files[0])">
        <div id="resumePreview" class="modal-file-info" style="display: none;"></div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="document.getElementById('resumeInput').click()">Choose File</button>
      `;
      
      openModal('Upload Resume', content, footer);
    }
    
    function handleResumeUpload(file) {
      if (file) {
        // Show file info
        const preview = document.getElementById('resumePreview');
        if (preview) {
          preview.innerHTML = `
            <strong>Selected file:</strong> ${file.name}<br>
            <strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB<br>
            <strong>Type:</strong> ${file.type}
          `;
          preview.style.display = 'block';
        }
        
        // Upload the file
        uploadResumeFile(file);
        closeModal();
      }
    }

    function editCoverPhoto() {
      const content = `
        <div class="modal-file-upload" onclick="document.getElementById('coverPhotoInput').click()">
          <div style="font-size: 48px; margin-bottom: 16px;">📸</div>
          <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">Upload Cover Photo</div>
          <div style="color: #6b7280;">Click here or drag and drop an image file</div>
          <div style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Supports: JPG, PNG, GIF (Max 5MB)</div>
        </div>
        <input type="file" id="coverPhotoInput" accept="image/*" style="display: none;" onchange="handleCoverPhotoUpload(this.files[0])">
        <div id="coverPhotoPreview" class="modal-file-info" style="display: none;"></div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="document.getElementById('coverPhotoInput').click()">Choose File</button>
      `;
      
      openModal('Edit Cover Photo', content, footer);
    }
    
    function handleCoverPhotoUpload(file) {
      if (file) {
        // Show file info
        const preview = document.getElementById('coverPhotoPreview');
        if (preview) {
          preview.innerHTML = `
            <strong>Selected file:</strong> ${file.name}<br>
            <strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB<br>
            <strong>Type:</strong> ${file.type}
          `;
          preview.style.display = 'block';
        }
        
        // Upload the file
        uploadCoverPhoto(file);
        closeModal();
      }
    }

    function editProfilePhoto() {
      const content = `
        <div class="modal-file-upload" onclick="document.getElementById('profilePhotoInput').click()">
          <div style="font-size: 48px; margin-bottom: 16px;">👤</div>
          <div style="font-size: 18px; font-weight: 500; margin-bottom: 8px;">Upload Profile Photo</div>
          <div style="color: #6b7280;">Click here or drag and drop an image file</div>
          <div style="font-size: 14px; color: #9ca3af; margin-top: 8px;">Supports: JPG, PNG, GIF (Max 5MB)</div>
        </div>
        <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;" onchange="handleProfilePhotoUpload(this.files[0])">
        <div id="profilePhotoPreview" class="modal-file-info" style="display: none;"></div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="document.getElementById('profilePhotoInput').click()">Choose File</button>
      `;
      
      openModal('Edit Profile Photo', content, footer);
    }
    
    function handleProfilePhotoUpload(file) {
      if (file) {
        // Show file info
        const preview = document.getElementById('profilePhotoPreview');
        if (preview) {
          preview.innerHTML = `
            <strong>Selected file:</strong> ${file.name}<br>
            <strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB<br>
            <strong>Type:</strong> ${file.type}
          `;
          preview.style.display = 'block';
        }
        
        // Upload the file
        uploadProfilePhoto(file);
        closeModal();
      }
    }

    function changeLocation() {
      const currentCity = '<?php echo htmlspecialchars($profile_data['location_city'] ?? ''); ?>';
      const currentCountry = '<?php echo htmlspecialchars($profile_data['location_country'] ?? ''); ?>';
      
      const content = `
        <div class="modal-form-group">
          <label for="locationCity">City</label>
          <input type="text" id="locationCity" value="${currentCity}" placeholder="Enter your city">
        </div>
        <div class="modal-form-group">
          <label for="locationCountry">Country</label>
          <input type="text" id="locationCountry" value="${currentCountry}" placeholder="Enter your country">
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveLocation()">Save Location</button>
      `;
      
      openModal('Change Location', content, footer);
    }
    
    function saveLocation() {
      const city = document.getElementById('locationCity').value.trim();
      const country = document.getElementById('locationCountry').value.trim();
      
      if (city && country) {
        updateLocation(city, country);
        closeModal();
      } else {
        showErrorMessage('Please enter both city and country');
      }
    }

    // Specific section edit functions
    function editAboutSection() {
      const currentBio = document.querySelector('.about-text').textContent;
      
      const content = `
        <div class="modal-form-group">
          <label for="bioText">About Me</label>
          <textarea id="bioText" placeholder="Tell us about yourself..." rows="6">${currentBio}</textarea>
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveBio()">Save Bio</button>
      `;
      
      openModal('Edit About Section', content, footer);
    }
    
    function saveBio() {
      const newBio = document.getElementById('bioText').value.trim();
      const currentBio = document.querySelector('.about-text').textContent;
      
      if (newBio !== currentBio) {
        updateProfileField('bio', newBio);
        document.querySelector('.about-text').textContent = newBio;
        showSuccessMessage('Bio updated successfully!');
        closeModal();
      } else {
        closeModal();
      }
    }

    function editExperienceSection() {
      const experienceItems = document.querySelectorAll('.experience-item');
      if (experienceItems.length === 0) {
        addExperienceItem();
        return;
      }
      
      const index = prompt('Enter experience item number to edit (1-' + experienceItems.length + '):');
      if (index && index >= 1 && index <= experienceItems.length) {
        editExperienceItem(parseInt(index) - 1);
      }
    }

    function addExperienceItem() {
      const content = `
        <div class="modal-form-group">
          <label for="expTitle">Job Title *</label>
          <input type="text" id="expTitle" placeholder="e.g., Senior Software Engineer" required>
        </div>
        <div class="modal-form-group">
          <label for="expCompany">Company *</label>
          <input type="text" id="expCompany" placeholder="e.g., TechCorp Inc." required>
        </div>
        <div class="modal-form-group">
          <label for="expDuration">Duration *</label>
          <input type="text" id="expDuration" placeholder="e.g., Jan 2022 - Present" required>
        </div>
        <div class="modal-form-group">
          <label for="expDescription">Description</label>
          <textarea id="expDescription" placeholder="Describe your role and achievements..." rows="4"></textarea>
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveExperience()">Add Experience</button>
      `;
      
      openModal('Add Experience', content, footer);
    }
    
    function saveExperience() {
      const title = document.getElementById('expTitle').value.trim();
      const company = document.getElementById('expCompany').value.trim();
      const duration = document.getElementById('expDuration').value.trim();
      const description = document.getElementById('expDescription').value.trim();
      
      if (title && company && duration) {
        addExperienceToProfile(title, company, duration, description);
        showSuccessMessage('Experience added successfully!');
        closeModal();
      } else {
        showErrorMessage('Please fill in all required fields');
      }
    }

    function editExperienceItem(index) {
      const items = document.querySelectorAll('.experience-item');
      if (items[index]) {
        const title = prompt('Job Title:', items[index].querySelector('.experience-title').textContent);
        const company = prompt('Company:', items[index].querySelector('.experience-company').textContent);
        const duration = prompt('Duration:', items[index].querySelector('.experience-duration').textContent);
        const description = prompt('Description:', items[index].querySelector('.experience-description').textContent);
        
        if (title && company && duration) {
          updateExperienceItem(index, title, company, duration, description);
        }
      }
    }

    function editEducationSection() {
      const educationItems = document.querySelectorAll('.education-item');
      if (educationItems.length === 0) {
        addEducationItem();
        return;
      }
      
      const index = prompt('Enter education item number to edit (1-' + educationItems.length + '):');
      if (index && index >= 1 && index <= educationItems.length) {
        editEducationItem(parseInt(index) - 1);
      }
    }

    function addEducationItem() {
      const content = `
        <div class="modal-form-group">
          <label for="eduDegree">Degree *</label>
          <input type="text" id="eduDegree" placeholder="e.g., Bachelor of Science in Computer Science" required>
        </div>
        <div class="modal-form-group">
          <label for="eduSchool">School/University *</label>
          <input type="text" id="eduSchool" placeholder="e.g., University of California, Berkeley" required>
        </div>
        <div class="modal-form-group">
          <label for="eduDuration">Duration *</label>
          <input type="text" id="eduDuration" placeholder="e.g., 2016 - 2020" required>
        </div>
        <div class="modal-form-group">
          <label for="eduDescription">Description</label>
          <textarea id="eduDescription" placeholder="Additional details about your education..." rows="4"></textarea>
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveEducation()">Add Education</button>
      `;
      
      openModal('Add Education', content, footer);
    }
    
    function saveEducation() {
      const degree = document.getElementById('eduDegree').value.trim();
      const school = document.getElementById('eduSchool').value.trim();
      const duration = document.getElementById('eduDuration').value.trim();
      const description = document.getElementById('eduDescription').value.trim();
      
      if (degree && school && duration) {
        addEducationToProfile(degree, school, duration, description);
        showSuccessMessage('Education added successfully!');
        closeModal();
      } else {
        showErrorMessage('Please fill in all required fields');
      }
    }

    function editEducationItem(index) {
      const items = document.querySelectorAll('.education-item');
      if (items[index]) {
        const degree = prompt('Degree:', items[index].querySelector('.education-degree').textContent);
        const school = prompt('School:', items[index].querySelector('.education-school').textContent);
        const duration = prompt('Duration:', items[index].querySelector('.education-duration').textContent);
        const description = prompt('Description:', items[index].querySelector('.education-description').textContent);
        
        if (degree && school && duration) {
          updateEducationItem(index, degree, school, duration, description);
        }
      }
    }

    function editSkillsSection() {
      const currentSkills = Array.from(document.querySelectorAll('.skill-tag')).map(tag => tag.textContent).join(', ');
      
      const content = `
        <div class="modal-form-group">
          <label for="skillsText">Skills</label>
          <textarea id="skillsText" placeholder="Enter your skills separated by commas..." rows="4">${currentSkills}</textarea>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Separate multiple skills with commas (e.g., JavaScript, React, Node.js)</div>
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveSkills()">Save Skills</button>
      `;
      
      openModal('Edit Skills', content, footer);
    }
    
    function saveSkills() {
      const newSkills = document.getElementById('skillsText').value.trim();
      const currentSkills = Array.from(document.querySelectorAll('.skill-tag')).map(tag => tag.textContent).join(', ');
      
      if (newSkills !== currentSkills) {
        updateProfileField('skills', newSkills);
        updateSkillsDisplay(newSkills);
        showSuccessMessage('Skills updated successfully!');
        closeModal();
      } else {
        closeModal();
      }
    }

    function addSkillItem() {
      const content = `
        <div class="modal-form-group">
          <label for="newSkill">Add New Skill</label>
          <input type="text" id="newSkill" placeholder="e.g., Python, Machine Learning, etc.">
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveNewSkill()">Add Skill</button>
      `;
      
      openModal('Add New Skill', content, footer);
    }
    
    function saveNewSkill() {
      const skill = document.getElementById('newSkill').value.trim();
      if (skill) {
        const currentSkills = Array.from(document.querySelectorAll('.skill-tag')).map(tag => tag.textContent);
        if (!currentSkills.includes(skill)) {
          currentSkills.push(skill);
          updateProfileField('skills', currentSkills.join(', '));
          updateSkillsDisplay(currentSkills.join(', '));
          showSuccessMessage('Skill added successfully!');
          closeModal();
        } else {
          showErrorMessage('Skill already exists!');
        }
      } else {
        showErrorMessage('Please enter a skill name');
      }
    }

    function editContactSection() {
      const currentEmail = '<?php echo htmlspecialchars($profile_data['email'] ?? ''); ?>';
      const currentPhone = '<?php echo htmlspecialchars($profile_data['phone'] ?? ''); ?>';
      
      const content = `
        <div class="modal-form-group">
          <label for="contactEmail">Email</label>
          <input type="email" id="contactEmail" value="${currentEmail}" placeholder="your.email@example.com">
        </div>
        <div class="modal-form-group">
          <label for="contactPhone">Phone</label>
          <input type="tel" id="contactPhone" value="${currentPhone}" placeholder="+1 (555) 123-4567">
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveContactInfo()">Save Contact Info</button>
      `;
      
      openModal('Edit Contact Information', content, footer);
    }
    
    function saveContactInfo() {
      const email = document.getElementById('contactEmail').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      
        updateContactInfo(email, phone);
      closeModal();
    }

    function addContactItem() {
      const content = `
        <div class="modal-form-group">
          <label for="contactType">Contact Type</label>
          <select id="contactType">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </div>
        <div class="modal-form-group">
          <label for="contactValue">Contact Value</label>
          <input type="text" id="contactValue" placeholder="Enter email or phone number">
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveNewContact()">Add Contact</button>
      `;
      
      openModal('Add Contact Information', content, footer);
    }
    
    function saveNewContact() {
      const type = document.getElementById('contactType').value;
      const value = document.getElementById('contactValue').value.trim();
      
      if (value) {
        if (type === 'email') {
          updateProfileField('email', value);
        } else if (type === 'phone') {
          updateProfileField('phone', value);
        }
        showSuccessMessage('Contact information added successfully!');
        location.reload(); // Refresh to show changes
        closeModal();
      } else {
        showErrorMessage('Please enter a contact value');
      }
    }

    function editSocialSection() {
      const currentLinkedin = '<?php echo htmlspecialchars($profile_data['linkedin'] ?? ''); ?>';
      const currentGithub = '<?php echo htmlspecialchars($profile_data['github'] ?? ''); ?>';
      const currentWebsite = '<?php echo htmlspecialchars($profile_data['website'] ?? ''); ?>';
      const currentInstagram = '<?php echo htmlspecialchars($profile_data['instagram'] ?? ''); ?>';
      const currentFacebook = '<?php echo htmlspecialchars($profile_data['facebook'] ?? ''); ?>';
      const currentTwitter = '<?php echo htmlspecialchars($profile_data['twitter'] ?? ''); ?>';
      
      const content = `
        <div class="modal-form-group">
          <label for="socialLinkedin">LinkedIn URL</label>
          <input type="url" id="socialLinkedin" value="${currentLinkedin}" placeholder="https://linkedin.com/in/yourprofile">
        </div>
        <div class="modal-form-group">
          <label for="socialGithub">GitHub URL</label>
          <input type="url" id="socialGithub" value="${currentGithub}" placeholder="https://github.com/yourusername">
        </div>
        <div class="modal-form-group">
          <label for="socialWebsite">Website URL</label>
          <input type="url" id="socialWebsite" value="${currentWebsite}" placeholder="https://yourwebsite.com">
        </div>
        <div class="modal-form-group">
          <label for="socialInstagram">Instagram URL</label>
          <input type="url" id="socialInstagram" value="${currentInstagram}" placeholder="https://instagram.com/yourusername">
        </div>
        <div class="modal-form-group">
          <label for="socialFacebook">Facebook URL</label>
          <input type="url" id="socialFacebook" value="${currentFacebook}" placeholder="https://facebook.com/yourprofile">
        </div>
        <div class="modal-form-group">
          <label for="socialTwitter">Twitter URL</label>
          <input type="url" id="socialTwitter" value="${currentTwitter}" placeholder="https://twitter.com/yourusername">
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveSocialLinks()">Save Social Links</button>
      `;
      
      openModal('Edit Social Links', content, footer);
    }
    
    function saveSocialLinks() {
      const linkedin = document.getElementById('socialLinkedin').value.trim();
      const github = document.getElementById('socialGithub').value.trim();
      const website = document.getElementById('socialWebsite').value.trim();
      const instagram = document.getElementById('socialInstagram').value.trim();
      const facebook = document.getElementById('socialFacebook').value.trim();
      const twitter = document.getElementById('socialTwitter').value.trim();
      
      updateSocialLinks(linkedin, github, website, instagram, facebook, twitter);
      closeModal();
    }

    function addSocialItem() {
      const content = `
        <div class="modal-form-group">
          <label for="socialPlatform">Social Platform</label>
          <select id="socialPlatform">
            <option value="linkedin">LinkedIn</option>
            <option value="github">GitHub</option>
            <option value="website">Website</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
          </select>
        </div>
        <div class="modal-form-group">
          <label for="socialUrl">URL</label>
          <input type="url" id="socialUrl" placeholder="https://...">
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveNewSocialLink()">Add Social Link</button>
      `;
      
      openModal('Add Social Link', content, footer);
    }
    
    function saveNewSocialLink() {
      const platform = document.getElementById('socialPlatform').value;
      const url = document.getElementById('socialUrl').value.trim();
      
      if (url) {
        updateProfileField(platform, url);
        showSuccessMessage('Social link added successfully!');
        location.reload(); // Refresh to show changes
        closeModal();
      } else {
        showErrorMessage('Please enter a valid URL');
      }
    }

    function editResumeSection() {
      const content = `
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
          <h4>Resume Management</h4>
          <p style="color: #6b7280;">Choose an action for your resume</p>
        </div>
        <div style="display: flex; gap: 12px; flex-direction: column;">
          <button class="modal-btn modal-btn-primary" onclick="uploadResume(); closeModal();" style="width: 100%;">
            📤 Upload New Resume
          </button>
          <button class="modal-btn modal-btn-secondary" onclick="editResumeInfo(); closeModal();" style="width: 100%;">
            ✏️ Edit Resume Info
          </button>
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
      `;
      
      openModal('Resume Options', content, footer);
    }
    
    function editResumeInfo() {
        const currentResume = '<?php echo htmlspecialchars($profile_data['resume'] ?? ''); ?>';
      
      const content = `
        <div class="modal-form-group">
          <label for="resumeFilename">Resume Filename</label>
          <input type="text" id="resumeFilename" value="${currentResume}" placeholder="resume.pdf">
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Enter the filename of your resume</div>
        </div>
      `;
      
      const footer = `
        <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="modal-btn modal-btn-primary" onclick="saveResumeInfo()">Save Resume Info</button>
      `;
      
      openModal('Edit Resume Info', content, footer);
    }
    
    function saveResumeInfo() {
      const newResume = document.getElementById('resumeFilename').value.trim();
      const currentResume = '<?php echo htmlspecialchars($profile_data['resume'] ?? ''); ?>';
      
        if (newResume && newResume !== currentResume) {
          updateProfileField('resume', newResume);
        showSuccessMessage('Resume info updated successfully!');
          location.reload();
        closeModal();
      } else {
        closeModal();
      }
    }

    // Delete section functions
    async function deleteAboutSection() {
      try {
        await updateProfileField('bio', '');
      document.querySelector('.about-text').textContent = 'No bio available.';
        showSuccessMessage('About section cleared successfully!');
      } catch (error) {
        console.error('Error deleting about section:', error);
        showErrorMessage('Error clearing about section: ' + error.message);
      }
    }

    async function deleteExperienceSection() {
      if (confirm('Delete all experience items?')) {
        try {
          await updateProfileField('experience', '');
        document.querySelector('.experience-list').innerHTML = '<p>No experience listed.</p>';
          showSuccessMessage('Experience section cleared successfully!');
        } catch (error) {
          console.error('Error deleting experience:', error);
          showErrorMessage('Error clearing experience section: ' + error.message);
        }
      }
    }

    async function deleteEducationSection() {
      if (confirm('Delete all education items?')) {
        try {
          await updateProfileField('education', '');
        document.querySelector('.education-list').innerHTML = '<p>No education listed.</p>';
          showSuccessMessage('Education section cleared successfully!');
        } catch (error) {
          console.error('Error deleting education:', error);
          showErrorMessage('Error clearing education section: ' + error.message);
        }
      }
    }

    async function deleteSkillsSection() {
      if (confirm('Delete all skills?')) {
        try {
          await updateProfileField('skills', '');
        document.querySelector('.skills-list').innerHTML = '<p>No skills listed.</p>';
          showSuccessMessage('Skills section cleared successfully!');
        } catch (error) {
          console.error('Error deleting skills:', error);
          showErrorMessage('Error clearing skills section: ' + error.message);
        }
      }
    }

    async function deleteContactSection() {
      if (confirm('Delete all contact information?')) {
        try {
          await Promise.all([
            updateProfileField('email', ''),
            updateProfileField('phone', '')
          ]);
        document.querySelector('.contact-info').innerHTML = '<p>No contact information available.</p>';
          showSuccessMessage('Contact information cleared successfully!');
        } catch (error) {
          console.error('Error deleting contact info:', error);
          showErrorMessage('Error clearing contact information: ' + error.message);
        }
      }
    }

    async function deleteSocialSection() {
      if (confirm('Delete all social links?')) {
        try {
          await Promise.all([
            updateProfileField('linkedin', ''),
            updateProfileField('github', ''),
            updateProfileField('website', ''),
            updateProfileField('instagram', ''),
            updateProfileField('facebook', ''),
            updateProfileField('twitter', '')
          ]);
        document.querySelector('.social-links').innerHTML = '<p>No social links available.</p>';
          showSuccessMessage('Social links cleared successfully!');
        } catch (error) {
          console.error('Error deleting social links:', error);
          showErrorMessage('Error clearing social links: ' + error.message);
        }
      }
    }

    async function deleteResumeSection() {
      if (confirm('Delete resume?')) {
        try {
          await updateProfileField('resume', '');
        const resumeSection = document.querySelector('.resume-section');
        if (resumeSection) {
          resumeSection.remove();
          }
          showSuccessMessage('Resume deleted successfully!');
        } catch (error) {
          console.error('Error deleting resume:', error);
          showErrorMessage('Error deleting resume: ' + error.message);
        }
      }
    }

    // Helper function to get authentication token
    function getAuthToken() {
      let authToken = '';
      
      // First try localStorage (for JavaScript API calls)
      if (typeof localStorage !== 'undefined') {
        authToken = localStorage.getItem('auth_token') || '';
      }
      
      // Fallback to PHP session if localStorage is empty
      if (!authToken) {
        authToken = '<?php echo $_SESSION['auth_token'] ?? ''; ?>';
      }
      
      return authToken;
    }

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      const token = getAuthToken();
      return token && token.length > 0;
    }

    // Helper function to handle authentication errors
    function handleAuthError(error) {
      console.error('Authentication error:', error);
      showErrorMessage('Session expired, please log in again.');
      setTimeout(() => {
        // Clear localStorage
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
        window.location.href = './login.php';
      }, 2000);
    }

    // Helper functions for API calls
    async function updateProfileField(field, value) {
      // Check authentication
      if (!isAuthenticated()) {
        showErrorMessage('Session expired, please log in again.');
        setTimeout(() => {
          window.location.href = './login.php';
        }, 2000);
        return;
      }
      
      const authToken = getAuthToken();
      
      try {
        const response = await fetch(window.APP_API_BASE + '/profile/<?php echo $user['id']; ?>', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken,
            'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
          },
          body: JSON.stringify({ [field]: value })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        
        console.log('Profile updated successfully');
        return true;
      } catch (error) {
        console.error('Error updating profile:', error);
        showErrorMessage('Error updating profile: ' + error.message);
        return false;
      }
    }

    // Enhanced file upload function
    async function uploadFile(endpoint, file, fieldName) {
      const formData = new FormData();
      formData.append(fieldName, file);
      
      // Check authentication
      if (!isAuthenticated()) {
        throw new Error('Session expired, please log in again.');
      }
      
      const authToken = getAuthToken();
      const csrfToken = '<?php echo $_SESSION['csrf_token'] ?? ''; ?>';
      
        // Debug logging
        console.log('=== UPLOAD DEBUG INFO ===');
        console.log('Endpoint:', endpoint);
        console.log('File details:', { name: file.name, size: file.size, type: file.type });
        console.log('Auth token present:', !!authToken);
        console.log('Auth token length:', authToken ? authToken.length : 0);
        console.log('Auth token preview:', authToken ? authToken.substring(0, 10) + '...' : 'N/A');
        console.log('CSRF token present:', !!csrfToken);
        console.log('CSRF token preview:', csrfToken ? csrfToken.substring(0, 10) + '...' : 'N/A');
        console.log('API Base URL:', window.APP_API_BASE);
        console.log('Full URL:', window.APP_API_BASE + endpoint);
        console.log('User ID from PHP:', '<?php echo $user['id']; ?>');
        console.log('Session auth_user:', <?php echo json_encode($_SESSION['auth_user'] ?? null); ?>);
        
        // Test authentication by making a simple API call first
        try {
          const testResponse = await fetch(window.APP_API_BASE + '/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + authToken,
              'Content-Type': 'application/json'
            }
          });
          console.log('Auth test response status:', testResponse.status);
          if (testResponse.ok) {
            const testResult = await testResponse.json();
            console.log('Auth test successful, user:', testResult);
          } else {
            console.error('Auth test failed:', await testResponse.text());
          }
        } catch (authError) {
          console.error('Auth test error:', authError);
        }
      
      if (!authToken) {
        throw new Error('User not authenticated, please log in again');
      }
      
      try {
        const headers = {
          'Authorization': 'Bearer ' + authToken
        };
        
        // Add CSRF token if available
        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken;
        }
        
        console.log('Request headers:', headers);
        
        const response = await fetch(window.APP_API_BASE + endpoint, {
          method: 'POST',
          headers: headers,
          body: formData
          // Note: Don't set Content-Type for FormData - browser sets it automatically with boundary
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed - Status:', response.status);
          console.error('Upload failed - Response:', errorText);
          
          // Handle 401 specifically
          if (response.status === 401) {
            handleAuthError('Authentication failed');
            return;
          }
          
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Upload successful:', result);
        return result;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    }

    async function uploadCoverPhoto(file) {
      try {
        console.log('Starting cover photo upload...', file);
        
        // Validate file
        if (!file) {
          throw new Error('No file selected');
        }
        
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size must be less than 5MB');
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file');
        }
        
        // Upload the file
        const result = await uploadFile(`/profile/<?php echo $user['id']; ?>/cover-photo`, file, 'cover_photo');
        console.log('Cover photo upload result:', result);
        
        // Show success message immediately
        showSuccessMessage('Cover photo uploaded successfully!');
        
        // Update cover photo display immediately with the uploaded file
        const reader = new FileReader();
        reader.onload = function(e) {
          const coverPhoto = document.getElementById('cover-photo');
          if (coverPhoto) {
            coverPhoto.style.backgroundImage = `url(${e.target.result})`;
            const placeholder = coverPhoto.querySelector('.cover-photo-placeholder');
            if (placeholder) {
              placeholder.style.display = 'none';
            }
          }
        };
        reader.readAsDataURL(file);
        
        // Reload page after a short delay to show the new image from server
        setTimeout(() => {
          location.reload();
        }, 1500);
        
      } catch (error) {
        console.error('Error uploading cover photo:', error);
        if (error.message.includes('Session expired')) {
          handleAuthError(error);
        } else {
          showErrorMessage('Error uploading cover photo: ' + error.message);
        }
      }
    }

    async function uploadProfilePhoto(file) {
      try {
        console.log('Starting profile photo upload...', file);
        
        // Validate file
        if (!file) {
          throw new Error('No file selected');
        }
        
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size must be less than 5MB');
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file');
        }
        
        // Upload the file
        const result = await uploadFile(`/profile/<?php echo $user['id']; ?>/profile-photo`, file, 'profile_photo');
        console.log('Profile photo upload result:', result);
        
        // Show success message immediately
        showSuccessMessage('Profile photo uploaded successfully!');
        
        // Update profile photo display immediately with the uploaded file
        const reader = new FileReader();
        reader.onload = function(e) {
          const profilePicture = document.getElementById('profile-picture');
          if (profilePicture) {
            profilePicture.style.backgroundImage = `url(${e.target.result})`;
            const placeholder = profilePicture.querySelector('.profile-picture-placeholder');
            if (placeholder) {
              placeholder.style.display = 'none';
            }
          }
        };
        reader.readAsDataURL(file);
        
        // Reload page after a short delay to show the new image from server
        setTimeout(() => {
          location.reload();
        }, 1500);
        
      } catch (error) {
        console.error('Error uploading profile photo:', error);
        if (error.message.includes('Session expired')) {
          handleAuthError(error);
        } else {
          showErrorMessage('Error uploading profile photo: ' + error.message);
        }
      }
    }

    async function uploadResumeFile(file) {
      try {
        await uploadFile(`/profile/<?php echo $user['id']; ?>/resume`, file, 'resume');
        
        showSuccessMessage('Resume uploaded successfully!');
        location.reload(); // Refresh to show new resume
      } catch (error) {
        console.error('Error uploading resume:', error);
        showErrorMessage('Error uploading resume: ' + error.message);
      }
    }

    async function updateLocation(city, country) {
      try {
        await updateProfileField('location_city', city);
        await updateProfileField('location_country', country);
        
        // Update location display
        const locationElement = document.querySelector('.profile-location');
        locationElement.innerHTML = `<span class="location-icon">📍</span>${city}, ${country}`;
        
        showSuccessMessage('Location updated successfully!');
      } catch (error) {
        console.error('Error updating location:', error);
        showErrorMessage('Error updating location: ' + error.message);
      }
    }

    function updateSkillsDisplay(skills) {
      const skillsList = document.querySelector('.skills-list');
      const skillTags = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      
      skillsList.innerHTML = skillTags.map(skill => 
        `<span class="skill-tag">${skill}</span>`
      ).join('');
    }

    async function updateContactInfo(email, phone) {
      try {
        await updateProfileField('email', email);
        await updateProfileField('phone', phone);
        
        // Update contact display
        const contactInfo = document.querySelector('.contact-info');
        contactInfo.innerHTML = `
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <span class="contact-label">Email:</span>
            <a href="mailto:${email}" class="contact-value">${email}</a>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📱</span>
            <span class="contact-label">Phone:</span>
            <a href="tel:${phone}" class="contact-value">${phone}</a>
          </div>
        `;
        
        showSuccessMessage('Contact information updated successfully!');
      } catch (error) {
        console.error('Error updating contact info:', error);
        showErrorMessage('Error updating contact info: ' + error.message);
      }
    }

    async function updateSocialLinks(linkedin, github, website, instagram, facebook, twitter) {
      try {
        await Promise.all([
          updateProfileField('linkedin', linkedin),
          updateProfileField('github', github),
          updateProfileField('website', website),
          updateProfileField('instagram', instagram),
          updateProfileField('facebook', facebook),
          updateProfileField('twitter', twitter)
        ]);
        
        showSuccessMessage('Social links updated successfully!');
        location.reload(); // Refresh to show changes
      } catch (error) {
        console.error('Error updating social links:', error);
        showErrorMessage('Error updating social links: ' + error.message);
      }
    }


    function getCurrentExperience() {
      // Parse experience from the DOM or profile data
      const experienceItems = document.querySelectorAll('.experience-item');
      const experience = [];
      
      experienceItems.forEach(item => {
        const title = item.querySelector('.experience-title')?.textContent || '';
        const company = item.querySelector('.experience-company')?.textContent || '';
        const duration = item.querySelector('.experience-duration')?.textContent || '';
        const description = item.querySelector('.experience-description')?.textContent || '';
        
        if (title && company) {
          experience.push({ title, company, duration, description });
        }
      });
      
      return experience;
    }

    function getCurrentEducation() {
      // Parse education from the DOM or profile data
      const educationItems = document.querySelectorAll('.education-item');
      const education = [];
      
      educationItems.forEach(item => {
        const degree = item.querySelector('.education-degree')?.textContent || '';
        const school = item.querySelector('.education-school')?.textContent || '';
        const duration = item.querySelector('.education-duration')?.textContent || '';
        const description = item.querySelector('.education-description')?.textContent || '';
        
        if (degree && school) {
          education.push({ degree, school, duration, description });
        }
      });
      
      return education;
    }

    // Enhanced experience management
    function addExperienceToProfile(title, company, duration, description) {
      const experienceList = document.querySelector('.experience-list');
      
      // Check if there's a "no experience" message and remove it
      const noExperienceMsg = experienceList.querySelector('p');
      if (noExperienceMsg && noExperienceMsg.textContent.includes('No experience')) {
        noExperienceMsg.remove();
      }
      
      const experienceItem = document.createElement('div');
      experienceItem.className = 'experience-item';
      experienceItem.innerHTML = `
        <div class="experience-header">
          <h4 class="experience-title">${title}</h4>
          <p class="experience-company">${company}</p>
          <p class="experience-duration">${duration}</p>
        </div>
        <p class="experience-description">${description || ''}</p>
      `;
      experienceList.appendChild(experienceItem);
      
      // Update profile data
      const currentExperience = getCurrentExperience();
      updateProfileField('experience', JSON.stringify(currentExperience));
    }

    function addEducationToProfile(degree, school, duration, description) {
      const educationList = document.querySelector('.education-list');
      
      // Check if there's a "no education" message and remove it
      const noEducationMsg = educationList.querySelector('p');
      if (noEducationMsg && noEducationMsg.textContent.includes('No education')) {
        noEducationMsg.remove();
      }
      
      const educationItem = document.createElement('div');
      educationItem.className = 'education-item';
      educationItem.innerHTML = `
        <div class="education-header">
          <h4 class="education-degree">${degree}</h4>
          <p class="education-school">${school}</p>
          <p class="education-duration">${duration}</p>
        </div>
        <p class="education-description">${description || ''}</p>
      `;
      educationList.appendChild(educationItem);
      
      // Update profile data
      const currentEducation = getCurrentEducation();
      updateProfileField('education', JSON.stringify(currentEducation));
    }

    function updateExperienceItem(index, title, company, duration, description) {
      const items = document.querySelectorAll('.experience-item');
      if (items[index]) {
        items[index].querySelector('.experience-title').textContent = title;
        items[index].querySelector('.experience-company').textContent = company;
        items[index].querySelector('.experience-duration').textContent = duration;
        items[index].querySelector('.experience-description').textContent = description;
      }
    }

    function updateEducationItem(index, degree, school, duration, description) {
      const items = document.querySelectorAll('.education-item');
      if (items[index]) {
        items[index].querySelector('.education-degree').textContent = degree;
        items[index].querySelector('.education-school').textContent = school;
        items[index].querySelector('.education-duration').textContent = duration;
        items[index].querySelector('.education-description').textContent = description;
      }
    }

    // Utility functions for better UX
    function showLoading(element, text = 'Loading...') {
      if (element) {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
        const originalText = element.textContent;
        element.textContent = text;
        return () => {
          element.style.opacity = '1';
          element.style.pointerEvents = 'auto';
          element.textContent = originalText;
        };
      }
      return () => {};
    }

    function showSuccessMessage(message) {
      // Create a temporary success message
      const successDiv = document.createElement('div');
      successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
      `;
      successDiv.textContent = message;
      document.body.appendChild(successDiv);
      
      // Remove after 3 seconds
      setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => successDiv.remove(), 300);
      }, 3000);
    }

    function showErrorMessage(message) {
      // Create a temporary error message
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
      `;
      errorDiv.textContent = message;
      document.body.appendChild(errorDiv);
      
      // Remove after 5 seconds
      setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => errorDiv.remove(), 300);
      }, 5000);
    }

    // Add CSS animations and modal styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      /* Dropdown Menu Styles */
      .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        min-width: 160px;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s ease;
        margin-top: 4px;
      }
      
      .dropdown-menu.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .dropdown-menu a {
        display: block;
        padding: 12px 16px;
        color: #374151;
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .dropdown-menu a:last-child {
        border-bottom: none;
      }
      
      .dropdown-menu a:hover {
        background: #f8fafc;
        color: #1f2937;
      }
      
      .section-menu {
        position: relative;
        display: inline-block;
      }
      
      .menu-dots {
        background: none;
        border: none;
        font-size: 20px;
        color: #6b7280;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        line-height: 1;
      }
      
      .menu-dots:hover {
        background: #f3f4f6;
        color: #374151;
      }
      
      .cover-photo-menu,
      .profile-picture-menu {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 10;
      }
      
      .cover-photo-menu .dropdown-menu,
      .profile-picture-menu .dropdown-menu {
        right: 0;
        left: auto;
      }
      
      /* Section Headers */
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      
      .section-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f293b;
      }
      
      /* Profile Sections */
      .about-section,
      .experience-section,
      .education-section,
      .skills-section,
      .contact-section,
      .social-section,
      .resume-section {
        background: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
      }
      
      .profile-header-linkedin {
        background: white;
        border-radius: 12px;
        margin-bottom: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
        overflow: hidden;
      }
      
      /* Mobile Navigation Styles */
      .mobile-nav {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        display: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .mobile-nav.show {
        display: flex;
        opacity: 1;
      }
      
      .mobile-nav-content {
        background: white;
        width: 280px;
        height: 100%;
        margin-left: auto;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
      }
      
      .mobile-nav.show .mobile-nav-content {
        transform: translateX(0);
      }
      
      .mobile-nav-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .mobile-nav-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
      }
      
      .mobile-nav-links {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      .mobile-nav-links span {
        padding: 12px 16px;
        color: #374151;
        cursor: pointer;
        border-radius: 8px;
        transition: background-color 0.2s ease;
        font-weight: 500;
      }
      
      .mobile-nav-links span:hover {
        background: #f3f4f6;
      }
      
      .mobile-nav-links .btn {
        margin-top: 20px;
        text-align: center;
        text-decoration: none;
      }
      
      /* Hamburger Menu */
      .hamburger {
        display: none;
        flex-direction: column;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        gap: 4px;
      }
      
      .hamburger span {
        width: 25px;
        height: 3px;
        background: #374151;
        transition: all 0.3s ease;
        border-radius: 2px;
      }
      
      .hamburger.active span:nth-child(1) {
        transform: rotate(45deg) translate(6px, 6px);
      }
      
      .hamburger.active span:nth-child(2) {
        opacity: 0;
      }
      
      .hamburger.active span:nth-child(3) {
        transform: rotate(-45deg) translate(6px, -6px);
      }
      
      @media (max-width: 768px) {
        .hamburger {
          display: flex;
        }
        
        .nav {
          display: none;
        }
      }

      /* Modal Styles */
      .modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }
      
      .modal-overlay.show {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .modal-content {
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease;
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .modal-header h3 {
        margin: 0;
        color: #1e293b;
        font-size: 1.25rem;
        font-weight: 600;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #64748b;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }
      
      .modal-close:hover {
        background: #f1f5f9;
        color: #334155;
      }
      
      .modal-body {
        padding: 24px;
      }
      
      .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
      
      .modal-form-group {
        margin-bottom: 20px;
      }
      
      .modal-form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #374151;
      }
      
      .modal-form-group input,
      .modal-form-group textarea,
      .modal-form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s;
      }
      
      .modal-form-group input:focus,
      .modal-form-group textarea:focus,
      .modal-form-group select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .modal-form-group textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .modal-file-upload {
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .modal-file-upload:hover {
        border-color: #3b82f6;
        background: #f8fafc;
      }
      
      .modal-file-upload.dragover {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      .modal-file-info {
        margin-top: 10px;
        font-size: 14px;
        color: #6b7280;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .modal-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .modal-btn-primary {
        background: #3b82f6;
        color: white;
      }
      
      .modal-btn-primary:hover {
        background: #2563eb;
      }
      
      .modal-btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }
      
      .modal-btn-secondary:hover {
        background: #e5e7eb;
      }
      
      .modal-btn-danger {
        background: #ef4444;
        color: white;
      }
      
      .modal-btn-danger:hover {
        background: #dc2626;
      }
      
      /* Resume Button Styles */
      .btn-resume {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-left: 12px;
        text-decoration: none;
      }
      
      .btn-resume:hover {
        background: #2563eb;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
      
      .btn-resume:active {
        transform: translateY(0);
      }
      
      .resume-icon {
        font-size: 16px;
      }
      
      /* Resume Visibility Toggle Styles */
      .resume-visibility-toggle {
        margin-top: 12px;
        display: flex;
        align-items: center;
      }
      
      .toggle-label {
        display: flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
      }
      
      .toggle-label input[type="checkbox"] {
        display: none;
      }
      
      .toggle-slider {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f3f4f6;
        border: 2px solid #d1d5db;
        border-radius: 20px;
        padding: 6px 12px;
        transition: all 0.3s ease;
        font-size: 14px;
        font-weight: 500;
      }
      
      .toggle-label input[type="checkbox"]:checked + .toggle-slider {
        background: #10b981;
        border-color: #059669;
        color: white;
      }
      
      .toggle-icon {
        font-size: 16px;
        transition: transform 0.3s ease;
      }
      
      .toggle-label input[type="checkbox"]:checked + .toggle-slider .toggle-icon {
        transform: rotate(180deg);
      }
      
      .toggle-text {
        transition: all 0.3s ease;
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .profile-id {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        
        .btn-resume {
          margin-left: 0;
          margin-top: 8px;
        }
        
        .resume-visibility-toggle {
          margin-top: 8px;
        }
        
        .toggle-slider {
          padding: 4px 8px;
          font-size: 12px;
        }
      }
      
      @media (max-width: 480px) {
        .btn-resume {
          width: 100%;
          justify-content: center;
        }
        
        .toggle-slider {
          width: 100%;
          justify-content: center;
        }
      }
      
      /* Resume Section Styles */
      .resume-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        margin-top: 16px;
      }
      
      .resume-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
        padding: 8px 12px;
        background: #f8fafc;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }
      
      .status-label {
        font-size: 14px;
        color: #6b7280;
        font-weight: 500;
      }
      
      .status-value {
        font-size: 14px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 4px;
      }
      
      .status-value.public {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #bbf7d0;
      }
      
      .status-value.private {
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #fde68a;
      }
      
      .btn-secondary {
        background: #6b7280;
        color: white;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .btn-secondary:hover {
        background: #4b5563;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
      }
      
      @media (max-width: 768px) {
        .resume-actions {
          flex-direction: column;
          align-items: stretch;
        }
        
        .resume-status {
          margin-left: 0;
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);

    // Modal functionality
    function openModal(title, content, footer) {
      const modal = document.getElementById('popupModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalBody = document.getElementById('modalBody');
      const modalFooter = document.getElementById('modalFooter');
      
      modalTitle.textContent = title;
      modalBody.innerHTML = content;
      modalFooter.innerHTML = footer || '';
      
      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    function closeModal() {
      const modal = document.getElementById('popupModal');
      modal.classList.remove('show');
      document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
      const modal = document.getElementById('popupModal');
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    // Resume generation and visibility functions
    function generateResume() {
      try {
        // Get profile data from the page
        const profileData = {
          name: '<?php echo addslashes($profile_data['name'] ?? 'John Doe'); ?>',
          currentJob: '<?php echo addslashes($profile_data['current_job'] ?? ''); ?>',
          designation: '<?php echo addslashes($profile_data['designation'] ?? ''); ?>',
          company: '<?php echo addslashes($profile_data['company'] ?? ''); ?>',
          location: '<?php echo addslashes(implode(', ', array_filter([$profile_data['location_city'] ?? '', $profile_data['location_country'] ?? '']))); ?>',
          studentId: '<?php echo addslashes($profile_data['student_id'] ?? $user['student_id'] ?? 'N/A'); ?>',
          email: '<?php echo addslashes($profile_data['email'] ?? ''); ?>',
          phone: '<?php echo addslashes($profile_data['phone'] ?? ''); ?>',
          bio: '<?php echo addslashes($profile_data['bio'] ?? ''); ?>',
          skills: '<?php echo addslashes($profile_data['skills'] ?? ''); ?>',
          linkedin: '<?php echo addslashes($profile_data['linkedin'] ?? ''); ?>',
          github: '<?php echo addslashes($profile_data['github'] ?? ''); ?>',
          website: '<?php echo addslashes($profile_data['website'] ?? ''); ?>'
        };

        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set font
        doc.setFont('helvetica');
        
        // Colors
        const primaryColor = '#3b82f6';
        const textColor = '#1f2937';
        const lightGray = '#6b7280';
        
        let yPosition = 20;
        
        // Header Section
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, 210, 30, 'F');
        
        // Name
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(profileData.name, 20, 20);
        
        // Current Job/Title
        if (profileData.currentJob || profileData.designation) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'normal');
          const title = profileData.designation && profileData.company ? 
            `${profileData.designation} at ${profileData.company}` : 
            (profileData.currentJob || profileData.designation || '');
          doc.text(title, 20, 26);
        }
        
        yPosition = 45;
        
        // Contact Information
        doc.setTextColor(textColor);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTACT INFORMATION', 20, yPosition);
        yPosition += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        if (profileData.email) {
          doc.text(`Email: ${profileData.email}`, 20, yPosition);
          yPosition += 5;
        }
        if (profileData.phone) {
          doc.text(`Phone: ${profileData.phone}`, 20, yPosition);
          yPosition += 5;
        }
        if (profileData.location) {
          doc.text(`Location: ${profileData.location}`, 20, yPosition);
          yPosition += 5;
        }
        if (profileData.studentId) {
          doc.text(`Student ID: ${profileData.studentId}`, 20, yPosition);
          yPosition += 5;
        }
        
        // Social Links
        const socialLinks = [];
        if (profileData.linkedin) socialLinks.push(`LinkedIn: ${profileData.linkedin}`);
        if (profileData.github) socialLinks.push(`GitHub: ${profileData.github}`);
        if (profileData.website) socialLinks.push(`Website: ${profileData.website}`);
        
        if (socialLinks.length > 0) {
          yPosition += 5;
          socialLinks.forEach(link => {
            doc.text(link, 20, yPosition);
            yPosition += 5;
          });
        }
        
        yPosition += 10;
        
        // Professional Summary
        if (profileData.bio) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text('PROFESSIONAL SUMMARY', 20, yPosition);
          yPosition += 8;
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const bioLines = doc.splitTextToSize(profileData.bio, 170);
          doc.text(bioLines, 20, yPosition);
          yPosition += bioLines.length * 5 + 10;
        }
        
        // Skills
        if (profileData.skills) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text('SKILLS', 20, yPosition);
          yPosition += 8;
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const skills = profileData.skills.split(',').map(s => s.trim()).filter(s => s);
          const skillsText = skills.join(' • ');
          const skillsLines = doc.splitTextToSize(skillsText, 170);
          doc.text(skillsLines, 20, yPosition);
          yPosition += skillsLines.length * 5 + 10;
        }
        
        // Experience Section (from DOM)
        const experienceItems = document.querySelectorAll('.experience-item');
        if (experienceItems.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text('EXPERIENCE', 20, yPosition);
          yPosition += 8;
          
          experienceItems.forEach(item => {
            const title = item.querySelector('.experience-title')?.textContent || '';
            const company = item.querySelector('.experience-company')?.textContent || '';
            const duration = item.querySelector('.experience-duration')?.textContent || '';
            const description = item.querySelector('.experience-description')?.textContent || '';
            
            if (title && company) {
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(11);
              doc.text(title, 20, yPosition);
              yPosition += 5;
              
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(10);
              doc.text(`${company} • ${duration}`, 20, yPosition);
              yPosition += 5;
              
              if (description) {
                const descLines = doc.splitTextToSize(description, 170);
                doc.text(descLines, 20, yPosition);
                yPosition += descLines.length * 5 + 5;
              }
              yPosition += 5;
            }
          });
        }
        
        // Education Section (from DOM)
        const educationItems = document.querySelectorAll('.education-item');
        if (educationItems.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text('EDUCATION', 20, yPosition);
          yPosition += 8;
          
          educationItems.forEach(item => {
            const degree = item.querySelector('.education-degree')?.textContent || '';
            const school = item.querySelector('.education-school')?.textContent || '';
            const duration = item.querySelector('.education-duration')?.textContent || '';
            const description = item.querySelector('.education-description')?.textContent || '';
            
            if (degree && school) {
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(11);
              doc.text(degree, 20, yPosition);
              yPosition += 5;
              
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(10);
              doc.text(`${school} • ${duration}`, 20, yPosition);
              yPosition += 5;
              
              if (description) {
                const descLines = doc.splitTextToSize(description, 170);
                doc.text(descLines, 20, yPosition);
                yPosition += descLines.length * 5 + 5;
              }
              yPosition += 5;
            }
          });
        }
        
        // Footer
        doc.setFillColor(240, 240, 240);
        doc.rect(0, 280, 210, 20, 'F');
        doc.setTextColor(lightGray);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Generated by LinkUIU', 20, 290);
        doc.text(new Date().toLocaleDateString(), 150, 290);
        
        // Download the PDF
        const fileName = `${profileData.name.replace(/\s+/g, '_')}_Resume.pdf`;
        doc.save(fileName);
        
        showSuccessMessage('Resume generated successfully!');
        
      } catch (error) {
        console.error('Error generating resume:', error);
        showErrorMessage('Error generating resume: ' + error.message);
      }
    }
    
    function toggleResumeVisibility() {
      const toggle = document.getElementById('resumeVisibilityToggle');
      const isPublic = toggle.checked;
      const toggleText = document.querySelector('.toggle-text');
      const toggleIcon = document.querySelector('.toggle-icon');
      
      // Update UI immediately
      toggleText.textContent = isPublic ? 'Public' : 'Private';
      toggleIcon.textContent = isPublic ? '🔓' : '🔒';
      
      // Update in database
      updateProfileField('resume_visibility', isPublic ? 'public' : 'private')
        .then(() => {
          showSuccessMessage(`Resume visibility set to ${isPublic ? 'Public' : 'Private'}`);
        })
        .catch(error => {
          console.error('Error updating resume visibility:', error);
          // Revert UI changes on error
          toggle.checked = !isPublic;
          toggleText.textContent = isPublic ? 'Private' : 'Public';
          toggleIcon.textContent = isPublic ? '🔒' : '🔓';
          showErrorMessage('Error updating resume visibility');
        });
    }

    // Mobile navigation functions
    function toggleMobileMenu() {
      const mobileNav = document.querySelector('.mobile-nav');
      const hamburger = document.querySelector('.hamburger');
      
      mobileNav.classList.toggle('show');
      hamburger.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('show') ? 'hidden' : '';
    }
    
    function closeMobileMenu() {
      const mobileNav = document.querySelector('.mobile-nav');
      const hamburger = document.querySelector('.hamburger');
      
      mobileNav.classList.remove('show');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // Initialize mobile menu event listeners
    document.addEventListener('DOMContentLoaded', function() {
      const hamburger = document.querySelector('.hamburger');
      const mobileNavClose = document.querySelector('.mobile-nav-close');
      
      if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
      }
      
      if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileMenu);
      }
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', function(e) {
        const mobileNav = document.querySelector('.mobile-nav');
        const hamburger = document.querySelector('.hamburger');
        
        if (mobileNav.classList.contains('show') && 
            !mobileNav.contains(e.target) && 
            !hamburger.contains(e.target)) {
          closeMobileMenu();
        }
      });
    });

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Profile page loaded');
      
      // Add click handlers to close dropdowns when clicking on menu items
      document.querySelectorAll('.dropdown-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
          // Close all dropdowns
          document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
          });
        });
      });
    });
  </script>
</body>
</html>
