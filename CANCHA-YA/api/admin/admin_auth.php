<?php
/* ═══════════════════════════════════════════════════════
   admin_auth.php — Middleware de protección para /api/admin/*
   Se incluye al inicio de cada endpoint de admin.
═══════════════════════════════════════════════════════ */

session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['usuario']) || $_SESSION['usuario']['rol'] !== 'admin') {
    http_response_code(403);
    die(json_encode(['error' => 'Acceso restringido a administradores.']));
}
