<?php
require_once 'check_auth.php';
require_once __DIR__ . '/../config/db.php';

if ($_SESSION['user_level'] !== 'admin') {
    die("شما اجازه دسترسی به این صفحه را ندارید.");
}

// حذف کاربر
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    $id = (int)$_GET['delete'];
    if ($id !== $_SESSION['user_id']) { // خودش رو حذف نکنه
        $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
    }
    header("Location: admin_users_list.php");
    exit;
}

// تغییر نقش
if (isset($_GET['toggle']) && is_numeric($_GET['toggle'])) {
    $id = (int)$_GET['toggle'];
    $stmt = $pdo->prepare("SELECT user_level FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    if ($user) {
        $newRole = $user['user_level'] === 'admin' ? 'manager' : 'admin';
        $pdo->prepare("UPDATE users SET user_level = ? WHERE id = ?")->execute([$newRole, $id]);
    }
    header("Location: admin_users_list.php");
    exit;
}

$users = $pdo->query("SELECT id, username, user_level, created_at FROM users ORDER BY created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="fa">
<head>
    <meta charset="UTF-8">
    <title>مدیریت کاربران</title>
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
        }
        th {
            background: var(--primary-color);
            color: white;
        }
        tr:hover {
            background: #f1f1f1;
        }
        .btn {
            padding: 5px 10px;
            border-radius: 4px;
            text-decoration: none;
            color: white;
        }
        .btn-delete { background: crimson; }
        .btn-toggle { background: var(--secondary-color); }
    </style>
</head>
<body>
    <img src="assets/logo_animation.gif" class="logo">
    <div class="box">
        <h2>مدیریت کاربران</h2>
        <table>
            <tr>
                <th>نام کاربری</th>
                <th>نقش</th>
                <th>تاریخ ایجاد</th>
                <th>عملیات</th>
            </tr>
            <?php foreach ($users as $u): ?>
            <tr>
                <td><?= htmlspecialchars($u['username']) ?></td>
                <td><?= $u['user_level'] ?></td>
                <td><?= $u['created_at'] ?></td>
                <td>
                    <?php if ($u['id'] !== $_SESSION['user_id']): ?>
                        <a class="btn btn-toggle" href="?toggle=<?= $u['id'] ?>">تغییر نقش</a>
                        <a class="btn btn-delete" href="?delete=<?= $u['id'] ?>" onclick="return confirm('حذف شود؟')">حذف</a>
                    <?php else: ?>
                        -
                    <?php endif; ?>
                </td>
            </tr>
            <?php endforeach; ?>
        </table>
        <br>
        <a href="dashboard.php">← بازگشت به داشبورد</a>
    </div>
</body>
</html>
