<?php
// /api/create_table.php
require_once __DIR__ . '/bootstrap.php';
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['name']) || !isset($input['capacity']) || !isset($input['hall_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, capacity, and hall_id are required.']);
    exit();
}

try {
    $sql = "INSERT INTO tables (name, capacity, hall_id) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$input['name'], $input['capacity'], $input['hall_id']]);
    echo json_encode(['status' => 'success', 'message' => 'Table created successfully.', 'new_table_id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>