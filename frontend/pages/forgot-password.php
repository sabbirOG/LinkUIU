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
        $email = trim($_POST['email'] ?? '');
        
        // Basic validation
        if (empty($email)) {
            $error_message = 'Email address is required.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error_message = 'Please enter a valid email address.';
        } else {
            // Make API call to backend
            try {
                $payload = [
                    'email' => $email
                ];
                
                $result = makeApiCall('/auth/forgot-password', 'POST', $payload, false);
                
                $success_message = 'If an account with that email exists, a password reset link has been sent. Please check your email.';
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
  <title>Forgot Password - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
  </script>
</head>
<body>
  <div class="container">
    <div class="auth-card">
      <div class="auth-header">
        <img src="../assets/images/linkuiu_logo.png" alt="LinkUIU" class="auth-logo" />
        <h1>Forgot Password</h1>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
      </div>
      
      <form id="forgot-password-form" method="POST" action="">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
        
        <?php if ($error_message): ?>
          <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
        <?php endif; ?>
        
        <?php if ($success_message): ?>
          <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
        <?php endif; ?>
        
        <div class="field">
          <label class="label">Email Address</label>
          <input class="input" name="email" type="email" placeholder="name@bscse.uiu.ac.bd" value="<?php echo htmlspecialchars($form_data['email'] ?? ''); ?>" required />
        </div>
        
        <button class="btn btn-primary" type="submit">Send Reset Link</button>
        
        <div class="mt-16">
          <a href="./login.php">Back to Login</a>
        </div>
      </form>
    </div>
  </div>
</body>
</html>