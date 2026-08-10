<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

$stmt = $pdo->query("
    SELECT id, nombre, email, tel, rol, creado_en
    FROM usuarios
    ORDER BY creado_en DESC
");

echo json_encode($stmt->fetchAll());
