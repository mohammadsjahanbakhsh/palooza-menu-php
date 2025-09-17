<?php
// /api/create_table.php
require_once __DIR__ . '/bootstrap.php';
$input = json_decode(file_get_contents('php://input'), true);

// 💡 Improved Validation: Check for 'hallId' (camelCase) to match the frontend.
// Also, ensure the name is a non-empty string after trimming whitespace.
if (
    !isset($input['name'], $input['capacity'], $input['hallId']) ||
    trim($input['name']) === ''
) {
    http_response_code(400);
    echo json_encode(['error' => 'A non-empty name, capacity, and hallId are required.']);
    exit();
}

try {
    // The database column is likely 'hall_id' (snake_case)
    $sql = "INSERT INTO tables (name, capacity, hall_id, status) VALUES (?, ?, ?, 'free')";
    $stmt = $pdo->prepare($sql);
    
    // Note: We use $input['hallId'] from the request
    $stmt->execute([$input['name'], $input['capacity'], $input['hallId']]);
    
    $newTableId = $pdo->lastInsertId();
    
    // ✅ Best Practice: Return a 201 Created status code for successful creation.
    http_response_code(201); 
    echo json_encode([
        'status' => 'success', 
        'message' => 'Table created successfully.', 
        'id' => $newTableId
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>