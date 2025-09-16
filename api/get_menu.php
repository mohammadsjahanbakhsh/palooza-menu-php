<?php
// api/get_menu.php
/**
 * API Endpoint: Get Menu
 *
 * Fetches all menu categories and their corresponding menu items from the database.
 * The data is returned as a nested JSON array, where each category object
 * contains an array of its items. This is achieved with a single, efficient
 * database query using a LEFT JOIN.
 */

// 1. Bootstrap the application
// This file sets all necessary headers (CORS, Content-Type)
// and establishes the database connection ($pdo).
require_once __DIR__ . '/bootstrap.php';

try {
    // 2. Fetch all data with a single, efficient JOIN query
    // A LEFT JOIN is used to include categories even if they have no items yet.
    $sql = "
        SELECT 
            mc.id AS category_id,
            mc.name AS category_name,
            mi.id AS item_id,
            mi.name AS item_name,
            mi.price,
            mi.is_100_arabica
        FROM 
            menu_categories mc
        LEFT JOIN 
            menu_items mi ON mc.id = mi.category_id
        ORDER BY 
            mc.id, mi.id
    ";

    $stmt = $pdo->query($sql);
    $flatResult = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Restructure the flat data from the DB into a nested PHP array
    $menu = [];
    foreach ($flatResult as $row) {
        $categoryId = $row['category_id'];

        // If we haven't processed this category yet, add it to our menu array.
        if (!isset($menu[$categoryId])) {
            $menu[$categoryId] = [
                'id'    => $categoryId,
                'name'  => $row['category_name'],
                'items' => [], // Initialize an empty array for its items.
            ];
        }

        // If the row contains item data (it might be NULL from the LEFT JOIN),
        // add the item to its corresponding category.
        if ($row['item_id'] !== null) {
            $menu[$categoryId]['items'][] = [
                'id'             => $row['item_id'],
                'name'           => $row['item_name'],
                'price'          => $row['price'],
                'is_100_arabica' => (bool)$row['is_100_arabica'], // Cast tinyint to boolean
            ];
        }
    }

    // Convert the associative array (keyed by category ID) to a simple indexed array
    // for the final JSON output.
    $finalMenu = array_values($menu);

    // 4. Send the successful JSON response
    echo json_encode($finalMenu, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    // In case of a database error, send an HTTP 500 error response.
    http_response_code(500);
    echo json_encode(['error' => 'A database error occurred: ' . $e->getMessage()]);
}
?>