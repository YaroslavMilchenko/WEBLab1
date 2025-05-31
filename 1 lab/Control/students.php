<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
require_once 'StudentController.php';

$host = 'localhost';
$dbname = 'students_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $controller = new StudentController($pdo);
    $controller->handleRequest($action);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed']);
    exit;
}