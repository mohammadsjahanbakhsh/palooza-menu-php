<?php
// /api/get_last_order.php

require_once __DIR__ . '/bootstrap.php';

// دریافت شناسه میز از پارامترهای GET
$table_id = isset($_GET['table_id']) ? (int)$_GET['table_id'] : 0;

if ($table_id === 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'شناسه میز ارائه نشده است.']);
    exit();
}

try {
    // پیدا کردن آخرین فاکتور باز برای میز مشخص شده
    $factor_sql = "SELECT * FROM factor WHERE table_id = ? AND status = 'open' ORDER BY id DESC LIMIT 1";
    $factor_stmt = $pdo->prepare($factor_sql);
    $factor_stmt->execute([$table_id]);
    $factor = $factor_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$factor) {
        // اگر فاکتور بازی پیدا نشد، یک پاسخ خالی و موفقیت آمیز برگردان
        echo json_encode(['status' => 'success', 'data' => null]);
        exit();
    }

    // گرفتن تمام آیتم‌های مربوط به آن فاکتور
    $items_sql = "SELECT * FROM order_items WHERE factor_id = ?";
    $items_stmt = $pdo->prepare($items_sql);
    $items_stmt->execute([$factor['id']]);
    $items = $items_stmt->fetchAll(PDO::FETCH_ASSOC);

    // ترکیب اطلاعات و ارسال به کلاینت
    $factor['items'] = $items;
    
    echo json_encode(['status' => 'success', 'data' => $factor]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'خطا در دریافت اطلاعات سفارش: ' . $e->getMessage()]);
}
?>
