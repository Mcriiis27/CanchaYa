/* ═══════════════════════════════════════════════════════
   data.js  —  CanchaYa
   Estado global de la app + funciones de carga desde la API
═══════════════════════════════════════════════════════ */

const API_BASE = 'api/';

// Estado en memoria (se llena desde la BD vía fetch)
let canchas           = [];   // [{id, nombre, tipo, zona, precio, luz, techada}]
let horarios          = [];   // [{id, hora}] — horarios de la cancha actualmente abierta
let ocupadosPorCancha = {};   // { canchaId: [horario_id, horario_id, ...] } para la fecha actual
let misReservas       = [];   // reservas del usuario logueado, cargadas desde el servidor
let usuarioActual     = null;

// Fecha de hoy en formato YYYY-MM-DD (la que usa la BD)
function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

// ── Cargar canchas desde la API ───────────────────────
async function cargarCanchas() {
  try {
    const res = await fetch(API_BASE + 'get_canchas.php');
    canchas = await res.json();
  } catch (e) {
    console.error('Error al cargar canchas:', e);
    canchas = [];
  }
}

// ── Cargar horarios + ocupados de una cancha para hoy ─
async function cargarHorariosYOcupados(canchaId) {
  try {
    const res  = await fetch(`${API_BASE}get_horarios.php?cancha_id=${canchaId}&fecha=${fechaHoy()}`);
    const data = await res.json();
    horarios = data.horarios.map(h => ({ id: h.id, hora: h.hora.slice(0, 5) })); // "14:00:00" -> "14:00"
    ocupadosPorCancha[canchaId] = data.ocupados; // array de horario_id ocupados
  } catch (e) {
    console.error('Error al cargar horarios:', e);
    horarios = [];
    ocupadosPorCancha[canchaId] = [];
  }
}

// ── Restaurar sesión activa (si existe) al cargar la página ─
async function restaurarSesion() {
  try {
    const res  = await fetch(API_BASE + 'sesion.php');
    const data = await res.json();
    usuarioActual = data.usuario || null;
  } catch (e) {
    console.error('Error al restaurar sesión:', e);
    usuarioActual = null;
  }
}

// ── Cargar mis reservas desde el servidor ─────────────
async function cargarMisReservas() {
  if (!usuarioActual) { misReservas = []; return; }
  try {
    const res = await fetch(`${API_BASE}mis_reservas.php`);
    misReservas = await res.json();
  } catch (e) {
    console.error('Error al cargar mis reservas:', e);
    misReservas = [];
  }
}
