<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../conexion.php';

// Todos los horarios disponibles (16 slots fijos)
$horarios = $pdo->query("SELECT id, hora FROM horarios ORDER BY hora")->fetchAll();

// cancha_id y fecha vienen por GET, ej: get_horarios.php?cancha_id=1&fecha=2026-07-14
$canchaId = $_GET['cancha_id'] ?? null;
$fecha    = $_GET['fecha'] ?? date('Y-m-d');

$ocupados = [];
if ($canchaId) {
    $stmt = $pdo->prepare("
        SELECT horario_id FROM reservas
        WHERE cancha_id = ? AND fecha = ? AND estado = 'confirmada'
    ");
    $stmt->execute([$canchaId, $fecha]);
    $ocupados = array_column($stmt->fetchAll(), 'horario_id');
}

echo json_encode([
    'horarios' => $horarios,
    'ocupados' => $ocupados,
]);
