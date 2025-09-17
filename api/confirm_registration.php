<?php
// /api/confirm-registration.php

require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

$adminUsername = $input['adminUsername'] ?? '';
$adminPassword = $input['adminPassword'] ?? '';
$userToConfirm = $input['usernameToConfirm'] ?? ''; // The user who just registered

// Basic validation
if (empty($adminUsername) || empty($adminPassword) || empty($userToConfirm)) {
    http_response_code(400);
    echo json_encode(['error' => 'Admin credentials and the new username are required.']);
    exit();
}

try {
    // 1. Authenticate the admin
    $admin_stmt = $pdo->prepare("SELECT password, role FROM system_users WHERE username = ?");
    $admin_stmt->execute([$adminUsername]);
    $admin = $admin_stmt->fetch();

    if (!$admin || !password_verify($adminPassword, $admin['password']) || $admin['role'] !== 'admin') {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Invalid admin credentials or insufficient permissions.']);
        exit();
    }
    
    // 2. Find the new user and activate them
    $user_stmt = $pdo->prepare("UPDATE system_users SET is_active = 1 WHERE username = ? AND is_active = 0");
    $user_stmt->execute([$userToConfirm]);

    if ($user_stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'User has been activated successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'User not found or is already active.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>