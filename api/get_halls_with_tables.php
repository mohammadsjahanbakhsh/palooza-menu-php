<?php
// /api/get_halls_with_tables.php
require_once __DIR__ . '/bootstrap.php';

try {
    // ابتدا تمام سالن‌ها را می‌گیریم
    $halls_stmt = $pdo->query("SELECT * FROM halls ORDER BY floor_id, id");
    $halls = $halls_stmt->fetchAll();

    // سپس تمام میزها را می‌گیریم
    $tables_stmt = $pdo->query("SELECT * FROM tables ORDER BY name");
    $tables = $tables_stmt->fetchAll();

    // میزها را به سالن‌های مربوطه اضافه می‌کنیم
    foreach ($halls as $h_key => $hall) {
        $halls[$h_key]['tables'] = []; // یک آرایه خالی برای میزهای هر سالن ایجاد می‌کنیم
        foreach ($tables as $t_key => $table) {
            if ($table['hall_id'] == $hall['id']) {
                $halls[$h_key]['tables'][] = $table;
            }
        }
    }

    echo json_encode($halls);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>