// api/register.php
<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require __DIR__ . '/../config/db.php';

$input = json_decode(file_get_contents('php://input') ?: '{}', true);

$name     = trim($input['name']     ?? '');
$username = trim($input['username'] ?? '');
$password = (string)($input['password'] ?? '');
$mobile   = trim($input['mobile']   ?? '');
$role     = trim($input['role']     ?? 'staff');

if ($name === '' || $username === '' || $password === '' || $mobile === '') {
  echo json_encode(['status'=>'error','message'=>'تمام فیلدها الزامی است']); exit;
}

// چک یکتایی نام کاربری
$chk = $pdo->prepare('SELECT 1 FROM system_users WHERE username = ? LIMIT 1');
$chk->execute([$username]);
if ($chk->fetch()) {
  echo json_encode(['status'=>'error','message'=>'نام کاربری تکراری است']); exit;
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare("
  INSERT INTO system_users (name, username, password, mobile, role, created_at)
  VALUES (?, ?, ?, ?, ?, NOW())
");

$ok = $stmt->execute([$name, $username, $hash, $mobile, $role]);

if ($ok) {
  echo json_encode(['status'=>'success','message'=>'ثبت‌نام با موفقیت انجام شد']); 
} else {
  echo json_encode(['status'=>'error','message'=>'خطا در ثبت‌نام']); 
}
