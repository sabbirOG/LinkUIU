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
        $identifier = trim($_POST['identifier'] ?? '');
        $password = $_POST['password'] ?? '';
        
        // Basic validation
        if (empty($identifier)) {
            $error_message = 'Email or Student ID is required.';
        } elseif (empty($password)) {
            $error_message = 'Password is required.';
        } else {
            // Make API call to backend
            try {
                $payload = [];
                if (preg_match('/^01\d{8}$/', $identifier)) {
                    $payload = ['student_id' => $identifier, 'password' => $password];
                } else {
                    $payload = ['email' => $identifier, 'password' => $password];
                }
                
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
                
                $response = @file_get_contents($api_base . '/auth/login', false, $context);
                
                if ($response === false) {
                    throw new Exception('Cannot connect to server. Please check if the backend server is running.');
                }
                
                $result = json_decode($response, true);
                
                if (isset($result['error'])) {
                    $error_message = $result['error'];
                } else {
                    // Store auth data in session
                    $_SESSION['auth_token'] = $result['token'];
                    $_SESSION['auth_user'] = $result['user'];
                    $success_message = 'Login successful! Redirecting to dashboard...';
                    // Redirect to dashboard after 2 seconds
                    header("refresh:2;url=./dashboard.php");
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
  <title>Login - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('login-form');
      const err = document.getElementById('error');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        err.textContent = '';
        const identifier = form.elements['identifier'].value.trim();
        const password = form.elements['password'].value;
        try {
          LinkUIU.setLoading(true);
          let payload;
          if (/^01\d{8}$/.test(identifier)) {
            payload = { student_id: identifier, password };
          } else {
            payload = { email: identifier, password };
          }
          const data = await LinkUIU.api('/auth/login', { method: 'POST', body: payload });
          LinkUIU.saveAuth(data);
          LinkUIU.showToast('Logged in', 'success');
          location.href = './dashboard.php';
        } catch (e) {
          err.textContent = e.message;
          LinkUIU.showToast(e.message, 'error');
        } finally { LinkUIU.setLoading(false); }
      });
    });
  </script>
  <style> 
    body { 
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 248, 241, 0.9)), url('../assets/images/uiu-godhuli.jpg');
      background-size: cover;
      background-position: 10% center;
      background-repeat: no-repeat;
      background-attachment: fixed;
    }
    
    /* Remove focus outline from buttons */
    .btn:focus {
      outline: none;
      box-shadow: none;
    }
    
    .btn:active {
      outline: none;
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
<body class="login-page">
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
        <a href="./signup.php" class="btn btn-primary">Sign Up</a>
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
          <a href="./signup.php" class="btn btn-primary">Sign Up</a>
        </div>
      </div>
    </div>
  </header>
  <div class="centered">
    <div class="card">
        <div class="brand">
          <div class="brand-badge">🎓</div>
          <div>
            <div class="title">Welcome back</div>
            <div class="subtitle">Choose your login portal</div>
          </div>
        </div>
      
      <div class="login-horizontal">
        <div class="login-options-horizontal">
          <div class="login-option-horizontal">
            <div class="option-icon">🎓</div>
            <h3>Current Student</h3>
            <p>Access your academic dashboard, assignments, and student resources</p>
            <a href="./login-student.html" class="btn btn-primary">Student Login</a>
          </div>
          
          <div class="login-option-horizontal">
            <div class="option-icon">🌟</div>
            <h3>Alumni</h3>
            <p>Reconnect with your network, share opportunities, and stay updated</p>
            <a href="./login-alumni.html" class="btn btn-primary">Alumni Login</a>
          </div>
        </div>
        
        <div class="divider-vertical">
          <span>or</span>
        </div>
        
        <div class="quick-login-form">
          <form id="login-form" method="POST" action="">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
            
            <?php if ($error_message): ?>
              <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
            <?php endif; ?>
            
            <?php if ($success_message): ?>
              <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
            <?php endif; ?>
            
            <div class="field">
              <label class="label">UIU Email or Student ID</label>
              <input class="input" name="identifier" placeholder="name@bscse.uiu.ac.bd or 0112230000" value="<?php echo htmlspecialchars($form_data['identifier'] ?? ''); ?>" required />
            </div>
            <div class="field">
              <label class="label">Password</label>
              <input class="input" type="password" name="password" placeholder="••••••••" required />
            </div>
            <button class="btn btn-outline" type="submit">Quick Login</button>
            <div id="error" class="error"></div>
            <div class="mt-16">New here? <a href="./signup.php">Create an account</a></div>
            <div class="mt-8"><a href="./forgot-password.php">Forgot your password?</a></div>
          </form>
        </div>
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
