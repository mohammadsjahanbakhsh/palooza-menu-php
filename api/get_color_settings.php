<?php
// /api/get_color_settings.php
require_once __DIR__ . '/bootstrap.php';

try {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM app_settings WHERE setting_key LIKE 'tableColor%'");
    $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

    // Format the keys to match the frontend's ColorScheme interface (e.g., tableColorEmpty -> tableEmpty)
    $formatted_settings = [
        'tableEmpty' => $settings['tableColorEmpty'] ?? '',
        'tableReserved' => $settings['tableColorReserved'] ?? '',
        'tableOccupied' => $settings['tableColorOccupied'] ?? '',
        'tablePaid' => $settings['tableColorPaid'] ?? '',
    ];
    
    echo json_encode($formatted_settings);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>