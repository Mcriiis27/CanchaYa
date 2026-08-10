<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../conexion.php';

$stmt = $pdo->query("SELECT id, nombre, tipo, zona, precio, luz, techada FROM canchas WHERE activa = 1");
$canchas = $stmt->fetchAll();

// Convertir 0/1 a boolean para que coincida con el front (luz:true, techada:false)
foreach ($canchas as &$c) {
    $c['luz']     = (bool) $c['luz'];
    $c['techada'] = (bool) $c['techada'];
    $c['precio']  = (float) $c['precio'];
}

echo json_encode($canchas);
