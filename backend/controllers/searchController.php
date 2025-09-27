<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

class searchController {
    public function users(array $query): array {
        $q = trim((string)($query['q'] ?? ''));
        $departmentId = isset($query['department_id']) ? (int)$query['department_id'] : null;
        $batchId = isset($query['batch_id']) ? (int)$query['batch_id'] : null;
        $pdo = get_pdo_connection();
        $sql = 'SELECT id, name, email, department_id, batch_id, skills, location_city, location_country FROM users WHERE profile_visibility = "public"';
        $params = [];
        if ($q !== '') {
            $sql .= ' AND (name LIKE ? OR skills LIKE ?)';
            $like = '%' . $q . '%';
            $params[] = $like;
            $params[] = $like;
        }
        if ($departmentId) {
            $sql .= ' AND department_id = ?';
            $params[] = $departmentId;
        }
        if ($batchId) {
            $sql .= ' AND batch_id = ?';
            $params[] = $batchId;
        }
        $sql .= ' ORDER BY name ASC LIMIT 50';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function jobs(array $query): array {
        $q = trim((string)($query['q'] ?? ''));
        $location = trim((string)($query['location'] ?? ''));
        $pdo = get_pdo_connection();
        $sql = 'SELECT id, title, company, location, created_at FROM jobs WHERE 1=1';
        $params = [];
        if ($q !== '') {
            $sql .= ' AND (title LIKE ? OR company LIKE ?)';
            $like = '%' . $q . '%';
            $params[] = $like;
            $params[] = $like;
        }
        if ($location !== '') {
            $sql .= ' AND location LIKE ?';
            $params[] = '%' . $location . '%';
        }
        $sql .= ' ORDER BY created_at DESC LIMIT 50';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}

?>

