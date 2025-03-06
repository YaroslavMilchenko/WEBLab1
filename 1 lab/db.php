<?php
$serverName = "localhost"; // Или имя SQL-сервера
$connectionOptions = array(
    "Database" => "WebLabsDataBase",
    "CharacterSet" => "UTF-8",
    "TrustServerCertificate" => true
);

$conn = sqlsrv_connect($serverName, $connectionOptions);

if (!$conn) {
    die(print_r(sqlsrv_errors(), true));
}
?>
