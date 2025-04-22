<?php
class Database {
    private $host = 'localhost'; // Сервер з вашого скріншота
    private $dbname = 'WebLabsDataBase'; // Назва бази даних
    private $username = 'webappuser'; // Логін, який ми створили
    private $password = 'YourStrong@Password123'; // Пароль, який ми створили
    private $conn;

    public function connect() {
        try {
            $this->conn = new PDO(
                "sqlsrv:Server=$this->host;Database=$this->dbname;Encrypt=true;TrustServerCertificate=true",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->conn;
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }
}
?>