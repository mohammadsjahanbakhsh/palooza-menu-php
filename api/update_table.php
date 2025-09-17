<?php
// /api/update_table.php
require_once __DIR__ . '/bootstrap.php';

// Get the JSON input from the request body
$input = json_decode(file_get_contents('php://input'), true);

// A table ID is required to know which table to update
if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Table ID is required.']);
    exit();
}

$fieldsToUpdate = [];
$params = [];
$types = ''; // For bind_param type string if using mysqli

// Dynamically build the query based on the fields provided in the input
if (isset($input['name'])) {
    $fieldsToUpdate[] = 'name = ?';
    $params[] = $input['name'];
    $types .= 's';
}
if (isset($input['capacity'])) {
    $fieldsToUpdate[] = 'capacity = ?';
    $params[] = $input['capacity'];
    $types .= 'i';
}
if (isset($input['hallId'])) {
    $fieldsToUpdate[] = 'hall_id = ?'; // Assuming DB column is 'hall_id'
    $params[] = $input['hallId'];
    $types .= 's';
}
if (isset($input['status'])) {
    $fieldsToUpdate[] = 'status = ?';
    $params[] = $input['status'];
    $types .= 's';
}

// If no fields to update were sent, return an error
if (empty($fieldsToUpdate)) {
    http_response_code(400);
    echo json_encode(['error' => 'No fields to update were provided.']);
    exit();
}

// Construct the final SQL UPDATE statement
$sql = "UPDATE tables SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
$params[] = $input['id']; // Add the table ID to the end of the parameters array
$types .= 's';

try {
    // Prepare and execute the statement
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Check if any rows were actually updated
    $updatedRows = $stmt->rowCount();
    if ($updatedRows > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Table updated successfully.', 'updated_rows' => $updatedRows]);
    } else {
        echo json_encode(['status' => 'success', 'message' => 'No changes were made to the table.', 'updated_rows' => 0]);
    }

} catch (PDOException $e) {
    // Handle potential database errors
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>