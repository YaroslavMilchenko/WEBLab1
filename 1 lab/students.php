<?php
session_start();
header('Content-Type: application/json');

function respond($success, $data = [], $error = '') {
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ], JSON_PRETTY_PRINT);
    exit;
}

// Логування стану сесії
error_log("Session status: " . session_status() . ", Session ID: " . session_id() . ", User ID: " . ($_SESSION['user_id'] ?? 'not set'));

$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

// Налаштування підключення до бази даних
$host = 'localhost';
$dbname = 'students_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Перевірка підключення
    $pdo->query("SELECT 1");
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    respond(false, [], 'Database connection failed: ' . $e->getMessage());
    exit;
}

switch ($action) {
    case 'login':
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
            $stmt->execute([$username, $password]);
            $user = $stmt->fetch();

            if ($user) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                error_log("Login successful, user_id set to: " . $_SESSION['user_id']);
                respond(true, [], '');
            } else {
                respond(false, [], 'Невірне ім\'я користувача або пароль');
            }
        } catch (PDOException $e) {
            error_log("Login failed: " . $e->getMessage());
            respond(false, [], 'Помилка сервера при вході');
        }
        break;

    case 'getUserInfo':
        if (!isset($_SESSION['user_id'])) {
            respond(false, [], 'Unauthorized');
            exit;
        }
        respond(true, ['username' => htmlspecialchars($_SESSION['username'])]);
        break;

    case 'logout':
        if (!isset($_SESSION['user_id'])) {
            respond(false, [], 'Unauthorized');
            exit;
        }
        session_destroy();
        session_unset();
        respond(true, [], 'Logged out successfully');
        break;

    case 'getStudents':
        if (!isset($_SESSION['user_id'])) {
            respond(false, [], 'Unauthorized');
            exit;
        }
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $rowsPerPage = 10;
        $offset = ($page - 1) * $rowsPerPage;

        try {
            $tableCheck = $pdo->query("SHOW TABLES LIKE 'students'");
            if ($tableCheck->rowCount() === 0) {
                error_log("Table 'students' does not exist in the database.");
                respond(false, [], 'Table "students" does not exist in the database.');
            }

            $stmt = $pdo->query("SELECT COUNT(*) FROM students");
            $totalStudents = $stmt->fetchColumn();
            $totalPages = max(1, ceil($totalStudents / $rowsPerPage));

            $stmt = $pdo->prepare("SELECT * FROM students LIMIT :offset, :rowsPerPage");
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':rowsPerPage', $rowsPerPage, PDO::PARAM_INT);
            $stmt->execute();
            $students = $stmt->fetchAll();

            error_log("Raw students data from DB: " . json_encode($students, JSON_PRETTY_PRINT));

            if (empty($students)) {
                error_log("No students found in the database.");
                $students = [];
            }

            $students = array_map(function($student) {
                return [
                    'id' => isset($student['id']) ? (int)$student['id'] : 0,
                    'party' => isset($student['party']) ? (string)$student['party'] : 'N/A',
                    'name' => isset($student['name']) ? (string)$student['name'] : 'Unknown',
                    'gender' => isset($student['gender']) ? (string)$student['gender'] : 'N/A',
                    'birthday' => isset($student['birthday']) ? (string)$student['birthday'] : null,
                    'status' => isset($student['status']) ? (int)$student['status'] : 0
                ];
            }, $students);

            error_log("Mapped students data: " . json_encode($students, JSON_PRETTY_PRINT));

            respond(true, [
                'students' => $students,
                'totalPages' => $totalPages
            ]);
        } catch (PDOException $e) {
            error_log("Failed to fetch students: " . $e->getMessage());
            respond(false, [], 'Failed to fetch students: ' . $e->getMessage());
        }
        break;

    case 'createStudent':
        if (!isset($_SESSION['user_id'])) {
            respond(false, [], 'Unauthorized');
            exit;
        }
        $party = $_POST['party'] ?? '';
        $name = $_POST['name'] ?? '';
        $gender = $_POST['gender'] ?? '';
        $birthday = $_POST['birthday'] ?? null;

        try {
            $stmt = $pdo->prepare("INSERT INTO students (party, name, gender, birthday, status) VALUES (?, ?, ?, ?, 0)");
            $stmt->execute([$party, $name, $gender, $birthday]);
            $newStudentId = $pdo->lastInsertId();

            $newStudent = [
                'id' => $newStudentId,
                'party' => $party,
                'name' => $name,
                'gender' => $gender,
                'birthday' => $birthday,
                'status' => 0
            ];
            respond(true, $newStudent);
        } catch (PDOException $e) {
            error_log("Failed to create student: " . $e->getMessage());
            respond(false, [], 'Failed to create student: ' . $e->getMessage());
        }
        break;

    case 'updateStudent':
        if (!isset($_SESSION['user_id'])) {
            respond(false, [], 'Unauthorized');
            exit;
        }
        $id = $_POST['id'] ?? 0;
        $party = $_POST['party'] ?? '';
        $name = $_POST['name'] ?? '';
        $gender = $_POST['gender'] ?? '';
        $birthday = $_POST['birthday'] ?? null;

        try {
            $stmt = $pdo->prepare("UPDATE students SET party = ?, name = ?, gender = ?, birthday = ? WHERE id = ?");
            $stmt->execute([$party, $name, $gender, $birthday, $id]);
            respond(true, [
                'id' => $id,
                'party' => $party,
                'name' => $name,
                'gender' => $gender,
                'birthday' => $birthday,
                'status' => 0
            ]);
        } catch (PDOException $e) {
            error_log("Failed to update student: " . $e->getMessage());
            respond(false, [], 'Failed to update student: ' . $e->getMessage());
        }
        break;

    case 'deleteStudent':
        if (!isset($_SESSION['user_id'])) {
            respond(false, [], 'Unauthorized');
            exit;
        }
        $id = $_POST['id'] ?? 0;

        try {
            $stmt = $pdo->prepare("DELETE FROM students WHERE id = ?");
            $stmt->execute([$id]);
            respond(true);
        } catch (PDOException $e) {
            error_log("Failed to delete student: " . $e->getMessage());
            respond(false, [], 'Failed to delete student: ' . $e->getMessage());
        }
        break;

    default:
        respond(false, [], 'Invalid action');
}
?>