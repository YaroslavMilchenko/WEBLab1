<?php
require_once 'config.php';

class User {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
    }

    public function login($username, $password) {
        $query = "SELECT * FROM StudentSchema.Users WHERE Username = :username";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['Password'])) {
            return $user;
        }
        return false;
    }
}
?>