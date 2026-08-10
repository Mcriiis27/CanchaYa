<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

$stmt = $pdo->query("SELECT id, nombre, tipo, zona, precio, luz, techada, activa FROM canchas ORDER BY id");
$canchas = $stmt->fetchAll();

foreach ($canchas as &$c) {
    $c['luz']     = (bool) $c['luz'];
    $c['techada'] = (bool) $c['techada'];
    $c['activa']  = (bool) $c['activa'];
    $c['precio']  = (float) $c['precio'];
}

echo json_encode($canchas);
