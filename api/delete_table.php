<?php
// Set the content type to JSON for the response
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Origin: *"); // For development only. In production, restrict this to your domain.

// 1. Include your database connection file
require_once __DIR__ . '/bootstrap.php';

// 2. Check for the correct HTTP method (DELETE)
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['message' => 'Method Not Allowed.']);
    exit();
}

// 3. Get the table ID from the URL query parameter
if (!isset($_GET['id'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['message' => 'Table ID is missing.']);
    exit();
}
$tableId = $_GET['id'];

// 4. Prepare the SQL statement to prevent SQL injection
$sql = "DELETE FROM tables WHERE id = ?";

$stmt = $conn->prepare($sql);

if ($stmt === false) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['message' => 'Failed to prepare the SQL statement.']);
    exit();
}

// 5. Bind the parameter and execute the query
$stmt->bind_param("s", $tableId); // "s" means the parameter is a string

if ($stmt->execute()) {
    // 6. Check if a row was actually deleted
    if ($stmt->affected_rows > 0) {
        http_response_code(200); // OK
        echo json_encode(['message' => 'Table deleted successfully.']);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(['message' => 'Table not found or already deleted.']);
    }
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['message' => 'Failed to execute the query.']);
}

// 7. Close the statement and connection
$stmt->close();
$conn->close();

?>