<?php
// Common session management for all PHP pages
session_start();

// Set the API base URL for the frontend
$api_base = 'http://127.0.0.1:8000';

// Check if backend is accessible
$backend_accessible = false;
$backend_error = '';
try {
    $context = stream_context_create([
        'http' => [
            'timeout' => 5,
            'method' => 'GET'
        ]
    ]);
    $response = @file_get_contents($api_base . '/auth/csrf-token', false, $context);
    $backend_accessible = ($response !== false);
    if ($response) {
        $data = json_decode($response, true);
        if (isset($data['csrf_token'])) {
            $_SESSION['csrf_token'] = $data['csrf_token'];
        }
    }
} catch (Exception $e) {
    $backend_error = $e->getMessage();
}

// Generate CSRF token if not exists
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Check if user is authenticated
$is_authenticated = isset($_SESSION['auth_token']) && isset($_SESSION['auth_user']);
$current_user = $is_authenticated ? $_SESSION['auth_user'] : null;

// Helper function to make API calls
function makeApiCall($endpoint, $method = 'GET', $data = null, $auth = false) {
    global $api_base;
    
    $headers = [
        'Content-Type: application/json',
        'X-CSRF-Token: ' . ($_SESSION['csrf_token'] ?? '')
    ];
    
    if ($auth && isset($_SESSION['auth_token'])) {
        $headers[] = 'Authorization: Bearer ' . $_SESSION['auth_token'];
    }
    
    $context = stream_context_create([
        'http' => [
            'header' => implode("\r\n", $headers),
            'method' => $method,
            'content' => $data ? json_encode($data) : null,
            'timeout' => 10
        ]
    ]);
    
    $response = @file_get_contents($api_base . $endpoint, false, $context);
    
    if ($response === false) {
        throw new Exception('Cannot connect to server. Please check if the backend server is running.');
    }
    
    $result = json_decode($response, true);
    
    if (isset($result['error'])) {
        throw new Exception($result['error']);
    }
    
    return $result;
}

// Helper function to require authentication
function requireAuth() {
    global $is_authenticated;
    if (!$is_authenticated) {
        header('Location: ./login.php');
        exit;
    }
}

// Helper function to redirect if already authenticated
function redirectIfAuthenticated() {
    global $is_authenticated;
    if ($is_authenticated) {
        header('Location: ./dashboard.php');
        exit;
    }
}
?>
