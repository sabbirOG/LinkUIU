<?php
declare(strict_types=1);

global $ROUTES;
if (!isset($ROUTES)) { $ROUTES = []; }

route('POST', '/applications', function () {
    $authUserId = requireAuth();
    $controller = new applicationController();
    $payload = json_decode(file_get_contents('php://input'), true) ?: [];
    // enforce student_id from token if not provided or mismatch
    $payload['student_id'] = $payload['student_id'] ?? $authUserId;
    if ((int)$payload['student_id'] !== $authUserId) {
        http_response_code(403);
        return ['error' => 'Forbidden'];
    }
    return $controller->apply($payload);
});

route('GET', '/applications/job/(\d+)', function ($jobId) {
    $controller = new applicationController();
    return $controller->listByJob((int)$jobId);
});

route('GET', '/applications/student/(\d+)', function ($studentId) {
    $controller = new applicationController();
    return $controller->listByStudent((int)$studentId);
});

?>

