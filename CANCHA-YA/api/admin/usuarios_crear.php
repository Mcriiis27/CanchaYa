<?php
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../../conexion.php';

$data     = json_decode(file_get_contents('php://input'), true);
$nombre   = trim($data['nombre'] ?? '');
$email    = trim($data['email'] ?? '');
$tel      = trim($data['tel'] ?? '');
$password = $data['password'] ?? '';
$rol      = $data['rol'] ?? 'cliente';

if (!in_array($rol, ['cliente', 'admin'], true)) {
    $rol = 'cliente';
}

if (!$nombre || !$email || !$password) {
    http_response_code(400);
    die(json_encode(['error' => 'Nombre, correo y contraseña son obligatorios.']));
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

$stmt = $pdo->prepare("INSERT INTO usuarios (nombre, email, password, tel, rol) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$nombre, $email, $hash, $tel, $rol]);

echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
