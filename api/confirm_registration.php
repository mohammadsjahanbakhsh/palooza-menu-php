<?php
header('Content-Type: application/json');
require 'db.php';

// دریافت داده‌ها از کلاینت
$input = json_decode(file_get_contents('php://input'), true);
$adminUser = $input['adminUsername']  ?? '';
$adminPass = $input['adminPassword']  ?? '';

// واکشی اطلاعات کاربر ادمین
$stmt = $pdo->prepare("
  SELECT password, role 
  FROM system_users 
  WHERE username = :u 
  LIMIT 1
");
$stmt->execute([':u' => $adminUser]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

// بررسی نقش و اعتبارسنجی رمز
if (
  ! $admin ||
  $admin['role'] !== 'admin' ||
  ! password_verify($adminPass, $admin['password'])
) {
  http_response_code(401);
  echo json_encode([
    'status'  => 'error',
    'message' => 'Credentials invalid or not an admin'
  ]);
  exit;
}

// در صورت موفقیت
echo json_encode(['status' => 'success']);
