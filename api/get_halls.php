<?php
// /api/get_halls
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/bootstrap.php';

try {
    // 1. Fetch all data with a single, efficient JOIN query
    $sql = "
        SELECT 
            h.id AS hall_id,
            h.name AS hall_name,
            h.floor_id,
            t.id AS table_id,
            t.name AS table_name,
            t.capacity,
            t.status,
            t.last_activity,
            t.reservation_time
        FROM 
            halls h
        LEFT JOIN 
            tables t ON h.id = t.hall_id
        ORDER BY 
            h.id, t.id
    ";

    $stmt = $pdo->query($sql);
    $flatResult = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Restructure the flat data into a nested array
    $halls = [];
    foreach ($flatResult as $row) {
        $hallId = $row['hall_id'];

        // If we haven't seen this hall before, add it to our array
        if (!isset($halls[$hallId])) {
            $halls[$hallId] = [
                'id'       => $hallId,
                'name'     => $row['hall_name'],
                'floor_id' => $row['floor_id'],
                'tables'   => [], // Initialize the tables array
            ];
        }

        // If the row contains table data (it might be NULL from the LEFT JOIN)
        if ($row['table_id'] !== null) {
            $halls[$hallId]['tables'][] = [
                'id'               => $row['table_id'],
                'name'             => $row['table_name'],
                'capacity'         => $row['capacity'],
                'status'           => $row['status'],
                'last_activity'    => $row['last_activity'],
                'reservation_time' => $row['reservation_time'],
            ];
        }
    }

    // Convert the associative array to an indexed array for the final JSON output
    $finalResult = array_values($halls);

    echo json_encode($finalResult, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
}