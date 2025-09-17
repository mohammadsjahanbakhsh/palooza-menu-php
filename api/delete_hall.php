<?php
// /api/delete_hall.php
require_once __DIR__ . '/bootstrap.php';
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Hall ID is required.']);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM halls WHERE id = ?");
    $stmt->execute([$input['id']]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Hall deleted successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Hall not found.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: Cannot delete a hall that has tables.']);
}
?>