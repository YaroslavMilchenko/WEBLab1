<?php
session_start();
$isAuthorized = isset($_SESSION['user_id']);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Students</title>
    <link rel="stylesheet" type="text/css" href="../assets/css/style.css" />
    <link rel="manifest" href="../manifest.json">
    <script src="https://kit.fontawesome.com/acdc2463b2.js" crossorigin="anonymous"></script>
    <script defer src="../assets/js/main.js"></script>
</head>
<body>
    <header class="header">
        <div class="header-container">
            <h1><a href="main.html" class="logo-link">CMS</a></h1>
            <div class="header-right">
                <?php if ($isAuthorized): ?>
                    <div class="user-info">
                        <div class="notification-container">
                            <button id="open-messages-btn" class="notification-btn" title="Перейти до чату">
                                <i class="fa-solid fa-bell notification-icon" aria-label="Messages"></i>
                                <span class="notification-indicator"></span>
                            </button>
                        </div>
                        <div class="profile-container">
                            <img src="../assets/images/Students.jpeg" alt="Profile picture of James Bond" id="profile-picture"/>
                            <p class="user-name"><?php echo htmlspecialchars($_SESSION['username']); ?></p>
                            <div class="profile-dropdown">
                                <a href="profile.html" class="dropdown-link"><i class="fa-solid fa-user"></i> Profile</a>
                                <a href="javascript:void(0)" onclick="logout()" class="dropdown-link"><i class="fa-solid fa-right-from-bracket"></i> Log Out</a>
                            </div>
                        </div>
                    </div>
                <?php else: ?>
                    <button id="login-btn" onclick="window.location.href='login.php'">Login</button>
                <?php endif; ?>
            </div>
            <?php if ($isAuthorized): ?>
                <div class="burger" tabindex="0" onclick="toggleMenu()" onkeydown="if(event.key === 'Enter') toggleMenu()">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            <?php endif; ?>
        </div>
        <?php if ($isAuthorized): ?>
            <div id="mobile-menu" aria-hidden="true">
                <span class="close-btn" onclick="toggleMenu()" aria-label="Close mobile menu">×</span>
                <div class="mobile-profile">
                    <div class="notification-container">
                        <button id="open-messages-btn" class="notification-btn" title="Перейти до чату">
                            <i class="fa-solid fa-bell notification-icon" aria-label="Messages"></i>
                            <span class="notification-indicator"></span>
                        </button>
                    </div>
                    <img src="../assets/images/Students.jpeg" alt="Profile picture of James Bond" />
                    <p class="user-name"><?php echo htmlspecialchars($_SESSION['username']); ?></p>
                </div>
                <ul>
                    <li><a href="main.html">Dashboard</a></li>
                    <li><a href="student.php" class="active">Students</a></li>
                    <li><a href="tasks.html">Tasks</a></li>
                </ul>
                <ul class="mobile-profile-dropdown">
                    <li><a href="profile.html">Profile</a></li>
                    <li><a href="javascript:void(0)" onclick="logout()">Log Out</a></li>
                </ul>
            </div>
        <?php endif; ?>
    </header>

    <?php if ($isAuthorized): ?>
        <main class="main-body">
            <aside>
                <nav id="side-nav">
                    <ul>
                        <li><a href="main.html">Dashboard</a></li>
                        <li><a href="student.php" class="active">Students</a></li>
                        <li><a href="tasks.html">Tasks</a></li>
                    </ul>
                </nav>
            </aside>
            <div class="table">
                <h2 class="table-title">Students</h2>
                <button class="add-student-btn" onclick="openModal()">Add Student</button>
                <table id="student-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="select-all" aria-label="Select all students"></th>
                            <th>Party</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Birthday</th>
                            <th>Status</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <div id="pagination"></div>
            </div>
        </main>
    <?php endif; ?>

    <!-- Форма додавання студента -->
    <div id="add-modal" class="modal hidden" role="dialog" aria-labelledby="add-modal-title">
        <div class="modal-content">
            <span class="close" id="close-add" aria-label="Close modal">×</span>
            <h2 id="add-modal-title">Add Student</h2>
            <form id="add-student-form">
                <input type="hidden" id="add-student-id">
                <label for="add-party">Party:</label>
                <input type="text" id="add-party" required>
                <span class="error-message" id="add-party-error"></span>
                <label for="add-name">Name:</label>
                <input type="text" id="add-name" required>
                <span class="error-message" id="add-name-error"></span>
                <label for="add-gender">Gender:</label>
                <select id="add-gender" required>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </select>
                <label for="add-birthday">Birthday:</label>
                <input type="date" id="add-birthday" required max="2025-03-31">
                <span class="error-message" id="add-birthday-error"></span>
                <button type="submit" id="create-btn">Create</button>
            </form>
        </div>
    </div>

    <!-- Форма редагування студента -->
    <div id="edit-modal" class="modal hidden">
        <div class="modal-content">
            <span id="close-edit" class="close">×</span>
            <h2>Edit Student</h2>
            <form id="edit-student-form">
                <input type="hidden" id="edit-student-id">
                <div>
                    <label for="edit-party">Party:</label>
                    <input type="text" id="edit-party" required>
                    <span id="edit-party-error" class="error"></span>
                </div>
                <div>
                    <label for="edit-name">Name:</label>
                    <input type="text" id="edit-name" required>
                    <span id="edit-name-error" class="error"></span>
                </div>
                <div>
                    <label for="edit-gender">Gender:</label>
                    <select id="edit-gender">
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                    </select>
                </div>
                <div>
                    <label for="edit-birthday">Birthday:</label>
                    <input type="date" id="edit-birthday" required>
                    <span id="edit-birthday-error" class="error"></span>
                </div>
                <button type="submit" class="save-btn">Save</button>
            </form>
        </div>
    </div>

    <!-- Модальне вікно для видалення -->
    <div id="delete-confirm" class="modal hidden" role="dialog" aria-labelledby="delete-message">
        <div class="modal-content">
            <p id="delete-message"></p>
            <button id="confirm-delete">Yes</button>
            <button id="cancel-delete">No</button>
        </div>
    </div>

    <script>
        function logout() {
            fetch('../Control/students.php?action=logout', {
                method: 'POST',
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    window.location.href = '../View/login.php'; // Перенаправлення на сторінку входу
                } else {
                    alert('Failed to log out. Please try again.');
                }
            })
            .catch(error => {
                console.error('Logout error:', error);
                alert('An error occurred during logout.');
            });
        }

        document.getElementById('open-messages-btn').onclick = function() {
            window.location.href = 'messages.php';
        };
    </script>
</body>
</html>