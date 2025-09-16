<?php
// api/register.php

// بارگذاری هدرها، CORS و اتصال PDO از bootstrap.php
require __DIR__ . '/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

// خواندن و decode ورودی JSON
$rawInput = file_get_contents('php://input');
$input    = json_decode($rawInput, true);

// بررسی صحت JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => 'فرمت داده ارسالی معتبر نیست',
        'error'   => json_last_error_msg(),
        'raw'     => $rawInput
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// استخراج و پاک‌سازی فیلدها
$name     = isset($input['name'])     ? trim($input['name'])     : '';
$username = isset($input['username']) ? trim($input['username']) : '';
$password = isset($input['password']) ? $input['password']       : '';
$mobile   = isset($input['mobile'])   ? trim($input['mobile'])   : '';
// نقش را همیشه روی 'manager' تنظیم کن تا از ثبت‌نام ادمین جلوگیری شود
$role     = 'manager';

// اعتبارسنجی فیلدهای ضروری
if ($name === '' || $username === '' || $password === '' || $mobile === '') {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'message' => 'تمام فیلدها الزامی است',
        'input'   => $input
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // بررسی وجود کاربر با نام کاربری مشخص
    $stmt = $pdo->prepare('SELECT id, is_active FROM system_users WHERE username = :u');
    $stmt->execute([':u' => $username]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

    // هش کردن رمز عبور برای استفاده در هر دو حالت (ایجاد یا به‌روزرسانی)
    $hash = password_hash($password, PASSWORD_DEFAULT);

    if ($existingUser) {
        // کاربر وجود دارد
        if ($existingUser['is_active']) {
            // سناریو ۱: کاربر وجود دارد و فعال است
            http_response_code(409);
            echo json_encode([
                'status'  => 'error',
                'message' => 'این نام کاربری قبلاً ثبت شده و فعال است'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            // سناریو ۲: کاربر وجود دارد ولی غیرفعال است
            // اطلاعات او را به‌روزرسانی می‌کنیم (مثلاً اگر رمز جدیدی وارد کرده)
            $updateStmt = $pdo->prepare(
                'UPDATE system_users SET full_name = :n, password = :p, mobile = :m WHERE id = :id'
            );
            $updateStmt->execute([
                ':n'  => $name,
                ':p'  => $hash,
                ':m'  => $mobile,
                ':id' => $existingUser['id']
            ]);

            http_response_code(409); // Conflict, but with a specific instruction
            echo json_encode([
                'status'  => 'info', // یک وضعیت سفارشی برای راهنمایی فرانت‌اند
                'message' => 'شما قبلا ثبت نام کرده‌اید. لطفا برای فعال‌سازی، نام کاربری و رمز عبور ادمین را وارد کنید.'
            ], JSON_UNESCAPED_UNICODE);
        }
    } else {
        // سناریو ۳: کاربر وجود ندارد، پس ایجاد می‌شود
        $insert = $pdo->prepare(
            'INSERT INTO system_users (full_name, username, password, mobile, role, is_active)
             VALUES (:n, :u, :p, :m, :r, 0)'
        );
        $insert->execute([
            ':n' => $name,
            ':u' => $username,
            ':p' => $hash,
            ':m' => $mobile,
            ':r' => $role // $role از قبل روی 'manager' تنظیم شده
        ]);

        $id = $pdo->lastInsertId();
        http_response_code(201);
        echo json_encode([
            'status'  => 'success',
            'user'    => ['id' => $id, 'name' => $name],
            'message' => 'ثبت‌نام شما با موفقیت انجام شد و در انتظار تایید مدیر است'
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'خطای سرور: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

exit;
