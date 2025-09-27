<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/JobApplication.php';

class applicationController {
    public function apply(array $data): array {
        $jobId = (int)($data['job_id'] ?? 0);
        $studentId = (int)($data['student_id'] ?? 0);
        $cover = isset($data['cover_letter']) ? (string)$data['cover_letter'] : null;
        $resume = isset($data['resume']) ? (string)$data['resume'] : null;
        if ($jobId <= 0 || $studentId <= 0) {
            http_response_code(400);
            return ['error' => 'job_id and student_id are required'];
        }
        $pdo = get_pdo_connection();
        $model = new JobApplication($pdo);
        try {
            $id = $model->apply($jobId, $studentId, $cover, $resume);
            return ['status' => 'applied', 'applicationId' => $id];
        } catch (Throwable $e) {
            // Likely duplicate due to unique constraint
            http_response_code(409);
            return ['error' => 'Already applied'];
        }
    }

    public function listByJob(int $jobId): array {
        $pdo = get_pdo_connection();
        $model = new JobApplication($pdo);
        return $model->listByJob($jobId);
    }

    public function listByStudent(int $studentId): array {
        $pdo = get_pdo_connection();
        $model = new JobApplication($pdo);
        return $model->listByStudent($studentId);
    }
}

?>

