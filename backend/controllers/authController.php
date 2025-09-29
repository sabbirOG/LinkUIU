<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Session.php';

class authController {
    public function login(array $data): array {
        $identifier = trim((string)($data['email'] ?? ($data['student_id'] ?? '')));
        $password = (string)($data['password'] ?? '');
        if ($identifier === '' || $password === '') {
            http_response_code(400);
            return ['error' => 'Email or student_id and password are required'];
        }
        $pdo = get_pdo_connection();
        $userModel = new User($pdo);
        $user = null;
        if (isset($data['student_id'])) {
            // CSE student ID format: 10 digits starting with 01 (e.g., 0112230346)
            if (!preg_match('/^01\d{8}$/', $identifier)) {
                http_response_code(400);
                return ['error' => 'Invalid student_id format (expected 10 digits starting with 01)'];
            }
            $user = $userModel->findByStudentId($identifier);
        } else {
            if (!filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                return ['error' => 'Invalid email format'];
            }
            $user = $userModel->findByEmail($identifier);
        }
        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            return ['error' => 'Invalid credentials'];
        }
        $token = bin2hex(random_bytes(32));
        $sessionModel = new Session($pdo);
        // Optional expiry: 7 days
        $expiresAt = (new DateTime('+7 days'))->format('Y-m-d H:i:s');
        // Opportunistic cleanup of expired sessions
        $sessionModel->deleteExpired();
        $sessionModel->create((int)$user['id'], $token, $expiresAt);
        return ['token' => $token, 'user' => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'student_id' => $user['student_id']]];
    }

    public function signup(array $data): array {
        $name = trim((string)($data['name'] ?? ''));
        $email = trim((string)($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');
        $studentId = trim((string)($data['student_id'] ?? ''));
        $userType = trim((string)($data['user_type'] ?? 'student'));
        $departmentId = (int)($data['department_id'] ?? 1);
        $batchId = isset($data['batch_id']) && $data['batch_id'] !== '' ? (int)$data['batch_id'] : null;
        
        if ($name === '' || $email === '' || $password === '') {
            http_response_code(400);
            return ['error' => 'Name, email and password are required'];
        }
        if ($studentId === '') {
            http_response_code(400);
            return ['error' => 'student_id is required'];
        }
        if (!in_array($userType, ['student', 'alumni'])) {
            http_response_code(400);
            return ['error' => 'Invalid user type. Must be student or alumni'];
        }
        if ($userType === 'student' && $batchId === null) {
            http_response_code(400);
            return ['error' => 'Batch is required for students'];
        }
        // CSE student ID format: 10 digits starting with 01 (e.g., 0112230346)
        if (!preg_match('/^01\d{8}$/', $studentId)) {
            http_response_code(400);
            return ['error' => 'Invalid student_id format (expected 10 digits starting with 01)'];
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'Invalid email format'];
        }
        // Enforce UIU email domain (e.g., xyz@bscse.uiu.ac.bd) for students; alumni also expected to have UIU email historically
        if (!preg_match('/@([A-Za-z0-9-]+\.)*uiu\.ac\.bd$/i', $email)) {
            http_response_code(400);
            return ['error' => 'Email must be a UIU address (e.g., name@bscse.uiu.ac.bd)'];
        }
        // Password strength: min 8 chars, at least one letter and one number
        $hasMinLength = strlen($password) >= 8;
        $hasLetter = (bool)preg_match('/[A-Za-z]/', $password);
        $hasNumber = (bool)preg_match('/\d/', $password);
        if (!($hasMinLength && $hasLetter && $hasNumber)) {
            http_response_code(400);
            return ['error' => 'Password must be at least 8 characters with letters and numbers'];
        }
        $pdo = get_pdo_connection();
        $userModel = new User($pdo);
        if ($userModel->findByEmail($email)) {
            http_response_code(409);
            return ['error' => 'Email already registered'];
        }
        // Prevent duplicate student_id
        if ($userModel->findByStudentId($studentId)) {
            http_response_code(409);
            return ['error' => 'student_id already registered'];
        }
        $userId = $userModel->create($name, $email, $studentId, password_hash($password, PASSWORD_DEFAULT), $userType, $departmentId, $batchId);
        http_response_code(201);
        return ['status' => 'created', 'userId' => $userId];
    }

    public function logout(): array {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = null;
        if (stripos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
        }
        if ($token) {
            $pdo = get_pdo_connection();
            $sessionModel = new Session($pdo);
            $sessionModel->deleteExpired();
            $sessionModel->deleteByToken($token);
        }
        return ['status' => 'logged_out'];
    }

    public function changePassword(int $authUserId, array $data): array {
        $old = (string)($data['old_password'] ?? '');
        $new = (string)($data['new_password'] ?? '');
        if ($old === '' || $new === '') {
            http_response_code(400);
            return ['error' => 'old_password and new_password are required'];
        }
        // Strength check
        $hasMinLength = strlen($new) >= 8;
        $hasLetter = (bool)preg_match('/[A-Za-z]/', $new);
        $hasNumber = (bool)preg_match('/\d/', $new);
        if (!($hasMinLength && $hasLetter && $hasNumber)) {
            http_response_code(400);
            return ['error' => 'New password must be at least 8 characters with letters and numbers'];
        }
        $pdo = get_pdo_connection();
        $userModel = new User($pdo);
        $user = $userModel->findById($authUserId);
        if (!$user || !password_verify($old, $this->getPasswordHashById($pdo, $authUserId))) {
            http_response_code(401);
            return ['error' => 'Old password is incorrect'];
        }
        $userModel->updatePassword($authUserId, password_hash($new, PASSWORD_DEFAULT));
        return ['status' => 'password_changed'];
    }

    public function me(int $authUserId): array {
        $pdo = get_pdo_connection();
        $userModel = new User($pdo);
        $user = $userModel->findById($authUserId);
        if (!$user) {
            http_response_code(404);
            return ['error' => 'User not found'];
        }
        // Remove sensitive data
        unset($user['password']);
        return $user;
    }

    private function getPasswordHashById(PDO $pdo, int $id): string {
        $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (string)($row['password'] ?? '');
    }

    public function forgotPassword(array $data): array {
        $email = trim((string)($data['email'] ?? ''));
        if ($email === '') {
            http_response_code(400);
            return ['error' => 'Email is required'];
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'Invalid email format'];
        }
        $pdo = get_pdo_connection();
        $userModel = new User($pdo);
        $user = $userModel->findByEmail($email);
        if (!$user) {
            // Don't reveal if email exists or not for security
            http_response_code(200);
            return ['message' => 'If the email exists, a password reset link has been sent'];
        }
        // Generate reset token
        $resetToken = bin2hex(random_bytes(32));
        $expiresAt = (new DateTime('+1 hour'))->format('Y-m-d H:i:s');
        // Store reset token in database (you might want to create a password_resets table)
        // For now, we'll store it in the users table
        $stmt = $pdo->prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?');
        $stmt->execute([$resetToken, $expiresAt, $user['id']]);
        // In a real application, you would send an email here
        // For now, we'll just return the token (remove this in production)
        http_response_code(200);
        return ['message' => 'Password reset link sent', 'token' => $resetToken]; // Remove token in production
    }

    public function resetPassword(array $data): array {
        $token = trim((string)($data['token'] ?? ''));
        $password = (string)($data['password'] ?? '');
        $confirmPassword = (string)($data['confirm_password'] ?? '');
        
        if ($token === '') {
            http_response_code(400);
            return ['error' => 'Reset token is required'];
        }
        if ($password === '') {
            http_response_code(400);
            return ['error' => 'Password is required'];
        }
        if ($password !== $confirmPassword) {
            http_response_code(400);
            return ['error' => 'Passwords do not match'];
        }
        if (strlen($password) < 8) {
            http_response_code(400);
            return ['error' => 'Password must be at least 8 characters long'];
        }
        
        $pdo = get_pdo_connection();
        $stmt = $pdo->prepare('SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()');
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(400);
            return ['error' => 'Invalid or expired reset token'];
        }
        
        // Update password and clear reset token
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?');
        $stmt->execute([$hashedPassword, $user['id']]);
        
        http_response_code(200);
        return ['message' => 'Password reset successfully'];
    }
}

?>

