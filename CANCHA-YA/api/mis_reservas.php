<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../conexion.php';
session_start();

$email = $_SESSION['usuario']['email'] ?? ($_GET['email'] ?? null);
if (!$email) {
    http_response_code(401);
    die(json_encode(['error' => 'Debes iniciar sesión.']));
}

$stmt = $pdo->prepare("
    SELECT r.id, c.nombre AS cancha, c.tipo, c.zona, r.fecha, h.hora AS horario,
           r.nombre_jugador, r.jugadores, r.precio_pagado, r.estado
    FROM reservas r
    JOIN canchas  c ON c.id = r.cancha_id
    JOIN horarios h ON h.id = r.horario_id
    WHERE r.email = ? AND r.estado = 'confirmada'
    ORDER BY r.fecha DESC, h.hora DESC
");
$stmt->execute([$email]);

echo json_encode($stmt->fetchAll());
