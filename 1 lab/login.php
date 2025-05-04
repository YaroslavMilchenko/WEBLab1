<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header('Location: students.html');
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
</head>
<body>
    <div class="login-modal">
        <h2>Login</h2>
        <form id="login-form">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
            <label for="password">Password:</label>
            <input type="text" id="password" name="password" required>
            <button type="submit">Login</button>
            <span class="error-message" id="login-error"></span>
        </form>
    </div>
    <script>
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('username', document.getElementById('username').value);
            formData.append('password', document.getElementById('password').value);
            const response = await fetch('api.php?action=login', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                window.location.href = 'students.html';
            } else {
                document.getElementById('login-error').textContent = result.message;
                document.getElementById('login-error').style.display = 'block';
            }
        });
    </script>
</body>
</html>