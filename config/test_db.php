<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/db.php'; // مسیر رو متناسب با ساختار پروژه‌ات تنظیم کن

try {
    $stmt = $pdo->query("SELECT NOW() AS current_time");
    $row = $stmt->fetch();
    echo "✅ اتصال موفق! زمان سرور دیتابیس: " . $row['current_time'];
} catch (PDOException $e) {
    echo "❌ خطا در اتصال به دیتابیس: " . $e->getMessage();
}
