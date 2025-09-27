<?php
declare(strict_types=1);

class JobApplication {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function apply(int $jobId, int $studentId, ?string $coverLetter = null, ?string $resume = null): int {
        $stmt = $this->pdo->prepare('INSERT INTO job_applications (job_id, student_id, cover_letter, resume) VALUES (?, ?, ?, ?)');
        $stmt->execute([$jobId, $studentId, $coverLetter, $resume]);
        return (int)$this->pdo->lastInsertId();
    }

    public function listByJob(int $jobId): array {
        $stmt = $this->pdo->prepare('SELECT ja.id, ja.job_id, ja.student_id, ja.status, ja.applied_at, ja.cover_letter, ja.resume, u.name AS student_name, u.student_id FROM job_applications ja JOIN users u ON u.id = ja.student_id WHERE ja.job_id = ? ORDER BY ja.applied_at DESC');
        $stmt->execute([$jobId]);
        return $stmt->fetchAll();
    }

    public function listByStudent(int $studentId): array {
        $stmt = $this->pdo->prepare('SELECT ja.id, ja.job_id, ja.student_id, ja.status, ja.applied_at, ja.cover_letter, ja.resume, j.title AS job_title, j.company AS job_company, j.location AS job_location FROM job_applications ja JOIN jobs j ON j.id = ja.job_id WHERE ja.student_id = ? ORDER BY ja.applied_at DESC');
        $stmt->execute([$studentId]);
        return $stmt->fetchAll();
    }
}

?>

