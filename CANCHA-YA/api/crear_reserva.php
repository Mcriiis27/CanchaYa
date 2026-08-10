<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../conexion.php';
session_start();

$data       = json_decode(file_get_contents('php://input'), true);
$canchaId   = $data['cancha_id']  ?? null;
$horaTexto  = $data['horario']    ?? null;   // ej: "14:00"
$fecha      = $data['fecha']      ?? date('Y-m-d');
$nombre     = trim($data['nombre'] ?? '');
$telefono   = trim($data['tel'] ?? '');
$email      = trim($data['email'] ?? '');
$jugadores  = (int)($data['jugadores'] ?? 0);

if (!$canchaId || !$horaTexto || !$nombre || !$email) {
    http_response_code(400);
    die(json_encode(['error' => 'Faltan datos obligatorios.']));
}

// Buscar id del horario a partir de la hora (ej "14:00")
$stmt = $pdo->prepare("SELECT id FROM horarios WHERE hora = ?");
$stmt->execute([$horaTexto]);
$horario = $stmt->fetch();
if (!$horario) {
    http_response_code(400);
    die(json_encode(['error' => 'Horario inválido.']));
}
$horarioId = $horario['id'];

// Buscar precio de la cancha
$stmt = $pdo->prepare("SELECT precio FROM canchas WHERE id = ?");
$stmt->execute([$canchaId]);
$cancha = $stmt->fetch();
if (!$cancha) {
    http_response_code(404);
    die(json_encode(['error' => 'Cancha no encontrada.']));
}

$usuarioId = $_SESSION['usuario']['id'] ?? null;

try {
    $stmt = $pdo->prepare("
        INSERT INTO reservas (cancha_id, horario_id, usuario_id, fecha, nombre_jugador, telefono, email, jugadores, precio_pagado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$canchaId, $horarioId, $usuarioId, $fecha, $nombre, $telefono, $email, $jugadores, $cancha['precio']]);
} catch (PDOException $e) {
    // Choca con la restricción UNIQUE (cancha_id, fecha, horario_id)
    if ($e->getCode() == 23000) {
        http_response_code(409);
        die(json_encode(['error' => 'Ese horario ya fue reservado. Elige otro.']));
    }
    http_response_code(500);
    die(json_encode(['error' => 'Error al crear la reserva.']));
}

echo json_encode(['ok' => true, 'reserva_id' => $pdo->lastInsertId()]);
