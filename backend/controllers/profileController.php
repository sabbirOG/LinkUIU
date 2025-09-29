<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/User.php';

class profileController {
    public function getProfile(int $userId): array {
        $pdo = get_pdo_connection();
        $userModel = new User($pdo);
        $user = $userModel->findById($userId);
        if (!$user) {
            http_response_code(404);
            return ['error' => 'User not found'];
        }
        unset($user['password']);
        return $user;
    }

    public function updateProfile(int $userId, array $data): array {
        $pdo = get_pdo_connection();
        $userModel = new User($pdo);
        $updated = $userModel->updateProfile($userId, [
            'name' => $data['name'] ?? null,
            'current_job' => $data['current_job'] ?? null,
            'designation' => $data['designation'] ?? null,
            'company' => $data['company'] ?? null,
            'location_city' => $data['location_city'] ?? null,
            'location_country' => $data['location_country'] ?? null,
            'skills' => $data['skills'] ?? null,
            'interests' => $data['interests'] ?? null,
            'linkedin' => $data['linkedin'] ?? null,
            'github' => $data['github'] ?? null,
            'instagram' => $data['instagram'] ?? null,
            'facebook' => $data['facebook'] ?? null,
            'twitter' => $data['twitter'] ?? null,
            'website' => $data['website'] ?? null,
            'resume' => $data['resume'] ?? null,
            'profile_visibility' => $data['profile_visibility'] ?? null,
        ]);
        if (!$updated) {
            http_response_code(400);
            return ['error' => 'Nothing to update'];
        }
        return ['status' => 'updated'];
    }

    public function uploadResume(int $userId): array {
        if (!isset($_FILES['resume'])) {
            http_response_code(400);
            return ['error' => 'File field resume is required'];
        }
        $file = $_FILES['resume'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            return ['error' => 'Upload failed'];
        }
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($file['size'] > $maxSize) {
            http_response_code(400);
            return ['error' => 'File too large (max 5MB)'];
        }
        $allowed = ['application/pdf'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        if (!in_array($mime, $allowed, true)) {
            http_response_code(400);
            return ['error' => 'Only PDF allowed'];
        }
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if ($ext !== 'pdf') {
            http_response_code(400);
            return ['error' => 'Only .pdf extension allowed'];
        }
        // Store outside the web root (one level up from backend)
        $uploadDir = realpath(__DIR__ . '/..' . '/../') . '/storage/resumes';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }
        $safeName = 'resume_' . $userId . '_' . bin2hex(random_bytes(6)) . '.pdf';
        $dest = $uploadDir . '/' . $safeName;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            http_response_code(500);
            return ['error' => 'Could not save file'];
        }
        $pdo = get_pdo_connection();
        $userModel = new User($pdo);
        $userModel->updateProfile($userId, ['resume' => $safeName]);
        return ['status' => 'uploaded', 'file' => $safeName];
    }
}

?>

