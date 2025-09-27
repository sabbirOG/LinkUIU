<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/Connection.php';

class connectionController {
    public function listConnections(int $userId): array {
        $pdo = get_pdo_connection();
        $connModel = new Connection($pdo);
        $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 50;
        $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
        return $connModel->listByUser($userId, $limit, $offset);
    }

    public function addConnection(int $userId, array $data): array {
        $targetId = (int)($data['targetUserId'] ?? 0);
        if ($targetId <= 0) {
            http_response_code(400);
            return ['error' => 'targetUserId is required'];
        }
        if ($targetId === $userId) {
            http_response_code(400);
            return ['error' => 'Cannot connect to yourself'];
        }
        $pdo = get_pdo_connection();
        $connModel = new Connection($pdo);
        try {
            if ($connModel->existsPair($userId, $targetId)) {
                http_response_code(409);
                return ['error' => 'Connection already exists or pending'];
            }
            $connModel->add($userId, $targetId);
            return ['status' => 'connected'];
        } catch (Throwable $e) {
            // Handle duplicates against unique constraint
            http_response_code(409);
            return ['error' => 'Connection already exists or pending'];
        }
    }

    public function updateStatus(int $connectionId, array $data): array {
        $status = (string)($data['status'] ?? '');
        if (!in_array($status, ['accepted', 'pending'], true)) {
            http_response_code(400);
            return ['error' => 'status must be accepted or pending'];
        }
        $pdo = get_pdo_connection();
        $connModel = new Connection($pdo);
        $ok = $connModel->updateStatus($connectionId, $status);
        if (!$ok) {
            http_response_code(404);
            return ['error' => 'Connection not found'];
        }
        return ['status' => 'updated'];
    }
}

?>

