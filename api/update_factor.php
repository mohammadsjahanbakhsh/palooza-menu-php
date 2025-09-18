<?php
// /api/update_factor.php

require_once __DIR__ . '/bootstrap.php';

// 1. دریافت داده‌های JSON از کلاینت
$input = json_decode(file_get_contents('php://input'), true);

// 2. اعتبارسنجی دقیق فیلدهای ضروری برای بروزرسانی
$errors = [];
if (empty($input['factor_id'])) {
    $errors[] = 'شناسه فاکتور (factor_id) برای بروزرسانی یافت نشد.';
}
if (empty($input['system_user_id'])) {
    $errors[] = 'شناسه کاربر سیستم (system_user_id) یافت نشد.';
}
if (empty($input['customer_name'])) {
    $errors[] = 'نام مشتری اجباری است.';
}
if (!isset($input['items']) || !is_array($input['items'])) {
    $errors[] = 'لیست آیتم‌ها معتبر نیست.';
}

if (!empty($errors)) {
    http_response_code(400);
    // ارسال یک پیام خطای دقیق که تمام مشکلات را لیست می‌کند
    echo json_encode(['status' => 'error', 'message' => implode(' ', $errors)]);
    exit();
}

$factor_id = $input['factor_id'];
$system_user_id = $input['system_user_id'];

try {
    // اعتبارسنجی 1: بررسی وجود کاربر
    $user_check_stmt = $pdo->prepare("SELECT id FROM system_users WHERE id = ?");
    $user_check_stmt->execute([$system_user_id]);
    if ($user_check_stmt->fetch() === false) {
        http_response_code(404); // Not Found
        echo json_encode(['status' => 'error', 'message' => 'کاربر سیستم شناسایی نشد.']);
        exit();
    }

    // اعتبارسنجی 2: بررسی وجود فاکتور
    $factor_check_stmt = $pdo->prepare("SELECT id FROM factor WHERE id = ?");
    $factor_check_stmt->execute([$factor_id]);
    if ($factor_check_stmt->fetch() === false) {
        http_response_code(404); // Not Found
        echo json_encode(['status' => 'error', 'message' => 'فاکتور مورد نظر برای بروزرسانی یافت نشد.']);
        exit();
    }

    // 3. شروع تراکنش برای اطمینان از صحت عملیات
    $pdo->beginTransaction();

    // 4. گرفتن آیتم‌های فعلی سفارش از دیتابیس برای مقایسه
    $stmt = $pdo->prepare("SELECT * FROM order_items WHERE factor_id = ?");
    $stmt->execute([$factor_id]);
    $existing_items_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $existing_items = [];
    foreach ($existing_items_raw as $item) {
        $existing_items[$item['menu_item_id']] = $item; // مرتب‌سازی بر اساس شناسه آیتم منو
    }

    // 5. محاسبه مبلغ کل فاکتور جدید
    $new_invoice_amount = 0;
    foreach ($input['items'] as $item) {
        $new_invoice_amount += $item['price'] * $item['quantity'];
    }

    // 6. بروزرسانی اطلاعات اصلی فاکتور (مشتری، مبلغ و...)
    $factor_sql = "UPDATE factor SET customer_name = ?, customer_phone = ?, invoice_amount = ? WHERE id = ?";
    $factor_stmt = $pdo->prepare($factor_sql);
    $factor_stmt->execute([
        $input['customer_name'],
        !empty($input['customer_phone']) ? $input['customer_phone'] : null,
        $new_invoice_amount,
        $factor_id
    ]);

    // 7. مقایسه و بروزرسانی آیتم‌ها
    $new_item_ids = [];

    foreach ($input['items'] as $new_item) {
        $menu_item_id = $new_item['id'];
        $new_item_ids[] = $menu_item_id;

        if (isset($existing_items[$menu_item_id])) {
            // اگر آیتم از قبل وجود دارد، آن را بروزرسانی کن (UPDATE)
            $update_item_sql = "UPDATE order_items SET quantity = ?, notes = ? WHERE factor_id = ? AND menu_item_id = ?";
            $update_item_stmt = $pdo->prepare($update_item_sql);
            $update_item_stmt->execute([$new_item['quantity'], $new_item['notes'], $factor_id, $menu_item_id]);
        } else {
            // اگر آیتم جدید است، آن را اضافه کن (INSERT)
            $insert_item_sql = "INSERT INTO order_items (factor_id, menu_item_id, quantity, price, notes) VALUES (?, ?, ?, ?, ?)";
            $insert_item_stmt = $pdo->prepare($insert_item_sql);
            $insert_item_stmt->execute([$factor_id, $menu_item_id, $new_item['quantity'], $new_item['price'], $new_item['notes']]);
        }
    }

    // 8. حذف آیتم‌هایی که در سفارش جدید وجود ندارند
    foreach ($existing_items as $menu_item_id => $existing_item) {
        if (!in_array($menu_item_id, $new_item_ids)) {
            $delete_sql = "DELETE FROM order_items WHERE factor_id = ? AND menu_item_id = ?";
            $delete_stmt = $pdo->prepare($delete_sql);
            $delete_stmt->execute([$factor_id, $menu_item_id]);
        }
    }

    // 9. تایید نهایی تراکنش
    $pdo->commit();

    echo json_encode(['status' => 'success', 'message' => 'سفارش با موفقیت بروزرسانی شد.']);

} catch (Exception $e) {
    // 10. در صورت بروز خطا، تمام تغییرات را لغو کن
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'بروزرسانی سفارش ناموفق بود: ' . $e->getMessage()]);
}
?>

