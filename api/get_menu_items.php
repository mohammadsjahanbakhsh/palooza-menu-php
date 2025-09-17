<?php
// /api/get_menu_items.php
require_once __DIR__ . '/bootstrap.php';

try {
    $stmt = $pdo->query("SELECT mi.*, mc.name as category_name FROM menu_items mi JOIN menu_categories mc ON mi.category_id = mc.id ORDER BY mc.id, mi.name");
    $menu_items = $stmt->fetchAll();
    echo json_encode($menu_items);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>