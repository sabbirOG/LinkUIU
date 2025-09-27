<?php
declare(strict_types=1);

class Connection {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function listByUser(int $userId, int $limit = 50, int $offset = 0): array {
        $stmt = $this->pdo->prepare('SELECT c.id, c.user_id, c.connection_id AS target_user_id, u.name AS target_name, c.status, c.created_at FROM connections c JOIN users u ON u.id = c.connection_id WHERE c.user_id = ? ORDER BY c.id DESC LIMIT ? OFFSET ?');
        $stmt->bindValue(1, $userId, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function add(int $userId, int $targetUserId): void {
        $stmt = $this->pdo->prepare('INSERT INTO connections (user_id, connection_id, status) VALUES (?, ?, ?)');
        $stmt->execute([$userId, $targetUserId, 'pending']);
    }

    public function updateStatus(int $connectionId, string $status): bool {
        $stmt = $this->pdo->prepare('UPDATE connections SET status = ? WHERE id = ?');
        return $stmt->execute([$status, $connectionId]);
    }

    public function existsPair(int $userId, int $targetUserId): bool {
        $stmt = $this->pdo->prepare('SELECT 1 FROM connections WHERE (user_id = ? AND connection_id = ?) OR (user_id = ? AND connection_id = ?) LIMIT 1');
        $stmt->execute([$userId, $targetUserId, $targetUserId, $userId]);
        return (bool)$stmt->fetchColumn();
    }
}

?>

