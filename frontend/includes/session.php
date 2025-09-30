<?php
// Common session management for all PHP pages
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set the API base URL for the frontend
$api_base = 'http://localhost/LinkUIU/backend/index.php';

// Backend is accessible through XAMPP Apache
$backend_accessible = true;
$backend_error = '';

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
    
    $url = $api_base . $endpoint;
    
    $context = stream_context_create([
        'http' => [
            'header' => implode("\r\n", $headers),
            'method' => $method,
            'content' => $data ? json_encode($data) : null,
            'timeout' => 10,
            'ignore_errors' => true,
            'follow_location' => false
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        // Get more detailed error information
        $error = error_get_last();
        $errorMsg = $error ? $error['message'] : 'Unknown error';
        throw new Exception('Cannot connect to server. Error: ' . $errorMsg . ' URL: ' . $url);
    }
    
    // Check HTTP response code
    if (isset($http_response_header)) {
        $status_line = $http_response_header[0];
        $status_code = null;
        if (preg_match('/HTTP\/\d\.\d\s+(\d+)/', $status_line, $matches)) {
            $status_code = (int)$matches[1];
        }
        
        // Handle different HTTP status codes appropriately
        if ($status_code >= 400) {
            $error_message = 'Server returned error: ' . $status_line;
            if ($status_code === 409) {
                $error_message = 'This email or student ID is already registered. Please use different credentials or try logging in.';
            } elseif ($status_code === 400) {
                $error_message = 'Invalid data provided. Please check your input and try again.';
            } elseif ($status_code === 401) {
                $error_message = 'Authentication failed. Please check your credentials.';
            } elseif ($status_code === 500) {
                $error_message = 'Server error occurred. Please try again later.';
            }
            throw new Exception($error_message);
        }
    }
    
    $result = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON response from server: ' . json_last_error_msg());
    }
    
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
