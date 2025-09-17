<?php
// /api/get_menu_data.php
require_once __DIR__ . '/bootstrap.php';
try {
    $categories_stmt = $pdo->query("SELECT * FROM menu_categories ORDER BY id");
    $menu_items_stmt = $pdo->query("SELECT * FROM menu_items ORDER BY category_id, name");
    
    $data = [
        'categories' => $categories_stmt->fetchAll(),
        'items' => $menu_items_stmt->fetchAll()
    ];
    
    echo json_encode($data);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>