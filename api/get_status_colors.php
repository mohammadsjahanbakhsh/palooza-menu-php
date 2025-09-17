<?php
// /api/get_status_colors.php
require_once __DIR__ . '/bootstrap.php';

try {
    // نام جدول در این کوئری اصلاح شد
    $stmt = $pdo->query("SELECT status_key, label, color_hex FROM tables_status_color");
    $styles = $stmt->fetchAll(PDO::FETCH_ASSOC); 

    $formattedStyles = [];
    foreach ($styles as $row) {
        $formattedStyles[$row['status_key']] = [
            'label' => $row['label'],
            'color' => $row['color_hex']
        ];
    }

    echo json_encode($formattedStyles);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>