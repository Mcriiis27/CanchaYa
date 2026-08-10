<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

$data    = json_decode(file_get_contents('php://input'), true);
$nombre  = trim($data['nombre'] ?? '');
$tipo    = trim($data['tipo']   ?? '');
$zona    = trim($data['zona']   ?? '');
$precio  = $data['precio']      ?? null;
$luz     = !empty($data['luz'])     ? 1 : 0;
$techada = !empty($data['techada']) ? 1 : 0;

if (!$nombre || !$tipo || !$zona || $precio === null || $precio === '') {
    http_response_code(400);
    die(json_encode(['error' => 'Nombre, tipo, zona y precio son obligatorios.']));
}
if (!is_numeric($precio) || $precio <= 0) {
    http_response_code(400);
    die(json_encode(['error' => 'El precio debe ser un número mayor a 0.']));
}

$stmt = $pdo->prepare("
    INSERT INTO canchas (nombre, tipo, zona, precio, luz, techada, activa)
    VALUES (?, ?, ?, ?, ?, ?, 1)
");
$stmt->execute([$nombre, $tipo, $zona, $precio, $luz, $techada]);

echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
