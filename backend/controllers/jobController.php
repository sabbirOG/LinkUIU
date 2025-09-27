<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../models/Job.php';

class jobController {
    public function listJobs(): array {
        $pdo = get_pdo_connection();
        $jobModel = new Job($pdo);
        $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 50;
        $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
        return $jobModel->listAll($limit, $offset);
    }

    public function createJob(array $data): array {
        $title = trim((string)($data['title'] ?? ''));
        $company = trim((string)($data['company'] ?? ''));
        $location = trim((string)($data['location'] ?? ''));
        $postedBy = (int)($data['posted_by'] ?? 0);
        $description = isset($data['description']) ? (string)$data['description'] : null;
        if ($title === '' || $company === '' || $postedBy <= 0) {
            http_response_code(400);
            return ['error' => 'title, company, posted_by are required'];
        }
        $pdo = get_pdo_connection();
        $jobModel = new Job($pdo);
        $jobId = $jobModel->create($title, $company, $location, $postedBy, $description);
        return ['status' => 'created', 'jobId' => $jobId];
    }

    public function getJob(int $jobId): array {
        $pdo = get_pdo_connection();
        $jobModel = new Job($pdo);
        $job = $jobModel->findById($jobId);
        if (!$job) {
            http_response_code(404);
            return ['error' => 'Job not found'];
        }
        return $job;
    }

    public function updateJob(int $jobId, int $authUserId, array $data): array {
        $pdo = get_pdo_connection();
        $jobModel = new Job($pdo);
        $job = $jobModel->findById($jobId);
        if (!$job) {
            http_response_code(404);
            return ['error' => 'Job not found'];
        }
        if ((int)$job['posted_by'] !== $authUserId) {
            http_response_code(403);
            return ['error' => 'Forbidden'];
        }
        $ok = $jobModel->update($jobId, [
            'title' => $data['title'] ?? null,
            'company' => $data['company'] ?? null,
            'description' => $data['description'] ?? null,
            'location' => $data['location'] ?? null,
        ]);
        if (!$ok) {
            http_response_code(400);
            return ['error' => 'Nothing to update'];
        }
        return ['status' => 'updated'];
    }

    public function deleteJob(int $jobId, int $authUserId): array {
        $pdo = get_pdo_connection();
        $jobModel = new Job($pdo);
        $job = $jobModel->findById($jobId);
        if (!$job) {
            http_response_code(404);
            return ['error' => 'Job not found'];
        }
        if ((int)$job['posted_by'] !== $authUserId) {
            http_response_code(403);
            return ['error' => 'Forbidden'];
        }
        $jobModel->delete($jobId);
        return ['status' => 'deleted'];
    }
}

?>

