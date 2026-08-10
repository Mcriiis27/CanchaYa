<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

$data     = json_decode(file_get_contents('php://input'), true);
$canchaId = $data['cancha_id'] ?? null;

if (!$canchaId) {
    http_response_code(400);
    die(json_encode(['error' => 'Falta el id de la cancha.']));
}

// Ojo: borrar una cancha borra en cascada todas sus reservas (FK ON DELETE CASCADE).
// Si solo quieres que deje de aparecer, usa canchas_toggle.php en vez de esto.
$stmt = $pdo->prepare("DELETE FROM canchas WHERE id = ?");
$stmt->execute([$canchaId]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    die(json_encode(['error' => 'Cancha no encontrada.']));
}

echo json_encode(['ok' => true]);
