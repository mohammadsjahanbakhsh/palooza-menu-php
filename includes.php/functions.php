<?php
function normalizeUserPhone($phone) {
    // حذف هر چیزی غیر از عدد
    $phone = preg_replace('/\D/', '', $phone);

    // اگر 11 رقمی و با صفر شروع میشه → صفر اول رو حذف کن
    if (strlen($phone) === 11 && substr($phone, 0, 1) === '0') {
        $phone = substr($phone, 1);
    }

    // اگر طولش 10 رقم نیست → خطا
    if (strlen($phone) !== 10) {
        return false;
    }

    return $phone;
}
