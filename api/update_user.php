<?php
// /api/update_user.php
require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID is required.']);
    exit();
}

$fieldsToUpdate = [];
$params = [];

// ستون‌هایی که می‌توانند آپدیت شوند
if (isset($input['username'])) {
    $fieldsToUpdate[] = 'username = ?';
    $params[] = $input['username'];
}
if (isset($input['mobile'])) {
    $fieldsToUpdate[] = 'mobile = ?';
    $params[] = $input['mobile'];
}
if (isset($input['full_name'])) {
    $fieldsToUpdate[] = 'full_name = ?';
    $params[] = $input['full_name'];
}
if (isset($input['role'])) {
    $fieldsToUpdate[] = 'role = ?';
    $params[] = $input['role'];
}
if (isset($input['is_active'])) {
    $fieldsToUpdate[] = 'is_active = ?';
    $params[] = $input['is_active'];
}

if (empty($fieldsToUpdate)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update were provided.']);
    exit();
}

$sql = "UPDATE system_users SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
$params[] = $input['id'];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['status' => 'success', 'message' => 'User updated successfully.', 'updated_rows' => $stmt->rowCount()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>