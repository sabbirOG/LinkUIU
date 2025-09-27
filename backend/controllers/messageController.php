<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/Message.php';

class messageController {
    public function list(int $userA, int $userB): array {
        $pdo = get_pdo_connection();
        $model = new Message($pdo);
        $limit = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 100;
        $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
        return $model->listByUsers($userA, $userB, $limit, $offset);
    }

    public function send(int $fromUserId, int $toUserId, array $data): array {
        $body = trim((string)($data['message'] ?? ''));
        if ($body === '') {
            http_response_code(400);
            return ['error' => 'message is required'];
        }
        $pdo = get_pdo_connection();
        $model = new Message($pdo);
        $id = $model->send($fromUserId, $toUserId, $body);
        return ['status' => 'sent', 'messageId' => $id];
    }
}

?>

