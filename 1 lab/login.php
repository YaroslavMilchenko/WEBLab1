<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header('Location: students.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="style.css">
    <link rel="icon" href="data:,">
</head>
<body>
    <div class="login-modal">
        <h2>Login</h2>
        <form id="login-form">
            <label for="username">Username:</label>
            <input type="text" id="username" required>
            <span class="error-message" id="username-error"></span>
            <label for="password">Password:</label>
            <input type="password" id="password" required>
            <span class="error-message" id="password-error"></span>
            <button type="submit">Login</button>
        </form>
    </div>

    <script>
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch('api.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            });

            const result = await response.json();
            if (result.success) {
                window.location.href = 'students.php';
            } else {
                document.getElementById('username-error').textContent = result.error;
                document.getElementById('username-error').style.display = 'block';
            }
        });
    </script>
</body>
</html>