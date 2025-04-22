<?php
require_once 'config.php';

class Student {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
    }

    public function getAll($page = 1, $perPage = 10) {
        $offset = ($page - 1) * $perPage;
        $query = "SELECT * FROM StudentSchema.Students ORDER BY StudentId OFFSET :offset ROWS FETCH NEXT :perPage ROWS ONLY";
        $stmt = $this->db->prepare($query);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindValue(':perPage', $perPage, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTotalCount() {
        $query = "SELECT COUNT(*) as total FROM StudentSchema.Students";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    public function create($data) {
        $query = "INSERT INTO StudentSchema.Students (Party, Name, Gender, Birthday, Status) VALUES (:party, :name, :gender, :birthday, :status)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':party', $data['party']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':gender', $data['gender']);
        $stmt->bindParam(':birthday', $data['birthday']);
        $stmt->bindParam(':status', $data['status']);
        return $stmt->execute();
    }

    public function update($id, $data) {
        $query = "UPDATE StudentSchema.Students SET Party = :party, Name = :name, Gender = :gender, Birthday = :birthday, Status = :status WHERE StudentId = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':party', $data['party']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':gender', $data['gender']);
        $stmt->bindParam(':birthday', $data['birthday']);
        $stmt->bindParam(':status', $data['status']);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM StudentSchema.Students WHERE StudentId = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function findByName($name) {
        $query = "SELECT * FROM StudentSchema.Students WHERE Name = :name";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>