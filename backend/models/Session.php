<?php
declare(strict_types=1);

class Session {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function create(int $userId, string $token, ?string $expiresAt = null): int {
        $hash = hash('sha256', $token);
        $stmt = $this->pdo->prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)');
        $stmt->execute([$userId, $hash, $expiresAt]);
        return (int)$this->pdo->lastInsertId();
    }

    public function deleteExpired(): int {
        $stmt = $this->pdo->prepare('DELETE FROM sessions WHERE expires_at IS NOT NULL AND expires_at < NOW()');
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function findByToken(string $token): ?array {
        $hash = hash('sha256', $token);
        $stmt = $this->pdo->prepare('SELECT id, user_id, token, created_at, expires_at FROM sessions WHERE token = ? LIMIT 1');
        $stmt->execute([$hash]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return null;
        }
        if (!empty($row['expires_at']) && strtotime((string)$row['expires_at']) < time()) {
            return null;
        }
        return $row;
    }

    public function deleteByToken(string $token): bool {
        $hash = hash('sha256', $token);
        $stmt = $this->pdo->prepare('DELETE FROM sessions WHERE token = ?');
        return $stmt->execute([$hash]);
    }
}

?>


