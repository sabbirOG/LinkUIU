<?php
declare(strict_types=1);

global $ROUTES;
if (!isset($ROUTES)) { $ROUTES = []; }

route('GET', '/connections/(\d+)', function ($userId) {
    $controller = new connectionController();
    return $controller->listConnections((int)$userId);
});

route('POST', '/connections/(\d+)', function ($userId) {
    $authUserId = requireAuth();
    if ($authUserId !== (int)$userId) {
        http_response_code(403);
        return ['error' => 'Forbidden'];
    }
    $controller = new connectionController();
    return $controller->addConnection((int)$userId, json_decode(file_get_contents('php://input'), true) ?: []);
});

// Update connection status (accept/mark pending)
route('PUT', '/connections/status/(\d+)', function ($connectionId) {
    requireAuth();
    $controller = new connectionController();
    return $controller->updateStatus((int)$connectionId, json_decode(file_get_contents('php://input'), true) ?: []);
});

?>

