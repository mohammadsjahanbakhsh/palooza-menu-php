<?php
// /api/update_menu_category.php
require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Category ID is required.']);
    exit();
}

$fieldsToUpdate = [];
$params = [];

if (isset($input['name'])) {
    $fieldsToUpdate[] = 'name = ?';
    $params[] = $input['name'];
}

if (empty($fieldsToUpdate)) {
    http_response_code(400);
    echo json_encode(['error' => 'The name field is required to update.']);
    exit();
}

$sql = "UPDATE menu_categories SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
$params[] = $input['id'];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['status' => 'success', 'message' => 'Menu category updated successfully.', 'updated_rows' => $stmt->rowCount()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>