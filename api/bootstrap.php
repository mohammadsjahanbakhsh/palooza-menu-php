<?php
// api/bootstrap.php

// پاسخ JSON و CORS
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST,PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// شروع سشن
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// بارگذاری PDO
require __DIR__ . '/../config/db.php';
// $pdo->exec(statement: "SET NAMES utf8mb4");

