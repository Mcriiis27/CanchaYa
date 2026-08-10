<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../conexion.php';

$data     = json_decode(file_get_contents('php://input'), true);
$nombre   = trim($data['nombre'] ?? '');
$email    = trim($data['email'] ?? '');
$tel      = trim($data['tel'] ?? '');
$password = $data['password'] ?? '';

if (!$nombre || !$email || !$password) {
    http_response_code(400);
    die(json_encode(['error' => 'Por favor completa todos los campos obligatorios.']));
}
if (strlen($password) < 6) {
    http_response_code(400);
    die(json_encode(['error' => 'La contraseña debe tener al menos 6 caracteres.']));
}

$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    die(json_encode(['error' => 'Ya existe una cuenta con ese correo electrónico.']));
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, tel, rol) VALUES (?, ?, ?, ?, 'cliente')");
$stmt->execute([$nombre, $email, $hash, $tel]);

$nuevoId = $pdo->lastInsertId();

session_start();
$_SESSION['usuario'] = ['id' => $nuevoId, 'nombre' => $nombre, 'email' => $email, 'tel' => $tel, 'rol' => 'cliente'];

echo json_encode(['usuario' => $_SESSION['usuario']]);
