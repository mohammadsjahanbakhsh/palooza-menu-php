<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
require __DIR__ . '/../config/db.php';
header('Content-Type: application/json');
require 'db.php';

// واکشی سالن‌ها
$stmtHalls = $pdo->prepare("SELECT id, name, floor FROM halls ORDER BY floor, id");
$stmtHalls->execute();
$halls = $stmtHalls->fetchAll(PDO::FETCH_ASSOC);

// واکشی میزها
$stmtTables = $pdo->prepare("SELECT id, name, status, last_activity, hall_id FROM tables ORDER BY hall_id, id");
$stmtTables->execute();
$tables = $stmtTables->fetchAll(PDO::FETCH_ASSOC);

// الحاق میزها به سالن‌ها
foreach ($halls as &$hall) {
    $hall['tables'] = array_values(array_filter($tables, fn($t) => $t['hall_id'] == $hall['id']));
}

echo json_encode([
    'status' => 'success',
    'halls' => $halls,
    'tables' => $tables
]);
