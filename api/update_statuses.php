<?php
// /api/update_statuses.php
// This API updates both the factor and table statuses in a single transaction.

require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (empty($input['factor_id']) || empty($input['table_id']) || empty($input['factor_status']) || empty($input['table_status'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'فیلدهای ضروری (factor_id, table_id, factor_status, table_status) موجود نیستند.']);
    exit();
}

try {
    $pdo->beginTransaction();

    // Update factor status
    $factor_sql = "UPDATE factor SET status = ? WHERE id = ?";
    $factor_stmt = $pdo->prepare($factor_sql);
    $factor_stmt->execute([$input['factor_status'], $input['factor_id']]);

    // Update table status
    $table_sql = "UPDATE tables SET status = ? WHERE id = ?";
    $table_stmt = $pdo->prepare($table_sql);
    $table_stmt->execute([$input['table_status'], $input['table_id']]);

    $pdo->commit();

    echo json_encode(['status' => 'success', 'message' => 'وضعیت‌ها با موفقیت بروزرسانی شدند.']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'بروزرسانی وضعیت‌ها ناموفق بود: ' . $e->getMessage()]);
}
?>
