<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

$data      = json_decode(file_get_contents('php://input'), true);
$reservaId = $data['reserva_id'] ?? null;

if (!$reservaId) {
    http_response_code(400);
    die(json_encode(['error' => 'Falta el id de la reserva.']));
}

$stmt = $pdo->prepare("UPDATE reservas SET estado = 'cancelada' WHERE id = ?");
$stmt->execute([$reservaId]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    die(json_encode(['error' => 'Reserva no encontrada.']));
}

echo json_encode(['ok' => true]);
