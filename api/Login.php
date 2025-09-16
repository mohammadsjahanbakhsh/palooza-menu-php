<?php
/**
 * API Endpoint: Login
 * Authenticates a user based on username and password.
 */

// 1. Use the bootstrap file for a consistent setup
require_once __DIR__ . '/bootstrap.php';

// 2. Get the input from the request body
$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$password = $input['password'] ?? '';

// 3. Basic validation
if (empty($username) || empty($password)) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Username and password are required.']);
    exit();
}

try {
    // 4. Prepare and execute the query to find the user
    $stmt = $pdo->prepare("
        SELECT id, username, password, full_name, role 
        FROM system_users 
        WHERE username = ? AND is_active = 1
    ");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    // 5. Verify the user exists and the password is correct
    // This securely compares the provided password with the hashed password in the database.
    if ($user && password_verify($password, $user['password'])) {
        
        // IMPORTANT: Do not send the password hash back to the client!
        unset($user['password']);

        // In a real production app, you would generate a JWT (JSON Web Token) here.
        // For now, we return the user object.
        echo json_encode([
            'status' => 'success',
            'user' => $user
        ]);

    } else {
        // Use a generic error message for security
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Invalid username or password.']);
    }

} catch (PDOException $e) {
    // 6. Catch any database errors
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>