<?php
// /api/save_color_settings.php
require_once __DIR__ . '/bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'No color data provided.']);
    exit();
}

try {
    $sql = "INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)";
    $stmt = $pdo->prepare($sql);

    // Map frontend keys to database keys and execute for each
    $key_map = [
        'tableEmpty' => 'tableColorEmpty',
        'tableReserved' => 'tableColorReserved',
        'tableOccupied' => 'tableColorOccupied',
        'tablePaid' => 'tableColorPaid',
    ];

    foreach ($input as $key => $value) {
        if (isset($key_map[$key])) {
            $stmt->execute([$key_map[$key], $value]);
        }
    }
    
    echo json_encode(['status' => 'success', 'message' => 'Color settings saved successfully.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>