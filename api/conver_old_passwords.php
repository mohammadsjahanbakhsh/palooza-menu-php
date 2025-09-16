<?php
require_once __DIR__ . '/bootstrap.php';
header('Content-Type: text/plain; charset=utf-8'); // خروجی متنی UTF-8

$pdo->exec("SET NAMES utf8mb4");

try {
    // گرفتن همه کاربران
    $stmt = $pdo->query("SELECT id, username, password FROM system_users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $updatedCount = 0;

    foreach ($users as $user) {
        $info = password_get_info($user['password']);
        if (!$info['algo']) { // یعنی هش نیست
            $hashed = password_hash($user['password'], PASSWORD_DEFAULT);
            $updateStmt = $pdo->prepare("UPDATE system_users SET password = :p WHERE id = :id");
            $updateStmt->execute([
                ':p' => $hashed,
                ':id' => $user['id']
            ]);
            echo "✅ کاربر {$user['username']} هش شد.\n";
            $updatedCount++;
        }
    }

    echo "تمام شد! {$updatedCount} رمز قدیمی به هش تبدیل شد.\n";

} catch (PDOException $e) {
    echo "❌ خطا: " . $e->getMessage();
}
