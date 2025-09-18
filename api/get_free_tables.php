<?php
// /api/get_free_tables.php

require_once __DIR__ . '/bootstrap.php';

try {
    $stmt = $pdo->query("SELECT id, name FROM tables WHERE status = 'free'");
    $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $tables]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'خطا در دریافت لیست میزها.']);
}
?>
