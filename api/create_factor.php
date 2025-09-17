<?php
// /api/create_factor.php

// 1. Include the main bootstrap file for database connection and headers
require_once __DIR__ . '/bootstrap.php';

// 2. Read the JSON data sent from the frontend
$input = json_decode(file_get_contents('php://input'), true);

// 3. Validate the essential input fields
if (!isset($input['table_id']) || !isset($input['user_id']) || !isset($input['items']) || !is_array($input['items'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Required fields are missing: table_id, user_id, and items array.']);
    exit();
}

try {
    // 4. Start a database transaction to ensure all queries succeed or fail together
    $pdo->beginTransaction();

    // 5. Calculate the total invoice amount from the items array
    $invoice_amount = 0;
    foreach ($input['items'] as $item) {
        if (isset($item['price']) && isset($item['quantity'])) {
            $invoice_amount += $item['price'] * $item['quantity'];
        }
    }
    
    // 6. Handle the optional phone number: use NULL if it's empty or not provided
    $phone = !empty($input['useer_id_phone']) ? $input['useer_id_phone'] : NULL;

    // 7. Insert the main record into the 'factor' table
    $factor_sql = "INSERT INTO factor (useer_id_phone, invoice_amount, user_id, status) VALUES (?, ?, ?, 'open')";
    $factor_stmt = $pdo->prepare($factor_sql);
    $factor_stmt->execute([$phone, $invoice_amount, $input['user_id']]);
    $factor_id = $pdo->lastInsertId(); // Get the ID of the newly created factor

    // 8. Insert each item from the order into the 'order_items' table
    $item_sql = "INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)";
    $item_stmt = $pdo->prepare($item_sql);
    foreach ($input['items'] as $item) {
        $item_stmt->execute([$factor_id, $item['id'], $item['quantity'], $item['price']]);
    }

    // 9. Update the table's status to 'serving'
    $table_sql = "UPDATE tables SET status = 'serving' WHERE id = ?";
    $table_stmt = $pdo->prepare($table_sql);
    $table_stmt->execute([$input['table_id']]);

    // 10. If all queries were successful, commit the transaction
    $pdo->commit();
    
    echo json_encode(['status' => 'success', 'message' => 'Factor created successfully.', 'factor_id' => $factor_id]);

} catch (Exception $e) {
    // 11. If any query fails, roll back all changes
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => 'Transaction failed: ' . $e->getMessage()]);
}
?>