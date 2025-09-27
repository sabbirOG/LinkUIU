<?php
declare(strict_types=1);

global $ROUTES;
if (!isset($ROUTES)) { $ROUTES = []; }

// List conversation between two users
route('GET', '/messages/(\d+)/(\d+)', function ($userA, $userB) {
    $authUserId = requireAuth();
    $a = (int)$userA; $b = (int)$userB;
    if ($authUserId !== $a && $authUserId !== $b) {
        http_response_code(403);
        return ['error' => 'Forbidden'];
    }
    $controller = new messageController();
    return $controller->list($a, $b);
});

// Send message from A to B
route('POST', '/messages/(\d+)/(\d+)', function ($fromUserId, $toUserId) {
    $authUserId = requireAuth();
    if ($authUserId !== (int)$fromUserId) {
        http_response_code(403);
        return ['error' => 'Forbidden'];
    }
    $controller = new messageController();
    $payload = json_decode(file_get_contents('php://input'), true) ?: [];
    return $controller->send((int)$fromUserId, (int)$toUserId, $payload);
});

?>

