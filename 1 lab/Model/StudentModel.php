<?php

class StudentModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAllStudents() {
        $stmt = $this->pdo->query("SELECT * FROM students");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getStudentByNameAndBirthday($name, $birthday) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM students WHERE name = ? AND birthday = ?");
        $stmt->execute([$name, $birthday]);
        return $stmt->fetchColumn();
    }

    public function createStudent($party, $name, $gender, $birthday) {
        $stmt = $this->pdo->prepare("INSERT INTO students (party, name, gender, birthday, status) VALUES (?, ?, ?, ?, 0)");
        $stmt->execute([$party, $name, $gender, $birthday]);
        return $this->pdo->lastInsertId();
    }

    public function deleteStudent($id) {
        $stmt = $this->pdo->prepare("DELETE FROM students WHERE id = ?");
        $stmt->execute([$id]);
    }

    public function updateStudent($id, $party, $name, $gender, $birthday) {
        $stmt = $this->pdo->prepare("UPDATE students SET party = ?, name = ?, gender = ?, birthday = ? WHERE id = ?");
        $stmt->execute([$party, $name, $gender, $birthday, $id]);
    }

    public function getStudentById($id) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM students WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetchColumn();
    }

    public function getUserByUsernameAndPassword($username, $password) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = :username AND password = :password");
        $stmt->execute(['username' => $username, 'password' => $password]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}