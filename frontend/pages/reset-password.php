<?php
require_once '../includes/session.php';

// Initialize variables
$error_message = '';
$success_message = '';
$token_valid = false;

// Get token from URL
$token = $_GET['token'] ?? '';

if (empty($token)) {
    $error_message = 'Invalid or missing reset token. Please check your email for the correct reset link.';
} else {
    $token_valid = true;
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $token_valid) {
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    
    // Basic validation
    if (empty($password)) {
        $error_message = 'Password is required.';
    } elseif (strlen($password) < 8) {
        $error_message = 'Password must be at least 8 characters long.';
    } elseif ($password !== $confirm_password) {
        $error_message = 'Passwords do not match.';
    } else {
        // Make API call to backend
        try {
            $payload = [
                'token' => $token,
                'password' => $password,
                'confirm_password' => $confirm_password
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
            
            $response = @file_get_contents($api_base . '/auth/reset-password', false, $context);
            
            if ($response === false) {
                throw new Exception('Cannot connect to server. Please check if the backend server is running.');
            }
            
            $result = json_decode($response, true);
            
            if (isset($result['error'])) {
                $error_message = $result['error'];
            } else {
                $success_message = 'Password has been reset successfully! Redirecting to login...';
                // Redirect to login after 3 seconds
                header("refresh:3;url=./login.php");
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
  <title>Reset Password - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
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
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm_password').value;
      
      let isValid = true;
      let errorMessage = '';
      
      if (!password || password.length < 8) {
        errorMessage += 'Password must be at least 8 characters long.\n';
        isValid = false;
      }
      
      if (password !== confirmPassword) {
        errorMessage += 'Passwords do not match.\n';
        isValid = false;
      }
      
      if (!isValid) {
        alert(errorMessage);
      }
      
      return isValid;
    }

    // Initialize page
    document.addEventListener('DOMContentLoaded', () => {
      // Add event listeners
      document.getElementById('password').addEventListener('input', checkPasswordStrength);
      
      // Form submission
      document.getElementById('reset-password-form').addEventListener('submit', (e) => {
        if (!validateForm()) {
          e.preventDefault();
        }
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
    
    .password-strength {
      font-size: 0.875rem;
      margin-top: 0.25rem;
      font-weight: 500;
    }
    
    .success {
      background: #d4edda;
      color: #155724;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #c3e6cb;
      text-align: center;
    }
    
    .error {
      background: #f8d7da;
      color: #721c24;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #f5c6cb;
      text-align: center;
    }
    
    .info-box {
      background: #d1ecf1;
      color: #0c5460;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #bee5eb;
    }
    
    .password-requirements {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 16px;
      margin-top: 12px;
    }
    
    .password-requirements h4 {
      margin: 0 0 12px 0;
      color: #495057;
      font-size: 0.9rem;
    }
    
    .password-requirements ul {
      margin: 0;
      padding-left: 20px;
      color: #6c757d;
      font-size: 0.85rem;
    }
    
    .password-requirements li {
      margin-bottom: 4px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #495057;
    }
    
    .form-group input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
    
    .btn {
      width: 100%;
      padding: 14px 20px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #007bff, #0056b3);
      border: none;
      color: white;
    }
    
    .btn-primary:hover {
      background: linear-gradient(135deg, #0056b3, #004085);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }
    
    .back-link {
      display: inline-block;
      margin-top: 20px;
      color: #007bff;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    .back-link:hover {
      color: #0056b3;
      text-decoration: underline;
    }
    
    .card {
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      border-radius: 16px;
      overflow: hidden;
    }
    
    .card h2 {
      color: #2c3e50;
      margin-bottom: 8px;
    }
    
    .text-muted {
      color: #6c757d;
      margin-bottom: 30px;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <img class="linkuiu-logo" src="../assets/images/linkuiu_logo.png" alt="LinkUIU logo" onclick="location.href='./landing.html'" style="cursor: pointer;" />
        <nav class="nav">
          <span class="nav-link" onclick="location.href='./landing.html'" style="cursor: pointer;">Home</span>
          <a href="./login.php" class="btn btn-primary">Login</a>
        </nav>
      </div>
    </div>
  </header>

  <div class="container">
    <div class="card mt-24" style="max-width: 500px; margin: 0 auto;">
      <div style="padding: 40px;">
        <h2 class="text-center">Reset Your Password</h2>
        <p class="text-center text-muted">Enter your new password below to complete the reset process.</p>
        
        <?php if ($error_message): ?>
          <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
        <?php endif; ?>
        
        <?php if ($success_message): ?>
          <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
        <?php endif; ?>
        
        <?php if ($token_valid && !$success_message): ?>
          <div class="info-box">
            <strong>🔒 Security Notice:</strong> This password reset link is valid for 1 hour. Please create a strong password to secure your account.
          </div>
          
          <form id="reset-password-form" method="POST" action="">
            <div class="form-group">
              <label for="password">New Password *</label>
              <input type="password" id="password" name="password" required minlength="8" placeholder="Enter your new password" />
              <div id="password-strength" class="password-strength" style="display: none;"></div>
              
              <div class="password-requirements">
                <h4>Password Requirements:</h4>
                <ul>
                  <li>At least 8 characters long</li>
                  <li>Contains uppercase and lowercase letters</li>
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character (recommended)</li>
                </ul>
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirm_password">Confirm New Password *</label>
              <input type="password" id="confirm_password" name="confirm_password" required minlength="8" placeholder="Confirm your new password" />
            </div>
            
            <button type="submit" class="btn btn-primary">Reset Password</button>
          </form>
        <?php endif; ?>
        
        <div class="text-center">
          <a href="./login.php" class="back-link">← Back to Login</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
