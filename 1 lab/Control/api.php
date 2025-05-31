<?php
session_start();

require_once '../models/auth.php';

// Встановлюємо заголовки для JSON-відповіді
header('Content-Type: application/json');

// Налаштування бази даних (для 4-ї лабораторної)
$db_config = [
    'host' => 'localhost',
    'dbname' => 'students_db',
    'username' => 'root',
    'password' => ''
];

// Модель: Клас для роботи з базою даних
class Database {
    private $conn;

    public function __construct($config) {
        try {
            $this->conn = new PDO(
                "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8",
                $config['username'],
                $config['password']
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }

    public function getConnection() {
        return $this->conn;
    }
}

// Модель: Дані для 3-ї лабораторної (масив)
$students_array = [
    ['id' => 1, 'party' => 'Group1', 'name' => 'John Doe', 'gender' => 'M', 'birthday' => '2000-01-01', 'status' => 1],
    ['id' => 2, 'party' => 'Group2', 'name' => 'Jane Smith', 'gender' => 'F', 'birthday' => '2001-02-02', 'status' => 0]
];

$users_array = [
    ['username' => 'student1', 'password' => '2000-01-01'],
    ['username' => 'student2', 'password' => '2001-02-02']
];

// Контролер: Функція валідації даних студента
function validateStudent($data) {
    $errors = [];
    $name_regex = '/^([A-Za-z\s\'-]{2,})$|^[^@]+@lpnu\.ua$/';
    $party_regex = '/^[A-Za-z0-9-]{2,}$/';

    if (!isset($data['name']) || !preg_match($name_regex, $data['name'])) {
        $errors[] = 'Invalid name or email format';
    }
    if (!isset($data['party']) || !preg_match($party_regex, $data['party'])) {
        $errors[] = 'Invalid party format';
    }
    if (!isset($data['birthday']) || empty($data['birthday']) || !strtotime($data['birthday'])) {
        $errors[] = 'Invalid birthday';
    }
    if (!isset($data['gender']) || !in_array($data['gender'], ['M', 'F'])) {
        $errors[] = 'Invalid gender';
    }

    return $errors;
}

// Контролер: Визначення дії
$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');
$use_database = true;

if ($use_database) {
    $db = new Database($db_config);
    $conn = $db->getConnection();
}

// Контролер: Обробка дій
switch ($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'error' => 'Invalid request method']);
            exit;
        }

        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        if (empty($username) || empty($password)) {
            echo json_encode(['success' => false, 'message' => 'Username and password are required']);
            exit;
        }

        if ($use_database) {
            $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username AND password = :password");
            $stmt->execute(['username' => $username, 'password' => $password]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
            }
        } else {
            foreach ($users_array as $user) {
                if ($user['username'] === $username && $user['password'] === $password) {
                    $_SESSION['user_id'] = $username;
                    $_SESSION['username'] = $username;
                    echo json_encode(['success' => true]);
                    exit;
                }
            }
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['success' => true]);
        break;

    case 'getStudents':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }

        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $per_page = 5;
        $offset = ($page - 1) * $per_page;

        if ($use_database) {
            $stmt = $conn->prepare("SELECT * FROM students LIMIT :offset, :per_page");
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':per_page', $per_page, PDO::PARAM_INT);
            $stmt->execute();
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
            // Відладка
            file_put_contents('debug.log', print_r($students, true) . PHP_EOL, FILE_APPEND);
            $count_stmt = $conn->query("SELECT COUNT(*) FROM students");
            $total_students = $count_stmt->fetchColumn();
        } else {
            $students = array_slice($students_array, $offset, $per_page);
            $total_students = count($students_array);
        }

        $total_pages = ceil($total_students / $per_page);

        echo json_encode([
            'success' => true,
            'students' => $students,
            'totalPages' => $total_pages
        ]);
        break;

    case 'createStudent':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }

        $data = [
            'party' => $_POST['party'] ?? '',
            'name' => $_POST['name'] ?? '',
            'gender' => $_POST['gender'] ?? '',
            'birthday' => $_POST['birthday'] ?? ''
        ];

        $errors = validateStudent($data);

        if ($use_database) {
            $stmt = $conn->prepare("SELECT COUNT(*) FROM students WHERE name = :name");
            $stmt->execute(['name' => $data['name']]);
            if ($stmt->fetchColumn() > 0) {
                $errors[] = 'Student with this name already exists';
            }
        } else {
            foreach ($students_array as $student) {
                if ($student['name'] === $data['name']) {
                    $errors[] = 'Student with this name already exists';
                    break;
                }
            }
        }

        if (empty($errors)) {
            if ($use_database) {
                $stmt = $conn->prepare("INSERT INTO students (party, name, gender, birthday, status) VALUES (:party, :name, :gender, :birthday, 0)");
                $stmt->execute($data);
            } else {
                $new_id = max(array_column($students_array, 'id')) + 1;
                $students_array[] = [
                    'id' => $new_id,
                    'party' => $data['party'],
                    'name' => $data['name'],
                    'gender' => $data['gender'],
                    'birthday' => $data['birthday'],
                    'status' => 0
                ];
            }
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'errors' => $errors]);
        }
        break;

    case 'updateStudent':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }

        $data = [
            'id' => $_POST['id'] ?? '',
            'party' => $_POST['party'] ?? '',
            'name' => $_POST['name'] ?? '',
            'gender' => $_POST['gender'] ?? '',
            'birthday' => $_POST['birthday'] ?? ''
        ];

        if (empty($data['id'])) {
            echo json_encode(['success' => false, 'error' => 'Student ID is required']);
            exit;
        }

        $errors = validateStudent($data);

        if ($use_database) {
            $stmt = $conn->prepare("SELECT COUNT(*) FROM students WHERE name = :name AND id != :id");
            $stmt->execute(['name' => $data['name'], 'id' => $data['id']]);
            if ($stmt->fetchColumn() > 0) {
                $errors[] = 'Student with this name already exists';
            }
        } else {
            foreach ($students_array as $student) {
                if ($student['name'] === $data['name'] && $student['id'] != $data['id']) {
                    $errors[] = 'Student with this name already exists';
                    break;
                }
            }
        }

        if (empty($errors)) {
            if ($use_database) {
                $stmt = $conn->prepare("UPDATE students SET party = :party, name = :name, gender = :gender, birthday = :birthday WHERE id = :id");
                $stmt->execute($data);
            } else {
                foreach ($students_array as &$student) {
                    if ($student['id'] == $data['id']) {
                        $student['party'] = $data['party'];
                        $student['name'] = $data['name'];
                        $student['gender'] = $data['gender'];
                        $student['birthday'] = $data['birthday'];
                        break;
                    }
                }
                unset($student);
            }
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'errors' => $errors]);
        }
        break;

    case 'deleteStudent':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }

        $id = $_POST['id'] ?? '';

        if (empty($id)) {
            echo json_encode(['success' => false, 'error' => 'Student ID is required']);
            exit;
        }

        if ($use_database) {
            $stmt = $conn->prepare("DELETE FROM students WHERE id = :id");
            $result = $stmt->execute(['id' => $id]);
            echo json_encode(['success' => $result]);
        } else {
            $initial_count = count($students_array);
            $students_array = array_filter($students_array, function ($student) use ($id) {
                return $student['id'] != $id;
            });
            $students_array = array_values($students_array);
            echo json_encode(['success' => count($students_array) < $initial_count]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        break;
}
?>