<?php
declare(strict_types=1);

class User {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->pdo->prepare('SELECT id, name, email, student_id, password FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findByStudentId(string $studentId): ?array {
        $stmt = $this->pdo->prepare('SELECT id, name, email, student_id, password FROM users WHERE student_id = ? LIMIT 1');
        $stmt->execute([$studentId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT id, name, email, student_id, user_type, department_id, batch_id, current_job, designation, company, location_city, location_country, bio, skills, interests, linkedin, github, instagram, facebook, twitter, website, resume, resume_visibility, profile_visibility, created_at FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function create(string $name, string $email, string $studentId, string $passwordHash, string $userType = 'student', int $departmentId = 1, ?int $batchId = null): int {
        $stmt = $this->pdo->prepare('INSERT INTO users (name, email, student_id, password, user_type, department_id, batch_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$name, $email, $studentId, $passwordHash, $userType, $departmentId, $batchId]);
        return (int)$this->pdo->lastInsertId();
    }

    public function updateProfile(int $id, array $fields): bool {
        $allowed = ['name', 'current_job', 'designation', 'company', 'location_city', 'location_country', 'bio', 'skills', 'interests', 'linkedin', 'github', 'instagram', 'facebook', 'twitter', 'website', 'resume', 'resume_visibility', 'profile_visibility'];
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
        $values[] = $id;
        $sql = 'UPDATE users SET ' . implode(', ', $set) . ' WHERE id = ?';
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($values);
    }

    public function updatePassword(int $id, string $newPasswordHash): bool {
        $stmt = $this->pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
        return $stmt->execute([$newPasswordHash, $id]);
    }
}

?>

