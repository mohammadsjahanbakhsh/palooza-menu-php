<?php
// /api/update_factor.php
require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

// We need the ID of the factor to update
if (!isset($input['id'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Factor ID is required.']);
    exit();
}

$fieldsToUpdate = [];
$params = [];

// Check for the 'status' field to update it
if (isset($input['status'])) {
    $fieldsToUpdate[] = 'status = ?';
    $params[] = $input['status'];
}

// You can add other fields here if you need to edit them too
// if (isset($input['invoice_amount'])) {
//     $fieldsToUpdate[] = 'invoice_amount = ?';
//     $params[] = $input['invoice_amount'];
// }

if (empty($fieldsToUpdate)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'No fields to update were provided.']);
    exit();
}

// Build the final SQL query
$sql = "UPDATE factor SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
$params[] = $input['id'];

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    echo json_encode(['status' => 'success', 'message' => 'Factor updated successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>