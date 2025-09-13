<?php
require_once 'check_auth.php';
require_once __DIR__ . '/../config/db.php';

if ($_SESSION['user_level'] !== 'admin') {
    die("شما اجازه دسترسی به این صفحه را ندارید.");
}

// گزارش فروش روزانه
$daily = $pdo->query("
    SELECT DATE(order_date) as sale_date, SUM(total_amount) as total_sales, COUNT(*) as orders_count
    FROM orders
    GROUP BY DATE(order_date)
    ORDER BY sale_date DESC
    LIMIT 7
")->fetchAll();

// گزارش فروش ماهانه
$monthly = $pdo->query("
    SELECT DATE_FORMAT(order_date, '%Y-%m') as sale_month, SUM(total_amount) as total_sales, COUNT(*) as orders_count
    FROM orders
    GROUP BY sale_month
    ORDER BY sale_month DESC
    LIMIT 6
")->fetchAll();

// مجموع کل فروش
$total = $pdo->query("SELECT SUM(total_amount) as total_sales, COUNT(*) as orders_count FROM orders")->fetch();
?>
<!DOCTYPE html>
<html lang="fa">
<head>
    <meta charset="UTF-8">
    <title>گزارش فروش</title>
    <link rel="stylesheet" href="assets/style.css">
    <style>
        table {
            width: 90%;
            margin: auto;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        th, td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: center;
        }
        th {
            background: var(--primary-color);
            color: white;
        }
        tr:hover {
            background: #f1f1f1;
        }
        h3 {
            color: var(--primary-color);
        }
    </style>
</head>
<body>
    <img src="assets/logo_animation.gif" class="logo">
    <div class="box">
        <h2>گزارش فروش</h2>
        <h3>📊 مجموع کل</h3>
        <p>کل فروش: <?= number_format($total['total_sales']) ?> تومان</p>
        <p>تعداد کل سفارش‌ها: <?= $total['orders_count'] ?></p>

        <h3>📅 فروش روزانه (۷ روز اخیر)</h3>
        <table>
            <tr>
                <th>تاریخ</th>
                <th>مجموع فروش</th>
                <th>تعداد سفارش</th>
            </tr>
            <?php foreach ($daily as $row): ?>
            <tr>
                <td><?= $row['sale_date'] ?></td>
                <td><?= number_format($row['total_sales']) ?> تومان</td>
                <td><?= $row['orders_count'] ?></td>
            </tr>
            <?php endforeach; ?>
        </table>

        <h3>📆 فروش ماهانه (۶ ماه اخیر)</h3>
        <table>
            <tr>
                <th>ماه</th>
                <th>مجموع فروش</th>
                <th>تعداد سفارش</th>
            </tr>
            <?php foreach ($monthly as $row): ?>
            <tr>
                <td><?= $row['sale_month'] ?></td>
                <td><?= number_format($row['total_sales']) ?> تومان</td>
                <td><?= $row['orders_count'] ?></td>
            </tr>
            <?php endforeach; ?>
        </table>

        <br>
        <a href="dashboard.php">← بازگشت به داشبورد</a>
    </div>
</body>
</html>
