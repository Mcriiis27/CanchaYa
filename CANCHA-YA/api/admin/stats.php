<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

$totalUsuarios = $pdo->query("SELECT COUNT(*) FROM usuarios")->fetchColumn();
$totalCanchas  = $pdo->query("SELECT COUNT(*) FROM canchas WHERE activa = 1")->fetchColumn();

$reservasHoy = $pdo->prepare("
    SELECT COUNT(*) FROM reservas WHERE fecha = CURDATE() AND estado = 'confirmada'
");
$reservasHoy->execute();
$reservasHoy = $reservasHoy->fetchColumn();

$ingresosHoy = $pdo->prepare("
    SELECT COALESCE(SUM(precio_pagado), 0) FROM reservas
    WHERE fecha = CURDATE() AND estado = 'confirmada'
");
$ingresosHoy->execute();
$ingresosHoy = $ingresosHoy->fetchColumn();

$totalReservasActivas = $pdo->query("
    SELECT COUNT(*) FROM reservas WHERE estado = 'confirmada'
")->fetchColumn();

echo json_encode([
    'total_usuarios'         => (int) $totalUsuarios,
    'total_canchas'          => (int) $totalCanchas,
    'reservas_hoy'           => (int) $reservasHoy,
    'ingresos_hoy'           => (float) $ingresosHoy,
    'total_reservas_activas' => (int) $totalReservasActivas,
]);
