<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function normalizeUserPhone($phone) {
    
    $phone = preg_replace('/\D/', '', $phone);

        if (strlen($phone) === 11 && substr($phone, 0, 1) === '0') {
        $phone = substr($phone, 1);
    }

        if (strlen($phone) !== 10) {
        return false;
    }

    return $phone;
}
