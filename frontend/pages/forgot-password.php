<?php
require_once '../includes/session.php';

// Initialize variables
$error_message = '';
$success_message = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    
    // Basic validation
    if (empty($email)) {
        $error_message = 'Email address is required.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error_message = 'Please enter a valid email address.';
    } else {
        // Make API call to backend
        try {
            $payload = ['email' => $email];
            
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
            
            $response = @file_get_contents($api_base . '/auth/forgot-password', false, $context);
            
            if ($response === false) {
                throw new Exception('Cannot connect to server. Please check if the backend server is running.');
            }
            
            $result = json_decode($response, true);
            
            if (isset($result['error'])) {
                $error_message = $result['error'];
            } else {
                $success_message = 'Password reset instructions have been sent to your email.';
                // In development, show the reset link
                if (isset($result['reset_url'])) {
                    $success_message .= '<br><br><strong>Development Mode:</strong> <a href="' . htmlspecialchars($result['reset_url']) . '" target="_blank">Click here to reset your password</a>';
                }
            }
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
  <title>Forgot Password - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    document.addEventListener('DOMContentLoaded', function() {
      const form = document.getElementById('forgot-password-form');
      const submitBtn = document.getElementById('submit-btn');
      const loadingSpinner = submitBtn.querySelector('.loading-spinner');
      const btnText = submitBtn.querySelector('.btn-text');
      
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          // Show loading state
          submitBtn.classList.add('loading');
          btnText.textContent = 'Sending...';
          
          // Get form data
          const formData = new FormData(form);
          const email = formData.get('email');
          
          // Simulate API call (replace with actual API call)
          setTimeout(() => {
            // Hide loading state
            submitBtn.classList.remove('loading');
            btnText.textContent = 'Send Reset Link';
            
            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'success';
            successDiv.innerHTML = '✅ Reset link sent! Check your email for instructions.';
            
            // Replace form with success message
            form.style.display = 'none';
            form.parentNode.insertBefore(successDiv, form);
            
            // Hide info box
            const infoBox = document.querySelector('.info-box');
            if (infoBox) {
              infoBox.style.display = 'none';
            }
          }, 2000);
        });
      }
      
      // Mobile navigation functionality
      function closeMobileMenu() {
        document.querySelector('.mobile-nav').classList.remove('active');
      }
      
      // Add event listeners for mobile menu
      const hamburger = document.querySelector('.hamburger');
      const mobileNav = document.querySelector('.mobile-nav');
      const mobileNavClose = document.querySelector('.mobile-nav-close');
      
      if (hamburger) {
        hamburger.addEventListener('click', function() {
          mobileNav.classList.add('active');
        });
      }
      
      if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileMenu);
      }
      
      // Close mobile menu when clicking outside
      if (mobileNav) {
        mobileNav.addEventListener('click', function(e) {
          if (e.target === mobileNav) {
            closeMobileMenu();
          }
        });
      }
      
      // Make closeMobileMenu globally available
      window.closeMobileMenu = closeMobileMenu;
    });
  </script>
  <style> 
    body { 
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 248, 241, 0.9)), url('../assets/images/uiu-godhuli.jpg');
      background-size: cover;
      background-position: 10% center;
      background-repeat: no-repeat;
      background-attachment: fixed;
      min-height: 100vh;
    }
    
    .forgot-password-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      padding: 20px;
    }
    
    .forgot-password-card {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
      backdrop-filter: blur(10px);
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-width: 500px;
      width: 100%;
      overflow: hidden;
      position: relative;
    }
    
    .forgot-password-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #FF6F00, #F57C00, #FF9800);
    }
    
    .card-header {
      text-align: center;
      padding: 40px 40px 20px;
      background: linear-gradient(135deg, rgba(255, 111, 0, 0.05), rgba(245, 124, 0, 0.05));
    }
    
    .card-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #FF6F00, #F57C00);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 8px 20px rgba(255, 111, 0, 0.3);
      animation: pulse 2s infinite;
    }
    
    .card-icon::before {
      content: '🔐';
      font-size: 2rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    .card-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .card-subtitle {
      font-size: 1rem;
      color: #6b7280;
      margin: 0;
      line-height: 1.5;
    }
    
    .card-body {
      padding: 20px 40px 40px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
      font-size: 0.95rem;
    }
    
    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.8);
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #FF6F00;
      box-shadow: 0 0 0 4px rgba(255, 111, 0, 0.1);
      background: rgba(255, 255, 255, 1);
    }
    
    .btn {
      width: 100%;
      padding: 12px 20px;
      font-size: 0.9rem;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #FF6F00, #F57C00);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 111, 0, 0.3);
    }
    
    .btn-primary:hover {
      background: linear-gradient(135deg, #E65100, #D84315);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 111, 0, 0.4);
    }
    
    .btn-primary:active {
      transform: translateY(0);
    }
    
    .btn-primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }
    
    .btn-primary:hover::before {
      left: 100%;
    }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      color: #6b7280;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      margin-top: 20px;
    }
    
    .back-link:hover {
      color: #FF6F00;
      transform: translateX(-4px);
    }
    
    .back-link::before {
      content: '←';
      margin-right: 8px;
      transition: transform 0.3s ease;
    }
    
    .back-link:hover::before {
      transform: translateX(-4px);
    }
    
    .success {
      background: linear-gradient(135deg, #d4edda, #c3e6cb);
      color: #155724;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid #c3e6cb;
      box-shadow: 0 4px 12px rgba(21, 87, 36, 0.1);
      position: relative;
      overflow: hidden;
    }
    
    .success::before {
      content: '✅';
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 1.5rem;
    }
    
    .error {
      background: linear-gradient(135deg, #f8d7da, #f5c6cb);
      color: #721c24;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid #f5c6cb;
      box-shadow: 0 4px 12px rgba(114, 28, 36, 0.1);
      position: relative;
      overflow: hidden;
    }
    
    .error::before {
      content: '❌';
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 1.5rem;
    }
    
    .info-box {
      background: linear-gradient(135deg, #d1ecf1, #bee5eb);
      color: #0c5460;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid #bee5eb;
      box-shadow: 0 4px 12px rgba(12, 84, 96, 0.1);
      position: relative;
      overflow: hidden;
    }
    
    .info-box::before {
      content: '💡';
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 1.5rem;
    }
    
    .info-box strong {
      color: #0a4a52;
    }
    
    .loading-spinner {
      display: none;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .btn.loading .loading-spinner {
      display: inline-block;
    }
    
    .btn.loading {
      pointer-events: none;
      opacity: 0.8;
    }
    
    @media (max-width: 768px) {
      .forgot-password-container {
        padding: 10px;
      }
      
      .forgot-password-card {
        max-width: 100%;
        margin: 0;
      }
      
      .card-header {
        padding: 30px 20px 15px;
      }
      
      .card-body {
        padding: 15px 20px 30px;
      }
      
      .card-title {
        font-size: 1.75rem;
      }
      
      .card-icon {
        width: 60px;
        height: 60px;
      }
      
      .card-icon::before {
        font-size: 1.5rem;
      }
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
        <span class="nav-link" onclick="location.href='./jobs.html'" style="cursor: pointer;">Jobs</span>
        <span class="nav-link" onclick="location.href='./connections.html'" style="cursor: pointer;">Connect</span>
        <span class="nav-link" onclick="location.href='./messages.html'" style="cursor: pointer;">Messages</span>
        <span class="nav-link" onclick="location.href='./search.html'" style="cursor: pointer;">Directory</span>
        <span class="nav-link" onclick="location.href='./profile.html'" style="cursor: pointer;">Profile</span>
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
          <span onclick="location.href='./jobs.html'; closeMobileMenu();" style="cursor: pointer;">Jobs</span>
          <span onclick="location.href='./connections.html'; closeMobileMenu();" style="cursor: pointer;">Connect</span>
          <span onclick="location.href='./messages.html'; closeMobileMenu();" style="cursor: pointer;">Messages</span>
          <span onclick="location.href='./search.html'; closeMobileMenu();" style="cursor: pointer;">Directory</span>
          <span onclick="location.href='./profile.html'; closeMobileMenu();" style="cursor: pointer;">Profile</span>
          <a href="./login.php" class="btn btn-primary">Login</a>
        </div>
      </div>
    </div>
  </header>

  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="card-header">
        <div class="card-icon"></div>
        <h1 class="card-title">Forgot Password?</h1>
        <p class="card-subtitle">Don't worry! Enter your email address and we'll send you a secure link to reset your password.</p>
      </div>
      
      <div class="card-body">
        <?php if ($error_message): ?>
          <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
        <?php endif; ?>
        
        <?php if ($success_message): ?>
          <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
        <?php endif; ?>
        
        <?php if (!$success_message): ?>
          <div class="info-box">
            <strong>How it works:</strong><br>
            • Enter your registered email address<br>
            • Check your inbox for a reset link<br>
            • Click the link to create a new password<br>
            • The link expires in 1 hour for security
          </div>
          
          <form method="POST" action="" id="forgot-password-form">
            <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value="<?php echo htmlspecialchars($email ?? ''); ?>" 
                required 
                placeholder="Enter your registered email address"
                autocomplete="email"
              />
            </div>
            
            <button type="submit" class="btn btn-primary" id="submit-btn">
              <span class="loading-spinner"></span>
              <span class="btn-text">Send Reset Link</span>
            </button>
          </form>
        <?php endif; ?>
        
        <a href="./login.php" class="back-link">Back to Login</a>
      </div>
    </div>
  </div>
</body>
</html>
