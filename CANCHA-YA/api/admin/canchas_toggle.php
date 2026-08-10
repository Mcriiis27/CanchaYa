<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

$data     = json_decode(file_get_contents('php://input'), true);
$canchaId = $data['cancha_id'] ?? null;

if (!$canchaId) {
    http_response_code(400);
    die(json_encode(['error' => 'Falta el id de la cancha.']));
}

$stmt = $pdo->prepare("UPDATE canchas SET activa = NOT activa WHERE id = ?");
$stmt->execute([$canchaId]);

$stmt = $pdo->prepare("SELECT activa FROM canchas WHERE id = ?");
$stmt->execute([$canchaId]);
$activa = (bool) $stmt->fetchColumn();

echo json_encode(['ok' => true, 'activa' => $activa]);
