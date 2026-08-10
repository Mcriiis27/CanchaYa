<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

// Filtros opcionales por query string: ?estado=confirmada&fecha=2026-07-14&cancha_id=1
$estado   = $_GET['estado']    ?? null;
$fecha    = $_GET['fecha']     ?? null;
$canchaId = $_GET['cancha_id'] ?? null;

$sql    = "
    SELECT r.id, r.cancha_id, c.nombre AS cancha, c.tipo, r.fecha, h.hora AS horario,
           r.nombre_jugador, r.telefono, r.email, r.jugadores, r.precio_pagado,
           r.estado, r.creado_en, r.usuario_id
    FROM reservas r
    JOIN canchas  c ON c.id = r.cancha_id
    JOIN horarios h ON h.id = r.horario_id
    WHERE 1=1
";
$params = [];

if ($estado) {
    $sql .= " AND r.estado = ?";
    $params[] = $estado;
}
if ($fecha) {
    $sql .= " AND r.fecha = ?";
    $params[] = $fecha;
}
if ($canchaId) {
    $sql .= " AND r.cancha_id = ?";
    $params[] = $canchaId;
}

$sql .= " ORDER BY r.fecha DESC, h.hora DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

echo json_encode($stmt->fetchAll());
