<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../conexion.php';

$data       = json_decode(file_get_contents('php://input'), true);
$reservaId  = $data['reserva_id'] ?? null;

if (!$reservaId) {
    http_response_code(400);
    die(json_encode(['error' => 'Falta el id de la reserva.']));
}

$stmt = $pdo->prepare("UPDATE reservas SET estado = 'cancelada' WHERE id = ?");
$stmt->execute([$reservaId]);

echo json_encode(['ok' => true]);
