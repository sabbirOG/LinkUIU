<?php
declare(strict_types=1);

class Message {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function listByUsers(int $fromUserId, int $toUserId, int $limit = 100, int $offset = 0): array {
        $stmt = $this->pdo->prepare('SELECT id, sender_id, receiver_id, message, created_at FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC LIMIT ? OFFSET ?');
        $stmt->bindValue(1, $fromUserId, PDO::PARAM_INT);
        $stmt->bindValue(2, $toUserId, PDO::PARAM_INT);
        $stmt->bindValue(3, $toUserId, PDO::PARAM_INT);
        $stmt->bindValue(4, $fromUserId, PDO::PARAM_INT);
        $stmt->bindValue(5, $limit, PDO::PARAM_INT);
        $stmt->bindValue(6, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function send(int $fromUserId, int $toUserId, string $body): int {
        $stmt = $this->pdo->prepare('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)');
        $stmt->execute([$fromUserId, $toUserId, $body]);
        return (int)$this->pdo->lastInsertId();
    }
}

?>

