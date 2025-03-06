<?php
include "db.php";

$sql = "SELECT * FROM StudentSchema.Students";
$stmt = sqlsrv_query($conn, $sql);

$students = array();

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $students[] = array(
        "id" => $row["StudentId"],
        "group" => $row["Party"],
        "name" => $row["Name"],
        "gender" => $row["Gender"],
        "birthday" => $row["Birthday"]->format('d.m.Y'),
        "status" => $row["Status"] == 1 ? "Online" : "Offline"
    );
}

echo json_encode($students);
?>
