<?php
// /api/update_order.php
require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID is required.']);
    exit();
}

$fieldsToUpdate = [];
$params = [];

if (isset($input['table_id'])) {
    $fieldsToUpdate[] = 'table_id = ?';
    $params[] = $input['table_id'];
}
if (isset($input['status'])) {
    $fieldsToUpdate[] = 'status = ?';
    $params[] = $input['status'];
}
if (isset($input['total_price'])) {
    $fieldsToUpdate[] = 'total_price = ?';
    $params[] = $input['total_price'];
}
if (isset($input['user_id'])) {
    $fieldsToUpdate[] = 'user_id = ?';
    $params[] = $input['user_id'];
}

if (empty($fieldsToUpdate)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update were provided.']);
    exit();
}

$sql = "UPDATE orders SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
$params[] = $input['id'];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['status' => 'success', 'message' => 'Order updated successfully.', 'updated_rows' => $stmt->rowCount()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>