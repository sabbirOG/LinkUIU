<?php
declare(strict_types=1);

global $ROUTES;
if (!isset($ROUTES)) { $ROUTES = []; }

route('GET', '/jobs', function () {
    $controller = new jobController();
    return $controller->listJobs();
});

route('POST', '/jobs', function () {
    $authUserId = requireAuth();
    $payload = json_decode(file_get_contents('php://input'), true) ?: [];
    $payload['posted_by'] = $payload['posted_by'] ?? $authUserId;
    $controller = new jobController();
    return $controller->createJob($payload);
});

route('GET', '/jobs/(\d+)', function ($jobId) {
    $controller = new jobController();
    return $controller->getJob((int)$jobId);
});

route('PUT', '/jobs/(\d+)', function ($jobId) {
    $authUserId = requireAuth();
    $controller = new jobController();
    return $controller->updateJob((int)$jobId, $authUserId, json_decode(file_get_contents('php://input'), true) ?: []);
});

route('DELETE', '/jobs/(\d+)', function ($jobId) {
    $authUserId = requireAuth();
    $controller = new jobController();
    return $controller->deleteJob((int)$jobId, $authUserId);
});

?>

