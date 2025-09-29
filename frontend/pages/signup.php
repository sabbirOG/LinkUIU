<?php
require_once '../includes/session.php';

// Redirect if already authenticated
redirectIfAuthenticated();

// Initialize variables for form handling
$error_message = '';
$success_message = '';
$form_data = [];

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate CSRF token
    $csrf_token = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $csrf_token)) {
        $error_message = 'Invalid security token. Please refresh the page and try again.';
    } else {
        // Process form data
        $form_data = [
            'name' => trim($_POST['name'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'student_id' => trim($_POST['student_id'] ?? ''),
            'password' => $_POST['password'] ?? '',
            'confirm_password' => $_POST['confirm_password'] ?? '',
            'user_type' => $_POST['user_type'] ?? 'student',
            'department_id' => (int)($_POST['department_id'] ?? 0),
            'batch_id' => !empty($_POST['batch_id']) ? (int)$_POST['batch_id'] : null
        ];
        
        // Basic validation
        if (empty($form_data['name'])) {
            $error_message = 'Name is required.';
        } elseif (empty($form_data['email']) || !filter_var($form_data['email'], FILTER_VALIDATE_EMAIL)) {
            $error_message = 'Valid email address is required.';
        } elseif (empty($form_data['student_id']) || !preg_match('/^01\d{8}$/', $form_data['student_id'])) {
            $error_message = 'Valid student ID is required (10 digits starting with 01).';
        } elseif (empty($form_data['password']) || strlen($form_data['password']) < 8) {
            $error_message = 'Password must be at least 8 characters long.';
        } elseif ($form_data['password'] !== $form_data['confirm_password']) {
            $error_message = 'Passwords do not match.';
        } elseif ($form_data['department_id'] <= 0) {
            $error_message = 'Please select a department.';
        } else {
            // Make API call to backend
            try {
                $payload = [
                    'name' => $form_data['name'],
                    'email' => $form_data['email'],
                    'student_id' => $form_data['student_id'],
                    'password' => $form_data['password'],
                    'user_type' => $form_data['user_type'],
                    'department_id' => $form_data['department_id'],
                    'batch_id' => $form_data['batch_id']
                ];
                
                $context = stream_context_create([
                    'http' => [
                        'header' => [
                            'Content-Type: application/json',
                            'X-CSRF-Token: ' . ($_SESSION['csrf_token'] ?? '')
                        ],
                        'method' => 'POST',
                        'content' => json_encode($payload),
                        'timeout' => 10
                    ]
                ]);
                
                $response = @file_get_contents($api_base . '/auth/signup', false, $context);
                
                if ($response === false) {
                    throw new Exception('Cannot connect to server. Please check if the backend server is running.');
                }
                
                $result = json_decode($response, true);
                
                if (isset($result['error'])) {
                    $error_message = $result['error'];
                } else {
                    $success_message = 'Account created successfully! Redirecting to login...';
                    // Redirect to login after 2 seconds
                    header("refresh:2;url=./login.php");
                }
            } catch (Exception $e) {
                $error_message = $e->getMessage();
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign up - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    // Department data organized by program level
    const departments = {
      undergraduate: [
        { id: 1, name: 'CSE (Computer Science & Engineering)', school: 'School of Science and Engineering (SoSE)' },
        { id: 2, name: 'EEE (Electrical & Electronic Engineering)', school: 'School of Science and Engineering (SoSE)' },
        { id: 5, name: 'CE (Civil Engineering)', school: 'School of Science and Engineering (SoSE)' },
        { id: 12, name: 'Data Science', school: 'School of Science and Engineering (SoSE)' },
        { id: 3, name: 'BBA (Business Administration)', school: 'School of Business and Economics (SoBE)' },
        { id: 4, name: 'BBA in AIS (Accounting Information System)', school: 'School of Business and Economics (SoBE)' },
        { id: 6, name: 'ECO (Economics)', school: 'School of Business and Economics (SoBE)' },
        { id: 7, name: 'EDS (Environment and Development Studies)', school: 'School of Humanities and Social Sciences (SoHS)' },
        { id: 8, name: 'English (English Language & Literature)', school: 'School of Humanities and Social Sciences (SoHS)' },
        { id: 11, name: 'MSJ (Media Studies and Journalism)', school: 'School of Humanities and Social Sciences (SoHS)' },
        { id: 9, name: 'BGE (Biotechnology & Genetic Engineering)', school: 'School of Life Sciences (SoLS)' },
        { id: 10, name: 'Pharmacy', school: 'School of Life Sciences (SoLS)' }
      ],
      graduate: [
        { id: 13, name: 'MBA (Master of Business Administration)', school: 'School of Business and Economics (SoBE)' },
        { id: 14, name: 'EMBA (Executive Master of Business Administration)', school: 'School of Business and Economics (SoBE)' },
        { id: 15, name: 'MSCSE (Master of Science in Computer Science & Engineering)', school: 'School of Science and Engineering (SoSE)' },
        { id: 16, name: 'MDS (Master in Development Studies)', school: 'School of Humanities and Social Sciences (SoHS)' },
        { id: 17, name: 'M.Sc. in Economics', school: 'School of Business and Economics (SoBE)' }
      ]
    };

    // Update departments based on program level
    function updateDepartments() {
      const programLevel = document.getElementById('program_level').value;
      const departmentSelect = document.getElementById('department_id');
      
      // Clear existing options
      departmentSelect.innerHTML = '<option value="">Select Department</option>';
      
      if (programLevel && departments[programLevel]) {
        let currentSchool = '';
        departments[programLevel].forEach(dept => {
          // Add school header if it's different from the previous one
          if (dept.school !== currentSchool) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = dept.school;
            departmentSelect.appendChild(optgroup);
            currentSchool = dept.school;
          }
          
          const option = document.createElement('option');
          option.value = dept.id;
          option.textContent = dept.name;
          departmentSelect.appendChild(option);
        });
      }
    }

    // Update batches based on program level
    function updateBatches() {
      const programLevel = document.getElementById('program_level').value;
      const batchSelect = document.getElementById('batch_id');
      
      // Clear existing options
      batchSelect.innerHTML = '<option value="">Select Batch (Optional)</option>';
      
      if (programLevel === 'undergraduate') {
        // Generate undergraduate batches (171-251)
        for (let year = 17; year <= 25; year++) {
          for (let trimester = 1; trimester <= 3; trimester++) {
            const batch = year + '' + trimester;
            const option = document.createElement('option');
            option.value = batch;
            option.textContent = `Batch ${batch}`;
            batchSelect.appendChild(option);
          }
        }
      } else if (programLevel === 'graduate') {
        // Generate graduate batches (171-251)
        for (let year = 17; year <= 25; year++) {
          for (let trimester = 1; trimester <= 3; trimester++) {
            const batch = year + '' + trimester;
            const option = document.createElement('option');
            option.value = batch;
            option.textContent = `Batch ${batch}`;
            batchSelect.appendChild(option);
          }
        }
      }
    }

    // Password strength indicator
    function checkPasswordStrength() {
      const password = document.getElementById('password').value;
      const strengthIndicator = document.getElementById('password-strength');
      
      if (password.length === 0) {
        strengthIndicator.style.display = 'none';
          return;
        }
        
      strengthIndicator.style.display = 'block';
      
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      
      const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
      const strengthColors = ['#ff4444', '#ff8800', '#ffaa00', '#88cc00', '#00aa00'];
      
      strengthIndicator.textContent = `Password Strength: ${strengthText[strength]}`;
      strengthIndicator.style.color = strengthColors[strength];
    }

    // Form validation
    function validateForm() {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const studentId = document.getElementById('student_id').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm_password').value;
      const departmentId = document.getElementById('department_id').value;
      
      let isValid = true;
      let errorMessage = '';
      
      if (!name) {
        errorMessage += 'Name is required.\n';
        isValid = false;
      }
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorMessage += 'Valid email address is required.\n';
        isValid = false;
      }
      
      if (!studentId || !/^01\d{8}$/.test(studentId)) {
        errorMessage += 'Valid student ID is required (10 digits starting with 01).\n';
        isValid = false;
      }
      
      if (!password || password.length < 8) {
        errorMessage += 'Password must be at least 8 characters long.\n';
        isValid = false;
      }
      
      if (password !== confirmPassword) {
        errorMessage += 'Passwords do not match.\n';
        isValid = false;
      }
      
      if (!departmentId) {
        errorMessage += 'Please select a department.\n';
        isValid = false;
      }
      
      if (!isValid) {
        alert(errorMessage);
      }
      
      return isValid;
    }

    // Initialize page
    document.addEventListener('DOMContentLoaded', () => {
      updateDepartments();
      updateBatches();
      
      // Add event listeners
      document.getElementById('program_level').addEventListener('change', () => {
        updateDepartments();
        updateBatches();
      });
      
      document.getElementById('password').addEventListener('input', checkPasswordStrength);
      
      // Form submission
      document.getElementById('signup-form').addEventListener('submit', (e) => {
        if (!validateForm()) {
          e.preventDefault();
        }
      });
    });
  </script>
  <style> 
    body { background: linear-gradient(180deg,#fff,#fff8f1); } 
    
    .horizontal-card {
      display: flex;
      max-width: 1200px;
      width: 100%;
      min-height: 320px;
      margin: 0 auto;
    }
    
    .card-left {
      flex: 1;
      background: linear-gradient(135deg, #FF6F00 0%, #F57C00 50%, #FF9800 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 25px;
      border-radius: 20px 0 0 20px;
      position: relative;
      overflow: hidden;
    }
    
    .card-left::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="hexagons" width="30" height="26" patternUnits="userSpaceOnUse"><polygon points="15,2 25,8 25,18 15,24 5,18 5,8" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23hexagons)"/></svg>');
      opacity: 0.4;
    }
    
    .card-left::after {
      content: '';
      position: absolute;
      top: -30%;
      right: -30%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%);
      border-radius: 50%;
      animation: rotate 20s linear infinite;
    }
    
    .card-left .floating-shapes {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    }
    
    .card-left .floating-shapes::before {
      content: '●';
      position: absolute;
      top: 20%;
      left: 15%;
      font-size: 20px;
      color: rgba(255,255,255,0.2);
      animation: float 4s ease-in-out infinite;
    }
    
    .card-left .floating-shapes::after {
      content: '▲';
      position: absolute;
      bottom: 25%;
      right: 20%;
      font-size: 16px;
      color: rgba(255,255,255,0.15);
      animation: float 3s ease-in-out infinite reverse;
    }
    
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .card-left .brand {
      text-align: center;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 2;
    }
    
    .card-left .brand-badge {
      font-size: 4rem;
      margin-bottom: 20px;
      text-shadow: 0 4px 8px rgba(0,0,0,0.3);
      animation: float 3s ease-in-out infinite;
    }
    
    .card-left .subtitle {
      font-size: 1.4rem;
      font-weight: 600;
      opacity: 0.95;
      color: white !important;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      margin-bottom: 10px;
    }
    
    .card-left .description {
      font-size: 1rem;
      opacity: 0.8;
      color: white !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      max-width: 250px;
      line-height: 1.4;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    .card-right {
      flex: 1;
      padding: 25px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .card-right .field {
      margin-bottom: 15px;
    }
    
    .card-right .label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }
    
    .card-right .input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
    }
    
    .card-right .btn {
      margin-top: 10px;
    }
    
    @media (max-width: 768px) {
      .horizontal-card {
        flex-direction: column;
        max-width: 400px;
        min-height: auto;
      }
      
      .card-left {
        border-radius: 20px 20px 0 0;
        padding: 20px;
      }
      
      .card-right {
        padding: 20px;
      }
    }
    
    .password-strength {
      font-size: 0.875rem;
      margin-top: 0.25rem;
      font-weight: 500;
    }
    
    .success {
      background: #d4edda;
      color: #155724;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #c3e6cb;
    }
    
    .error {
      background: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      border: 1px solid #f5c6cb;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <div class="brand-left">
        <img class="uiu-logo" src="../assets/images/uiu_logo.png?v=2" alt="UIU logo" />
      </div>
      <div class="brand-center"></div>
      <div class="brand-right">
        <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" onclick="location.href='./landing.html'" style="cursor: pointer;" />
      </div>
      <button class="hamburger" aria-label="Toggle mobile menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="nav">
        <span class="nav-link" onclick="location.href='./landing.html'" style="cursor: pointer;">Home</span>
        <span class="nav-link" onclick="location.href='./jobs.php'" style="cursor: pointer;">Jobs</span>
        <span class="nav-link" onclick="location.href='./connections.php'" style="cursor: pointer;">Connect</span>
        <span class="nav-link" onclick="location.href='./messages.php'" style="cursor: pointer;">Messages</span>
        <span class="nav-link" onclick="location.href='./search.php'" style="cursor: pointer;">Directory</span>
        <span class="nav-link" onclick="location.href='./profile.php'" style="cursor: pointer;">Profile</span>
        <a href="./login.php" class="btn btn-primary">Login</a>
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
          <span onclick="location.href='./landing.html'; closeMobileMenu();" style="cursor: pointer;">Home</span>
          <span onclick="location.href='./jobs.php'; closeMobileMenu();" style="cursor: pointer;">Jobs</span>
          <span onclick="location.href='./connections.php'; closeMobileMenu();" style="cursor: pointer;">Connect</span>
          <span onclick="location.href='./messages.php'; closeMobileMenu();" style="cursor: pointer;">Messages</span>
          <span onclick="location.href='./search.php'; closeMobileMenu();" style="cursor: pointer;">Directory</span>
          <span onclick="location.href='./profile.php'; closeMobileMenu();" style="cursor: pointer;">Profile</span>
          <a href="./login.php" class="btn btn-primary">Login</a>
        </div>
      </div>
    </div>
  </header>
  <div class="centered">
    <div class="card horizontal-card">
      <div class="card-left">
        <div class="floating-shapes"></div>
        <div class="brand">
          <div class="brand-badge">🎓</div>
          <div>
            <div class="subtitle">Join the UIU Community</div>
            <div class="description">Connect with fellow students and alumni. Build your network and advance your career together.</div>
          </div>
        </div>
      </div>
      <div class="card-right">
        <form id="signup-form" method="POST" action="">
          <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
          
          <?php if ($error_message): ?>
            <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
          <?php endif; ?>
          
          <?php if ($success_message): ?>
            <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
          <?php endif; ?>
          
        <div class="field">
          <label class="label">I am a</label>
          <select class="input" name="user_type" id="user_type" required>
            <option value="">Select your status</option>
              <option value="student" <?php echo ($form_data['user_type'] ?? '') === 'student' ? 'selected' : ''; ?>>Current Student</option>
              <option value="alumni" <?php echo ($form_data['user_type'] ?? '') === 'alumni' ? 'selected' : ''; ?>>Alumni</option>
          </select>
        </div>
        <div class="field">
          <label class="label">Full name</label>
            <input class="input" name="name" placeholder="Your Name" value="<?php echo htmlspecialchars($form_data['name'] ?? ''); ?>" required />
        </div>
        <div class="field">
          <label class="label">UIU Email</label>
            <input class="input" name="email" placeholder="name@bscse.uiu.ac.bd" value="<?php echo htmlspecialchars($form_data['email'] ?? ''); ?>" required />
        </div>
        <div class="field">
          <label class="label">Student ID</label>
            <input class="input" name="student_id" placeholder="011XXXXXXX" pattern="01\d{8}" value="<?php echo htmlspecialchars($form_data['student_id'] ?? ''); ?>" required />
        </div>
        <div class="field">
          <label class="label">Program Level</label>
          <select class="input" name="program_level" id="program_level" required onchange="updateDepartments()">
            <option value="">Select Program Level</option>
            <option value="undergraduate">Undergraduate Program</option>
            <option value="graduate">Graduate Program</option>
          </select>
        </div>
        <div class="field">
          <label class="label">Department</label>
          <select class="input" name="department_id" id="department_id" required>
            <option value="">Select Program Level First</option>
          </select>
        </div>
        <div class="field" id="batch_field" style="display: none;">
          <label class="label">Batch/Trimester</label>
          <select class="input" name="batch_id">
            <option value="">Select Batch (Optional for Alumni)</option>
            <option value="1">171</option>
            <option value="2">172</option>
            <option value="3">173</option>
            <option value="4">181</option>
            <option value="5">182</option>
            <option value="6">183</option>
            <option value="7">191</option>
            <option value="8">192</option>
            <option value="9">193</option>
            <option value="10">201</option>
            <option value="11">202</option>
            <option value="12">203</option>
            <option value="13">211</option>
            <option value="14">212</option>
            <option value="15">213</option>
            <option value="16">221</option>
            <option value="17">222</option>
            <option value="18">223</option>
            <option value="19">241</option>
            <option value="20">242</option>
            <option value="21">243</option>
            <option value="22">251</option>
            <option value="23">252</option>
          </select>
        </div>
        <div class="field">
          <label class="label">Password</label>
          <input class="input" type="password" name="password" placeholder="At least 8 chars, letters and numbers" required />
        </div>
        <button class="btn btn-primary" type="submit">Create account</button>
        <div id="error" class="error"></div>
          <div id="msg" class="success"></div>
          <div class="mt-16">Already have an account? <a href="./login.php">Login</a></div>
        </form>
      </div>
    </div>
  </div>

  <script>
    // Mobile navigation functionality
    function closeMobileMenu() {
      document.querySelector('.mobile-nav').classList.remove('active');
    }

    // Mobile menu toggle
    document.querySelector('.mobile-nav-toggle').addEventListener('click', () => {
      document.querySelector('.mobile-nav').classList.add('active');
    });

    document.querySelector('.mobile-nav-close').addEventListener('click', closeMobileMenu);

    // Close mobile menu when clicking outside
    document.querySelector('.mobile-nav').addEventListener('click', (e) => {
      if (e.target.classList.contains('mobile-nav')) {
        closeMobileMenu();
      }
    });
  </script>
</body>
</html>
