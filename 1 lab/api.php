<?php
session_start();
require_once 'student_model.php';
require_once 'auth_model.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

$studentModel = new Student();
$userModel = new User();

switch ($action) {
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';

            $user = $userModel->login($username, $password);
            if ($user) {
                $_SESSION['user_id'] = $user['UserId'];
                $_SESSION['username'] = $user['Username'];
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
            }
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
        $students = $studentModel->getAll($page);
        $totalStudents = $studentModel->getTotalCount();
        $totalPages = ceil($totalStudents / 10);
        echo json_encode([
            'students' => $students,
            'totalPages' => $totalPages,
            'currentPage' => $page
        ]);
        break;

    case 'createStudent':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'party' => trim($_POST['party'] ?? ''),
                'name' => trim($_POST['name'] ?? ''),
                'gender' => $_POST['gender'] ?? '',
                'birthday' => $_POST['birthday'] ?? '',
                'status' => 1 // Online за замовчуванням
            ];

            // Валідація
            $errors = [];
            if (!preg_match("/^([A-Za-z\s'-]{2,})$|^[^@]+@lpnu\.ua$/", $data['name'])) {
                $errors[] = "Invalid name or email format";
            }
            if (!preg_match("/^[A-Za-z0-9-]{2,}$/", $data['party'])) {
                $errors[] = "Invalid party format";
            }
            if (!in_array($data['gender'], ['M', 'F'])) {
                $errors[] = "Invalid gender";
            }
            if (empty($data['birthday'])) {
                $errors[] = "Birthday is required";
            }
            if ($studentModel->findByName($data['name'])) {
                $errors[] = "Student with this name already exists";
            }

            if (empty($errors)) {
                if ($studentModel->create($data)) {
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Failed to create student']);
                }
            } else {
                echo json_encode(['success' => false, 'errors' => $errors]);
            }
        }
        break;

    case 'updateStudent':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['id'] ?? '';
            $data = [
                'party' => trim($_POST['party'] ?? ''),
                'name' => trim($_POST['name'] ?? ''),
                'gender' => $_POST['gender'] ?? '',
                'birthday' => $_POST['birthday'] ?? '',
                'status' => 1
            ];

            $errors = [];
            if (!preg_match("/^([A-Za-z\s'-]{2,})$|^[^@]+@lpnu\.ua$/", $data['name'])) {
                $errors[] = "Invalid name or email format";
            }
            if (!preg_match("/^[A-Za-z0-9-]{2,}$/", $data['party'])) {
                $errors[] = "Invalid party format";
            }
            if (!in_array($data['gender'], ['M', 'F'])) {
                $errors[] = "Invalid gender";
            }
            if (empty($data['birthday'])) {
                $errors[] = "Birthday is required";
            }
            $existingStudent = $studentModel->findByName($data['name']);
            if ($existingStudent && $existingStudent['StudentId'] != $id) {
                $errors[] = "Student with this name already exists";
            }

            if (empty($errors)) {
                if ($studentModel->update($id, $data)) {
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'error' => 'Failed to update student']);
                }
            } else {
                echo json_encode(['success' => false, 'errors' => $errors]);
            }
        }
        break;

    case 'deleteStudent':
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['id'] ?? '';
            if ($studentModel->delete($id)) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Failed to delete student']);
            }
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        break;
}
?>