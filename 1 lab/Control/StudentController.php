<?php
require_once '../Model/StudentModel.php';

class StudentController {
    private $model;

    public function __construct($pdo) {
        $this->model = new StudentModel($pdo);
    }

    public function handleRequest($action) {
        switch ($action) {
            case 'login':
                $this->login();
                break;
            case 'logout':
                $this->logout();
                break;
            case 'getStudents':
                $this->getStudents();
                break;
            case 'createStudent':
                $this->createStudent();
                break;
            case 'updateStudent':
                $this->updateStudent();
                break;
            case 'deleteStudent':
                $this->deleteStudent();
                break;
            default:
                $this->respond(false, [], 'Invalid action');
        }
    }

    private function login() {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        if (empty($username) || empty($password)) {
            $this->respond(false, [], 'Username and password are required');
            return;
        }

        $user = $this->model->getUserByUsernameAndPassword($username, $password);
        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $this->respond(true, ['message' => 'Login successful']);
        } else {
            $this->respond(false, [], 'Invalid username or password');
        }
    }

    private function logout() {
        session_unset();
        session_destroy();
        $this->respond(true, [], 'Logged out');
    }

    private function getStudents() {
        if (!isset($_SESSION['user_id'])) {
            $this->respond(false, [], 'Unauthorized');
            return;
        }
        $students = $this->model->getAllStudents();
        $this->respond(true, ['students' => $students]);
    }

    private function createStudent() {
        if (!isset($_SESSION['user_id'])) {
            $this->respond(false, [], 'Unauthorized');
            return;
        }
        $party = $_POST['party'] ?? '';
        $name = $_POST['name'] ?? '';
        $gender = $_POST['gender'] ?? '';
        $birthday = $_POST['birthday'] ?? '';

        if ($this->model->getStudentByNameAndBirthday($name, $birthday) > 0) {
            $this->respond(false, [], 'Student with this name and birthday already exists');
            return;
        }
        $id = $this->model->createStudent($party, $name, $gender, $birthday);
        $this->respond(true, ['id' => $id]);
    }

    private function updateStudent() {
        if (!isset($_SESSION['user_id'])) {
            $this->respond(false, [], 'Unauthorized');
            return;
        }
        $id = $_POST['id'] ?? '';
        $party = $_POST['party'] ?? '';
        $name = $_POST['name'] ?? '';
        $gender = $_POST['gender'] ?? '';
        $birthday = $_POST['birthday'] ?? '';

        if ($this->model->getStudentById($id) == 0) {
            $this->respond(false, [], 'Student not found');
            return;
        }
        $this->model->updateStudent($id, $party, $name, $gender, $birthday);
        $this->respond(true);
    }

    private function deleteStudent() {
        if (!isset($_SESSION['user_id'])) {
            $this->respond(false, [], 'Unauthorized');
            return;
        }
        $id = $_POST['id'] ?? '';
        $this->model->deleteStudent($id);
        $this->respond(true);
    }

    private function respond($success, $data = [], $error = '') {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => $success,
            'data' => $data,
            'error' => $error
        ]);
        exit;
    }
}