<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

$data      = json_decode(file_get_contents('php://input'), true);
$usuarioId = $data['usuario_id'] ?? null;
$rol       = $data['rol'] ?? null;

if (!$usuarioId || !in_array($rol, ['cliente', 'admin'], true)) {
    http_response_code(400);
    die(json_encode(['error' => 'Datos inválidos.']));
}

if ((int) $usuarioId === (int) $_SESSION['usuario']['id'] && $rol !== 'admin') {
    http_response_code(400);
    die(json_encode(['error' => 'No puedes quitarte tu propio rol de administrador.']));
}

$stmt = $pdo->prepare("UPDATE usuarios SET rol = ? WHERE id = ?");
$stmt->execute([$rol, $usuarioId]);

echo json_encode(['ok' => true]);
