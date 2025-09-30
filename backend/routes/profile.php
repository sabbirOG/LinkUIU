<?php
declare(strict_types=1);

global $ROUTES;
if (!isset($ROUTES)) { $ROUTES = []; }

route('GET', '/profile/(\d+)', function ($userId) {
    $controller = new profileController();
    return $controller->getProfile((int)$userId);
});

route('PUT', '/profile/(\d+)', function ($userId) {
    $authUserId = requireAuth();
    if ($authUserId !== (int)$userId) {
        http_response_code(403);
        return ['error' => 'Forbidden'];
    }
    $controller = new profileController();
    return $controller->updateProfile((int)$userId, json_decode(file_get_contents('php://input'), true) ?: []);
});

// Upload resume (multipart/form-data, field name: resume)
route('POST', '/profile/(\d+)/resume', function ($userId) {
    $authUserId = requireAuth();
    if ($authUserId !== (int)$userId) {
        http_response_code(403);
        return ['error' => 'Forbidden'];
    }
    $controller = new profileController();
    return $controller->uploadResume((int)$userId);
});

// Upload cover photo (multipart/form-data, field name: cover_photo)
route('POST', '/profile/(\d+)/cover-photo', function ($userId) {
    $authUserId = requireAuth();
    if ($authUserId !== (int)$userId) {
        http_response_code(403);
        return ['error' => 'Forbidden'];
    }
    $controller = new profileController();
    return $controller->uploadCoverPhoto((int)$userId);
});

// Upload profile photo (multipart/form-data, field name: profile_photo)
route('POST', '/profile/(\d+)/profile-photo', function ($userId) {
    $authUserId = requireAuth();
    if ($authUserId !== (int)$userId) {
        http_response_code(403);
        return ['error' => 'Forbidden'];
    }
    $controller = new profileController();
    return $controller->uploadProfilePhoto((int)$userId);
});

?>

