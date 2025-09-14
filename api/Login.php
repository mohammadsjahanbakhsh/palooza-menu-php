<?php
// اجازهٔ CORS و هدرها
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// JSON response
header('Content-Type: application/json; charset=utf-8');
session_start();

// بارگذاری PDO
require __DIR__ . '/../config/db.php';

// خواندن ورودی JSON
$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username']  ?? '');
$password = trim($input['password']  ?? '');

// اعتبارسنجی اولیه
if ($username === '' || $password === '') {
  http_response_code(400);
  echo json_encode([
    'status'  => 'error',
    'message' => 'نام کاربری یا رمز عبور خالی است'
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // جستجوی کاربر
  $stmt = $pdo->prepare("
    SELECT id, name, username, password, mobile, role
    FROM system_users
    WHERE username = ?
    LIMIT 1
  ");
  $stmt->execute([$username]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  // بررسی رمز عبور
  if ($user && password_verify($password, $user['password'])) {
    unset($user['password']);    // حذف فیلد رمز قبل از خروجی
    $_SESSION['user'] = $user;   // ذخیره در سشن (اختیاری)

    echo json_encode([
      'status'  => 'success',
      'message' => 'ورود موفق',
      'user'    => $user
    ], JSON_UNESCAPED_UNICODE);
  } else {
    http_response_code(401);
    echo json_encode([
      'status'  => 'error',
      'message' => 'نام کاربری یا رمز عبور اشتباه است'
    ], JSON_UNESCAPED_UNICODE);
  }
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode([
    'status'  => 'error',
    'message' => 'خطا در اجرای کوئری پایگاه داده'
  ], JSON_UNESCAPED_UNICODE);
}
