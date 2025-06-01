<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Messages</title>
    <link rel="stylesheet" href="../assets/css/messages.css">
</head>
<body>
    <div id="chat-app">
        <aside id="chat-list">
            <button id="new-chat-btn">Новий чат</button>
            <!-- ...список чатів... -->
        </aside>
        <main id="chat-main">
            <header>
                <span id="chat-title"></span>
                <span id="user-status"></span>
            </header>
            <div id="messages"></div>
            <form id="message-form">
                <input id="message-input" autocomplete="off" placeholder="Type a message..." />
                <button type="submit">Send</button>
            </form>
        </main>
    </div>
    <div id="new-chat-modal" class="modal hidden">
        <div class="modal-content">
            <h3>Виберіть учасників</h3>
            <div id="students-list"></div>
            <input type="text" id="chat-name" placeholder="Назва чату">
            <button id="create-chat-confirm">Створити</button>
            <button id="close-new-chat">Скасувати</button>
        </div>
    </div>
    <script>
        window.currentUserId = "<?php echo $_SESSION['user_id']; ?>";
        window.currentUserName = "<?php echo htmlspecialchars($_SESSION['username']); ?>";
    </script>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script src="../assets/js/messages.js"></script>
</body>
</html>