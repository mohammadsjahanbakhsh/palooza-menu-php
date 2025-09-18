<?php
// /api/update_table_status.php
// This API updates the status of a single table.

require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

// Validate input: ensure we have the table ID and the new status
if (!isset($input['id']) || !isset($input['status'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'شناسه میز (id) و وضعیت جدید (status) الزامی هستند.']);
    exit();
}

try {
    // Prepare and execute the update query
    $sql = "UPDATE tables SET status = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$input['status'], $input['id']]);

    // Check if any row was actually updated
    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'وضعیت میز با موفقیت بروزرسانی شد.']);
    } else {
        // This can happen if the table ID does not exist
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'میزی با این شناسه یافت نشد.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'بروزرسانی وضعیت میز ناموفق بود: ' . $e->getMessage()]);
}
?>

