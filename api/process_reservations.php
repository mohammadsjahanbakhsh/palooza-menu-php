<?php
// /api/process_reservations.php
// This script should be run by a cron job every 5 minutes.

require_once __DIR__ . '/bootstrap.php';

try {
    // 1. تمام رزروهایی که موعدشان نزدیک است و هنوز پردازش نشده‌اند را پیدا کن
    // (زمان رزرو بین الان و 30 دقیقه آینده باشد)
    $sql = "SELECT * FROM tables WHERE 
            reservation_time IS NOT NULL AND 
            is_reservation_notified = 0 AND 
            reservation_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 MINUTE)";
    
    $stmt = $pdo->query($sql);
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($reservations as $table) {
        if ($table['status'] === 'free') {
            // 2. اگر میز آزاد بود، آن را به حالت رزرو در بیاور
            $update_sql = "UPDATE tables SET status = 'reserved', is_reservation_notified = 1 WHERE id = ?";
            $update_stmt = $pdo->prepare($update_sql);
            $update_stmt->execute([$table['id']]);
            // Optional: Log success
            // file_put_contents('reservation_log.txt', "Table ID {$table['id']} successfully reserved at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
        } else {
            // 3. اگر میز آزاد نبود، هشدار ثبت کن و رزرو را پاک کن
            $clear_reservation_sql = "UPDATE tables SET reservation_time = NULL, is_reservation_notified = 1 WHERE id = ?";
            $clear_stmt = $pdo->prepare($clear_reservation_sql);
            $clear_stmt->execute([$table['id']]);
            // Log a warning
            file_put_contents('reservation_warnings.txt', "WARNING: Could not reserve Table ID {$table['id']} at " . date('Y-m-d H:i:s') . ". It was not free.\n", FILE_APPEND);
        }
    }
    
    echo "Processing complete. Found " . count($reservations) . " reservations to process.\n";

} catch (Exception $e) {
    // Log error
    file_put_contents('reservation_errors.txt', "ERROR: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
}
?>
