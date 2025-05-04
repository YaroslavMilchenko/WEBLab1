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

if (!isset($_SESSION['user_id'])) {
    respond(false, [], 'Unauthorized');
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

// Налаштування підключення до бази даних
$host = 'localhost';
$dbname = 'cms_db'; // Переконайся, що база даних створена
$username = 'root'; // Зміни на твого користувача
$password = ''; // Зміни на твій пароль

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    respond(false, [], 'Database connection failed: ' . $e->getMessage());
}

switch ($action) {
    case 'getUserInfo':
        respond(true, ['username' => htmlspecialchars($_SESSION['username'])]);
        break;

    case 'logout':
        session_destroy();
        respond(true);
        break;

    case 'getStudents':
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $rowsPerPage = 10;
        $offset = ($page - 1) * $rowsPerPage;

        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM students");
            $totalStudents = $stmt->fetchColumn();
            $totalPages = max(1, ceil($totalStudents / $rowsPerPage));

            $stmt = $pdo->prepare("SELECT * FROM students LIMIT :offset, :rowsPerPage");
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':rowsPerPage', $rowsPerPage, PDO::PARAM_INT);
            $stmt->execute();
            $students = $stmt->fetchAll();

            $students = array_map(function($student) {
                return [
                    'id' => $student['id'] ?? 0,
                    'party' => $student['party'] ?? 'N/A',
                    'name' => $student['name'] ?? 'Unknown',
                    'gender' => $student['gender'] ?? 'N/A',
                    'birthday' => $student['birthday'] ?? null,
                    'status' => $student['status'] ?? 0
                ];
            }, $students);

            error_log("Students fetched: " . json_encode($students));
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