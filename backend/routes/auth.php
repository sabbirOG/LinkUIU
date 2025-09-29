<?php
declare(strict_types=1);

global $ROUTES;
if (!isset($ROUTES)) { $ROUTES = []; }

route('POST', '/auth/login', function () {
    $controller = new authController();
    return $controller->login(json_decode(file_get_contents('php://input'), true) ?: []);
});

route('POST', '/auth/signup', function () {
    $controller = new authController();
    return $controller->signup(json_decode(file_get_contents('php://input'), true) ?: []);
});

route('POST', '/auth/logout', function () {
    $controller = new authController();
    return $controller->logout();
});

route('POST', '/auth/change-password', function () {
    $authUserId = requireAuth();
    $controller = new authController();
    return $controller->changePassword($authUserId, json_decode(file_get_contents('php://input'), true) ?: []);
});

route('GET', '/auth/me', function () {
    $authUserId = requireAuth();
    $controller = new authController();
    return $controller->me($authUserId);
});

route('POST', '/auth/forgot-password', function () {
    $controller = new authController();
    return $controller->forgotPassword(json_decode(file_get_contents('php://input'), true) ?: []);
});

route('POST', '/auth/reset-password', function () {
    $controller = new authController();
    return $controller->resetPassword(json_decode(file_get_contents('php://input'), true) ?: []);
});

?>

