<?php
// /api/transfer_order.php

require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['factor_id']) || empty($input['source_table_id']) || empty($input['destination_table_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'شناسه‌های فاکتور، میز مبدأ و میز مقصد الزامی هستند.']);
    exit();
}

try {
    $pdo->beginTransaction();

    // 1. بررسی کن که میز مقصد حتما خالی باشد
    $dest_stmt = $pdo->prepare("SELECT status FROM tables WHERE id = ?");
    $dest_stmt->execute([$input['destination_table_id']]);
    $destination_table = $dest_stmt->fetch();

    if (!$destination_table || $destination_table['status'] !== 'free') {
        throw new Exception('میز مقصد انتخاب شده دیگر خالی نیست.');
    }

    // 2. شناسه میز را در فاکتور تغییر بده
    $factor_stmt = $pdo->prepare("UPDATE factor SET table_id = ? WHERE id = ?");
    $factor_stmt->execute([$input['destination_table_id'], $input['factor_id']]);

    // 3. میز مبدأ را خالی کن
    $source_stmt = $pdo->prepare("UPDATE tables SET status = 'free' WHERE id = ?");
    $source_stmt->execute([$input['source_table_id']]);

    // 4. میز مقصد را به حالت سرویس‌دهی در بیاور
    $dest_update_stmt = $pdo->prepare("UPDATE tables SET status = 'serving' WHERE id = ?");
    $dest_update_stmt->execute([$input['destination_table_id']]);

    $pdo->commit();

    echo json_encode(['status' => 'success', 'message' => 'سفارش با موفقیت به میز جدید منتقل شد.']);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'خطا در انتقال سفارش: ' . $e->getMessage()]);
}
?>
