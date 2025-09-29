<?php
require_once '../includes/session.php';

// Require authentication
requireAuth();

// Get user data
$user = $current_user;

// Get peer ID from URL parameter or form
$peer_id = $_GET['peer'] ?? $_POST['peer'] ?? '';

// Fetch messages if peer is selected
$messages = [];
if ($peer_id) {
    try {
        $messages = makeApiCall("/messages/{$user['id']}/{$peer_id}?limit=100&offset=0", 'GET', null, true);
    } catch (Exception $e) {
        error_log('Failed to fetch messages: ' . $e->getMessage());
    }
}

// Handle form submission
$error_message = '';
$success_message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && $_POST['action'] === 'send_message') {
        try {
            $peer = trim($_POST['peer'] ?? '');
            $message = trim($_POST['message'] ?? '');
            
            if (empty($peer) || empty($message)) {
                throw new Exception('Please enter both peer ID and message');
            }
            
            $result = makeApiCall("/messages/{$user['id']}/{$peer}", 'POST', ['message' => $message], true);
            $success_message = 'Message sent successfully!';
            
            // Reload messages
            $messages = makeApiCall("/messages/{$user['id']}/{$peer}?limit=100&offset=0", 'GET', null, true);
            
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
  <title>Messages - LinkUIU</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <script defer src="../assets/js/main.js"></script>
  <script>
    // Set the API base URL for this page
    window.APP_API_BASE = '<?php echo $api_base; ?>';
    
    let messages = <?php echo json_encode($messages); ?>;
    let currentUser = <?php echo json_encode($user); ?>;

    function loadMessages() {
      const list = document.getElementById('list');
      list.innerHTML = '';
      
      const peer = document.getElementById('peer').value.trim();
      if (!peer) return;
      
      // Reload page with peer parameter
      if (peer !== '<?php echo $peer_id; ?>') {
        location.href = `./messages.php?peer=${peer}`;
        return;
      }
      
      if (!messages.length) {
        const empty = document.createElement('div');
        empty.className = 'subtitle';
        empty.textContent = 'No messages yet';
        list.replaceChildren(empty);
        return;
      }
      
      for (const m of messages) {
        const card = document.createElement('div');
        card.className = 'card';
        const sub = document.createElement('div');
        sub.className = 'subtitle';
        const who = m.sender_id === currentUser.id ? 'You' : 'Them';
        sub.textContent = `${who} • ${new Date(m.created_at).toLocaleString()}`;
        const body = document.createElement('div');
        body.textContent = m.message || '';
        card.appendChild(sub);
        card.appendChild(body);
        list.appendChild(card);
      }
    }

    async function sendMessage(e) {
      e.preventDefault();
      const peer = document.getElementById('peer').value.trim();
      const body = document.getElementById('body').value.trim();
      
      if (!peer || !body) {
        alert('Please enter both peer ID and message');
        return;
      }
      
      try {
        const response = await fetch(`<?php echo $api_base; ?>/messages/<?php echo $user['id']; ?>/${peer}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <?php echo $_SESSION['auth_token'] ?? ''; ?>',
            'X-CSRF-Token': '<?php echo $_SESSION['csrf_token'] ?? ''; ?>'
          },
          body: JSON.stringify({ message: body })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to send message');
        }
        
        document.getElementById('body').value = '';
        loadMessages();
        location.reload(); // Reload to show new message
      } catch (e) {
        alert(e.message);
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
      // Set peer value if coming from URL
      const urlParams = new URLSearchParams(window.location.search);
      const peer = urlParams.get('peer');
      if (peer) {
        document.getElementById('peer').value = peer;
      }
      
      loadMessages();
      document.getElementById('peer').addEventListener('change', loadMessages);
      document.getElementById('msg-form').addEventListener('submit', sendMessage);
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
    <div class="card mt-24">
      <form id="msg-form" method="POST" action="" class="row">
        <input type="hidden" name="action" value="send_message">
        <input type="hidden" name="csrf_token" value="<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? ''); ?>">
        
        <?php if ($error_message): ?>
          <div class="error"><?php echo htmlspecialchars($error_message); ?></div>
        <?php endif; ?>
        
        <?php if ($success_message): ?>
          <div class="success"><?php echo htmlspecialchars($success_message); ?></div>
        <?php endif; ?>
        
        <input id="peer" name="peer" class="input" type="number" min="1" placeholder="Peer user ID" value="<?php echo htmlspecialchars($peer_id); ?>" style="max-width:160px" />
        <input id="body" name="message" class="input" placeholder="Type a message" />
        <button class="btn btn-primary">Send</button>
      </form>
    </div>
    <div id="list" class="mt-24" style="display:grid; gap:16px;"></div>
  </div>
</body>
</html>
