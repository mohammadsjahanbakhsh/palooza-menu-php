<?php
// /api/create_factor.php

require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

// 1. اعتبارسنجی داده‌های ورودی
if (empty($input['table_id']) || empty($input['system_user_id']) || !isset($input['items']) || !is_array($input['items']) || empty($input['customer_name'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'فیلدهای الزامی خالی هستند: شناسه میز، شناسه کاربر، نام مشتری و آیتم‌ها.']);
    exit();
}

try {
    // **مرحله جدید: بررسی وجود کاربر قبل از شروع تراکنش**
    // UPDATED: Corrected table name from 'system_user' to 'system_users'
    $user_check_sql = "SELECT id FROM system_users WHERE id = ?";
    $user_check_stmt = $pdo->prepare($user_check_sql);
    $user_check_stmt->execute([$input['system_user_id']]);
    if ($user_check_stmt->fetch() === false) {
        http_response_code(404); // Not Found
        echo json_encode(['status' => 'error', 'message' => 'شناسه کاربر نامعتبر است. کاربر در سیستم یافت نشد.']);
        exit();
    }

    // 2. شروع تراکنش برای اطمینان از اجرای کامل یا لغو تمام دستورات
    $pdo->beginTransaction();

    // 3. محاسبه مبلغ کل فاکتور
    $invoice_amount = 0;
    foreach ($input['items'] as $item) {
        if (isset($item['price']) && isset($item['quantity'])) {
            $invoice_amount += $item['price'] * $item['quantity'];
        }
    }
    
    // 4. دریافت داده‌ها از ورودی
    $phone = !empty($input['customer_phone']) ? $input['customer_phone'] : NULL;
    $customer_name = $input['customer_name'];
    $table_id = $input['table_id'];
    $system_user_id = $input['system_user_id'];

    // 5. ثبت رکورد اصلی در جدول 'factor'
    $factor_sql = "INSERT INTO factor (table_id, customer_name, customer_phone, invoice_amount, system_user_id, status) VALUES (?, ?, ?, ?, ?, 'open')";
    $factor_stmt = $pdo->prepare($factor_sql);
    $factor_stmt->execute([$table_id, $customer_name, $phone, $invoice_amount, $system_user_id]);
    $factor_id = $pdo->lastInsertId(); // دریافت شناسه فاکتور جدید

    // 6. ثبت هر آیتم سفارش در جدول 'order_items'
    // توجه: فرض شده ستون 'notes' در جدول order_items وجود دارد.
    $item_sql = "INSERT INTO order_items (factor_id, menu_item_id, quantity, price, notes) VALUES (?, ?, ?, ?, ?)";
    $item_stmt = $pdo->prepare($item_sql);
    foreach ($input['items'] as $item) {
        $notes = isset($item['notes']) ? $item['notes'] : null;
        $item_stmt->execute([$factor_id, $item['id'], $item['quantity'], $item['price'], $notes]);
    }

    // 7. به‌روزرسانی وضعیت میز به 'serving'
    $table_sql = "UPDATE tables SET status = 'serving' WHERE id = ?";
    $table_stmt = $pdo->prepare($table_sql);
    $table_stmt->execute([$table_id]);

    // 8. تایید نهایی تراکنش
    $pdo->commit();
    
    echo json_encode(['status' => 'success', 'message' => 'فاکتور با موفقیت ثبت شد.', 'factor_id' => $factor_id]);

} catch (Exception $e) {
    // 9. در صورت بروز خطا، تمام تغییرات لغو می‌شود
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    // ارسال پیام خطای دقیق از دیتابیس
    echo json_encode(['status' => 'error', 'message' => 'عملیات ناموفق بود: ' . $e->getMessage()]);
}
?>

