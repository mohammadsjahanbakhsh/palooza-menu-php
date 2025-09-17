<?php
// /api/update_status_color.php
require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['status_key']) || !isset($input['color_hex'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Status key and color hex are required.']);
    exit();
}

try {
    // نام جدول در این کوئری اصلاح شد
    $sql = "UPDATE tables_status_color SET color_hex = ? WHERE status_key = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$input['color_hex'], $input['status_key']]);

    echo json_encode(['status' => 'success', 'message' => 'Style updated successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>