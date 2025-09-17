<?php
// /api/update_reservation.php
require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Reservation ID is required.']);
    exit();
}

$fieldsToUpdate = [];
$params = [];

if (isset($input['reserve_date'])) {
    $fieldsToUpdate[] = 'reserve_date = ?';
    $params[] = $input['reserve_date'];
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

$sql = "UPDATE reservations SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
$params[] = $input['id'];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['status' => 'success', 'message' => 'Reservation updated successfully.', 'updated_rows' => $stmt->rowCount()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>