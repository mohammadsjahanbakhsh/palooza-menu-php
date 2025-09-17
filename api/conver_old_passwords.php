<?php
/**
 * ONE-TIME ADMINISTRATIVE SCRIPT
 *
 * This script finds users with plain-text passwords and securely hashes them.
 * It is a sensitive tool and must be run by an authenticated admin.
 *
 * ⚠️ SECURITY WARNING: After running this successfully one time,
 * you MUST DELETE IT from your server.
 */

// 1. Use the bootstrap file for a consistent setup (DB, CORS, etc.)
require_once __DIR__ . '/bootstrap.php';

// 2. Get the admin's credentials from the request body to authorize this action
$input = json_decode(file_get_contents('php://input'), true);
$adminUsername = $input['adminUsername'] ?? '';
$adminPassword = $input['adminPassword'] ?? '';

// Basic validation
if (empty($adminUsername) || empty($adminPassword)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Admin username and password are required to run this script.']);
    exit();
}

try {
    // 3. Authenticate the admin user
    $stmt = $pdo->prepare("SELECT password, role FROM system_users WHERE username = ?");
    $stmt->execute([$adminUsername]);
    $admin = $stmt->fetch();

    // Verify the admin exists, their password is correct, and their role is 'admin'
    // This assumes the admin's own password is ALREADY hashed.
    if (!$admin || !password_verify($adminPassword, $admin['password']) || $admin['role'] !== 'admin') {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Invalid admin credentials or insufficient permissions.']);
        exit();
    }

    // 4. Find all users to check their passwords
    $stmt = $pdo->query("SELECT id, password FROM system_users");
    $users = $stmt->fetchAll();

    $updatedCount = 0;
    $updateStmt = $pdo->prepare("UPDATE system_users SET password = ? WHERE id = ?");

    foreach ($users as $user) {
        // Check if the password is NOT already hashed (algo will be 0 for plain text)
        if (password_get_info($user['password'])['algo'] === 0) {
            $hashedPassword = password_hash($user['password'], PASSWORD_BCRYPT);
            $updateStmt->execute([$hashedPassword, $user['id']]);
            $updatedCount++;
        }
    }

    // 5. Send a success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Password hashing process completed.',
        'updated_users_count' => $updatedCount
    ]);

} catch (PDOException $e) {
    // 6. Catch any database errors
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>