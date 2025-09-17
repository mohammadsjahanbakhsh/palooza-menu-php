<?php
// /api/get_floors.php
require_once __DIR__ . '/bootstrap.php';

try {
    // Fetches all records from the 'floors' table, ordered by their ID.
    $stmt = $pdo->query("SELECT id, name FROM floors ORDER BY id");
    $floors = $stmt->fetchAll();
    echo json_encode($floors);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
