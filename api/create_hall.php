<?php
// /api/create_hall.php
require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

// اعتبارسنجی ورودی
if (!isset($input['name']) || !isset($input['floor_id'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Hall name and floor ID are required.']);
    exit();
}

try {
    $sql = "INSERT INTO halls (name, floor_id) VALUES (?, ?)";
        $stmt = $pdo->prepare($sql);
    $stmt->execute([$input['name'], $input['floor_id']]);

    // ID رکورد جدیدی که ایجاد شده را برمی‌گردانیم
    $newHallId = $pdo->lastInsertId();

    echo json_encode([
        'status' => 'success',
        'message' => 'Hall created successfully.',
        'new_hall_id' => $newHallId
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>