<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../conexion.php';

$data = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    die(json_encode(['error' => 'Faltan campos obligatorios.']));
}

$stmt = $pdo->prepare("SELECT id, nombre, email, password, tel, rol FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($password, $usuario['password'])) {
    http_response_code(401);
    die(json_encode(['error' => 'Correo o contraseña incorrectos.']));
}

unset($usuario['password']); // nunca devolver el hash al front

session_start();
$_SESSION['usuario'] = $usuario;

echo json_encode(['usuario' => $usuario]);
