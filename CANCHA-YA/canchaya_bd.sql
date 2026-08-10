-- ═══════════════════════════════════════════════════════
--  canchaya_bd.sql — Base de datos para CanchaYa
--  MySQL 8+ / MariaDB — Motor InnoDB, UTF-8
-- ═══════════════════════════════════════════════════════

DROP DATABASE IF EXISTS canchaya_bd;
CREATE DATABASE canchaya_bd CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE canchaya_bd;

-- ───────────────────────────────────────────────
-- Tabla: usuarios
-- ───────────────────────────────────────────────
CREATE TABLE usuarios (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,          -- guardar con password_hash() de PHP
    tel           VARCHAR(20)  DEFAULT NULL,
    rol           ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
    creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ───────────────────────────────────────────────
-- Tabla: canchas
-- ───────────────────────────────────────────────
CREATE TABLE canchas (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    tipo          VARCHAR(30)  NOT NULL,           -- Fútbol 5 / Fútbol 7 / Fútbol 11
    zona          VARCHAR(50)  NOT NULL,
    precio        DECIMAL(6,2) NOT NULL,
    luz           TINYINT(1)   NOT NULL DEFAULT 0,
    techada       TINYINT(1)   NOT NULL DEFAULT 0,
    activa        TINYINT(1)   NOT NULL DEFAULT 1,
    creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ───────────────────────────────────────────────
-- Tabla: horarios (los 16 slots fijos de data.js)
-- ───────────────────────────────────────────────
CREATE TABLE horarios (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    hora          TIME NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ───────────────────────────────────────────────
-- Tabla: reservas
-- ───────────────────────────────────────────────
CREATE TABLE reservas (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    cancha_id        INT NOT NULL,
    horario_id       INT NOT NULL,
    usuario_id       INT DEFAULT NULL,             -- NULL si reservó como invitado
    fecha            DATE NOT NULL,
    nombre_jugador   VARCHAR(100) NOT NULL,
    telefono         VARCHAR(20)  DEFAULT NULL,
    email            VARCHAR(150) NOT NULL,
    jugadores        TINYINT UNSIGNED NOT NULL,
    precio_pagado    DECIMAL(6,2) NOT NULL,
    estado           ENUM('confirmada','cancelada') NOT NULL DEFAULT 'confirmada',
    creado_en        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reserva_cancha  FOREIGN KEY (cancha_id)  REFERENCES canchas(id)  ON DELETE CASCADE,
    CONSTRAINT fk_reserva_horario FOREIGN KEY (horario_id) REFERENCES horarios(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,

    -- Evita doble reserva: misma cancha, misma fecha, mismo horario
    UNIQUE KEY uq_cancha_fecha_horario (cancha_id, fecha, horario_id)
) ENGINE=InnoDB;

-- ═══════════════════════════════════════════════
--  DATOS INICIALES (seed) — igual a js/data.js
-- ═══════════════════════════════════════════════

-- Usuario admin (password real: admin123)
INSERT INTO usuarios (nombre, email, password, tel, rol) VALUES
('Admin CanchaYa', 'admin@canchaya.com', '$2b$10$iOmQHCnE.7RBh.PstMdUheSBnW5HDMfOssMwCKx1nrbmtOjKwPEHy', '+507 6000-0000', 'admin');

-- Canchas
INSERT INTO canchas (id, nombre, tipo, zona, precio, luz, techada) VALUES
(1, 'Cancha El Estadio',       'Fútbol 5',  'Zona Norte', 25, 1, 0),
(2, 'Complejo Deportivo Sur',  'Fútbol 7',  'Zona Sur',   35, 1, 1),
(3, 'Cancha Los Pinos',        'Fútbol 11', 'Zona Este',  50, 0, 0),
(4, 'Arena Verde',             'Fútbol 5',  'Centro',     30, 1, 1),
(5, 'Club Atlético',           'Fútbol 7',  'Zona Oeste', 40, 1, 0),
(6, 'Cancha La Pradera',       'Fútbol 5',  'Zona Norte', 20, 0, 0);

-- Horarios (08:00 a 23:00, igual al arreglo horarios[])
INSERT INTO horarios (id, hora) VALUES
(1,'08:00'),(2,'09:00'),(3,'10:00'),(4,'11:00'),
(5,'12:00'),(6,'13:00'),(7,'14:00'),(8,'15:00'),
(9,'16:00'),(10,'17:00'),(11,'18:00'),(12,'19:00'),
(13,'20:00'),(14,'21:00'),(15,'22:00'),(16,'23:00');

-- Reservas de ejemplo (reflejan ocupadosPorCancha de data.js, fecha = hoy)
INSERT INTO reservas (cancha_id, horario_id, usuario_id, fecha, nombre_jugador, telefono, email, jugadores, precio_pagado) VALUES
(1, 2,  NULL, CURDATE(), 'Jugador Demo', '+507 6111-1111', 'demo1@correo.com', 10, 25),
(1, 5,  NULL, CURDATE(), 'Jugador Demo', '+507 6111-1112', 'demo2@correo.com', 10, 25),
(1, 8,  NULL, CURDATE(), 'Jugador Demo', '+507 6111-1113', 'demo3@correo.com', 10, 25),
(2, 1,  NULL, CURDATE(), 'Jugador Demo', '+507 6222-1111', 'demo4@correo.com', 14, 35),
(2, 4,  NULL, CURDATE(), 'Jugador Demo', '+507 6222-1112', 'demo5@correo.com', 14, 35),
(2, 10, NULL, CURDATE(), 'Jugador Demo', '+507 6222-1113', 'demo6@correo.com', 14, 35),
(3, 3,  NULL, CURDATE(), 'Jugador Demo', '+507 6333-1111', 'demo7@correo.com', 22, 50),
(3, 7,  NULL, CURDATE(), 'Jugador Demo', '+507 6333-1112', 'demo8@correo.com', 22, 50),
(4, 6,  NULL, CURDATE(), 'Jugador Demo', '+507 6444-1111', 'demo9@correo.com', 10, 30),
(4, 11, NULL, CURDATE(), 'Jugador Demo', '+507 6444-1112', 'demo10@correo.com', 10, 30),
(5, 2,  NULL, CURDATE(), 'Jugador Demo', '+507 6555-1111', 'demo11@correo.com', 14, 40),
(5, 9,  NULL, CURDATE(), 'Jugador Demo', '+507 6555-1112', 'demo12@correo.com', 14, 40),
(5, 12, NULL, CURDATE(), 'Jugador Demo', '+507 6555-1113', 'demo13@correo.com', 14, 40),
(6, 4,  NULL, CURDATE(), 'Jugador Demo', '+507 6666-1111', 'demo14@correo.com', 10, 20),
(6, 8,  NULL, CURDATE(), 'Jugador Demo', '+507 6666-1112', 'demo15@correo.com', 10, 20);
