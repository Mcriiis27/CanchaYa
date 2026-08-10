<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

$data      = json_decode(file_get_contents('php://input'), true);
$usuarioId = $data['usuario_id'] ?? null;

if (!$usuarioId) {
    http_response_code(400);
    die(json_encode(['error' => 'Falta el id del usuario.']));
}

// Un admin no puede borrarse a sí mismo (evita quedarse sin acceso)
if ((int) $usuarioId === (int) $_SESSION['usuario']['id']) {
    http_response_code(400);
    die(json_encode(['error' => 'No puedes eliminar tu propia cuenta de administrador.']));
}

$stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
$stmt->execute([$usuarioId]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    die(json_encode(['error' => 'Usuario no encontrado.']));
}

// Las reservas de ese usuario quedan (usuario_id se pone en NULL por el FK ON DELETE SET NULL)
echo json_encode(['ok' => true]);
