<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require __DIR__ . '/../config/db.php';

header('Content-Type: application/json');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$stmt = $pdo->prepare("UPDATE tables SET status=?, last_activity=NOW() WHERE id=?");
$ok = $stmt->execute([$input['status'], $input['id']]);

echo json_encode([
  'status' => $ok ? 'success' : 'error',
  'message' => $ok ? 'Table updated' : 'Update failed'
]);
