<?php
// /api/schedule_reservation.php

require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['table_id']) || empty($input['reservation_time'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'شناسه میز و زمان رزرو الزامی است.']);
    exit();
}

try {
    // فقط میزهای خالی را می‌توان برای آینده رزرو کرد
    $check_stmt = $pdo->prepare("SELECT status FROM tables WHERE id = ?");
    $check_stmt->execute([$input['table_id']]);
    $table = $check_stmt->fetch();

    if ($table && $table['status'] !== 'free') {
        http_response_code(409); // Conflict
        echo json_encode(['status' => 'error', 'message' => 'این میز در حال حاضر آزاد نیست و نمی‌توان آن را رزرو کرد.']);
        exit();
    }

    $sql = "UPDATE tables SET reservation_time = ?, is_reservation_notified = 0 WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$input['reservation_time'], $input['table_id']]);

    echo json_encode(['status' => 'success', 'message' => 'میز با موفقیت برای زمان مورد نظر رزرو شد.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'خطا در ثبت رزرو: ' . $e->getMessage()]);
}
?>
