<?php
declare(strict_types=1);

header('Content-Type: application/json');
// CORS: reflect allowed origin from env list; fall back to * in dev
$allowedList = getenv('ALLOWED_ORIGINS') ?: '*';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($allowedList === '*' || $origin === '') {
    header('Access-Control-Allow-Origin: *');
} else {
    $allowedOrigins = array_map('trim', explode(',', $allowedList));
    if (in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    } else {
        // Not allowed: do not reflect an origin
        header('Vary: Origin');
    }
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Production security headers
if (getenv('APP_ENV') === 'production') {
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
    // Note: For CSP/HSTS prefer configuring at the reverse proxy; fallback here if needed
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Basic autoload for controllers/models if Composer isn't used
spl_autoload_register(function ($class) {
    $paths = [__DIR__ . '/controllers/' . $class . '.php', __DIR__ . '/models/' . $class . '.php'];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            return;
        }
    }
});

// Auth helpers
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/models/Session.php';

function getBearerToken(): ?string {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    error_log('getBearerToken: HTTP_AUTHORIZATION = ' . $auth);
    
    if (stripos($auth, 'Bearer ') === 0) {
        $token = substr($auth, 7);
        error_log('getBearerToken: Found token in HTTP_AUTHORIZATION: ' . substr($token, 0, 10) . '...');
        return $token;
    }
    
    // Fallback for some server envs
    $authAlt = $_SERVER['Authorization'] ?? '';
    error_log('getBearerToken: Authorization = ' . $authAlt);
    
    if (stripos($authAlt, 'Bearer ') === 0) {
        $token = substr($authAlt, 7);
        error_log('getBearerToken: Found token in Authorization: ' . substr($token, 0, 10) . '...');
        return $token;
    }
    
    error_log('getBearerToken: No valid token found');
    return null;
}

function requireAuth(): int {
    $token = getBearerToken();
    if (!$token) {
        error_log('requireAuth: No token provided');
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    
    error_log('requireAuth: Token received: ' . substr($token, 0, 10) . '...');
    
    $pdo = get_pdo_connection();
    $sessionModel = new Session($pdo);
    $session = $sessionModel->findByToken($token);
    if (!$session) {
        error_log('requireAuth: Invalid token - no session found');
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    error_log('requireAuth: Valid session found for user ID: ' . $session['user_id']);
    return (int)$session['user_id'];
}

// Route dispatcher
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Normalize to path under backend/ if served from a subdir
$scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? ''), '/');
if ($scriptDir && str_starts_with((string)$requestUri, $scriptDir)) {
    $requestUri = substr((string)$requestUri, strlen($scriptDir));
}
// Also strip leading /index.php when using Apache paths like /backend/index.php/route
if (str_starts_with((string)$requestUri, '/index.php')) {
    $requestUri = substr((string)$requestUri, strlen('/index.php'));
}

// Routing registry and helper
global $ROUTES;
if (!isset($ROUTES)) { $ROUTES = []; }
if (!function_exists('route')) {
    function route(string $method, string $pattern, callable $handler): void {
        global $ROUTES;
        $ROUTES[] = [$method, $pattern, $handler];
    }
}

// Include route files which register handlers
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/profile.php';
require_once __DIR__ . '/routes/jobs.php';
require_once __DIR__ . '/routes/connections.php';
require_once __DIR__ . '/routes/messages.php';
require_once __DIR__ . '/routes/applications.php';
require_once __DIR__ . '/routes/search.php';

// Match route
$matched = false;
foreach ($ROUTES as $route) {
    [$method, $pattern, $handler] = $route;
    if ($method !== $requestMethod) {
        continue;
    }
    $regex = '#^' . $pattern . '$#';
    if (preg_match($regex, (string)$requestUri, $matches)) {
        array_shift($matches);
        $matched = true;
        try {
            $response = call_user_func_array($handler, $matches);
            if ($response === null) {
                $response = ['status' => 'ok'];
            }
            echo json_encode($response, JSON_UNESCAPED_UNICODE);
        } catch (Throwable $e) {
            http_response_code(500);
            if (getenv('APP_ENV') === 'production') {
                echo json_encode(['error' => 'Server error']);
            } else {
                echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
            }
        }
        break;
    }
}

if (!$matched) {
    http_response_code(404);
    echo json_encode(['error' => 'Not Found', 'path' => $requestUri]);
}

?>

