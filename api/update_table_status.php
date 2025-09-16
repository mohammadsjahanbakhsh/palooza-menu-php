<?php
// 1. Use the bootstrap file for a consistent setup
require_once __DIR__ . '/bootstrap.php';

// 2. Get the input from the request body
$input = json_decode(file_get_contents('php://input'), true);

// 3. Basic validation
if (!isset($input['id']) || !isset($input['status'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Table ID and status are required.']);
    exit();
}

try {
    // 4. Prepare and execute the query
    $stmt = $pdo->prepare("UPDATE tables SET status = ?, last_activity = NOW() WHERE id = ?");
    $success = $stmt->execute([$input['status'], $input['id']]);

    if ($success) {
        echo json_encode(['status' => 'success', 'message' => 'Table updated successfully.']);
    } else {
        // This case is rare with PDO exceptions enabled, but good practice
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to update table.']);
    }

} catch (PDOException $e) {
    // 5. Catch any database errors
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>