<?php
// /api/update_menu_item.php
require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Menu item ID is required.']);
    exit();
}

$fieldsToUpdate = [];
$params = [];

if (isset($input['category_id'])) {
    $fieldsToUpdate[] = 'category_id = ?';
    $params[] = $input['category_id'];
}
if (isset($input['name'])) {
    $fieldsToUpdate[] = 'name = ?';
    $params[] = $input['name'];
}
if (isset($input['price'])) {
    $fieldsToUpdate[] = 'price = ?';
    $params[] = $input['price'];
}
if (isset($input['is_100_arabica'])) {
    $fieldsToUpdate[] = 'is_100_arabica = ?';
    $params[] = $input['is_100_arabica'];
}

if (empty($fieldsToUpdate)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update were provided.']);
    exit();
}

$sql = "UPDATE menu_items SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
$params[] = $input['id'];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['status' => 'success', 'message' => 'Menu item updated successfully.', 'updated_rows' => $stmt->rowCount()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>