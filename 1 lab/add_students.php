<?php
include "db.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $group = $_POST["group"];
    $name = $_POST["name"];
    $birthday = $_POST["birthday"];

    $birthdayFormatted = date("Y-m-d", strtotime($birthday));

    $sql = "INSERT INTO StudentSchema.Students (Party, Name, Gender, Birthday, Status) 
            VALUES (?, ?, 'M', ?, 1)";

    $params = array($group, $name, $birthdayFormatted);
    $stmt = sqlsrv_query($conn, $sql, $params);

    if ($stmt) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => sqlsrv_errors()]);
    }
}
?>
