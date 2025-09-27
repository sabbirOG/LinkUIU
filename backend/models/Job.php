<?php
declare(strict_types=1);

class Job {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function listAll(int $limit = 50, int $offset = 0): array {
        $stmt = $this->pdo->prepare('SELECT id, posted_by, title, company, location, created_at FROM jobs ORDER BY created_at DESC LIMIT ? OFFSET ?');
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function create(string $title, string $company, string $location, int $postedBy, ?string $description = null): int {
        $stmt = $this->pdo->prepare('INSERT INTO jobs (posted_by, title, company, description, location) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$postedBy, $title, $company, $description, $location]);
        return (int)$this->pdo->lastInsertId();
    }

    public function findById(int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT id, posted_by, title, company, description, location, created_at FROM jobs WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function update(int $jobId, array $fields): bool {
        $allowed = ['title', 'company', 'description', 'location'];
        $set = [];
        $values = [];
        foreach ($allowed as $key) {
            if (array_key_exists($key, $fields) && $fields[$key] !== null) {
                $set[] = "$key = ?";
                $values[] = $fields[$key];
            }
        }
        if (!$set) {
            return false;
        }
        $values[] = $jobId;
        $sql = 'UPDATE jobs SET ' . implode(', ', $set) . ' WHERE id = ?';
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete(int $jobId): bool {
        $stmt = $this->pdo->prepare('DELETE FROM jobs WHERE id = ?');
        return $stmt->execute([$jobId]);
    }
}

?>

