<?php
// /api/update_hall.php
require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Hall ID is required.']);
    exit();
}

$fieldsToUpdate = [];
$params = [];

if (isset($input['name'])) {
    $fieldsToUpdate[] = 'name = ?';
    $params[] = $input['name'];
}
if (isset($input['floor_id'])) {
    $fieldsToUpdate[] = 'floor_id = ?';
    $params[] = $input['floor_id'];
}

if (empty($fieldsToUpdate)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update were provided.']);
    exit();
}

// نام جدول 'halls' و کلید اصلی 'id' صحیح است
$sql = "UPDATE halls SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
$params[] = $input['id'];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['status' => 'success', 'message' => 'Hall updated successfully.', 'updated_rows' => $stmt->rowCount()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>