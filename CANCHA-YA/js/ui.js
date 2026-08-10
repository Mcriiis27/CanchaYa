/* ═══════════════════════════════════════════════════════
   ui.js  —  CanchaYa
   Funciones de renderizado de vistas y navegación
═══════════════════════════════════════════════════════ */

// ── SVG del campo ────────────────────────────────────
function fieldSVG(small = false) {
  const s = small ? 80 : 100;
  const h = Math.round(s * 0.65);
  return `
    <svg width="${s}" height="${h}" viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="192" height="122" rx="4" stroke="#3d8a1c" stroke-width="2" fill="#1a3a0a"/>
      <line x1="100" y1="4" x2="100" y2="126" stroke="#2d6614" stroke-width="1.5"/>
      <circle cx="100" cy="65" r="18" stroke="#2d6614" stroke-width="1.5"/>
      <circle cx="100" cy="65" r="2" fill="#3d8a1c"/>
      <rect x="4" y="38" width="28" height="54" stroke="#2d6614" stroke-width="1.5"/>
      <rect x="4" y="50" width="12" height="30" stroke="#2d6614" stroke-width="1.5"/>
      <rect x="168" y="38" width="28" height="54" stroke="#2d6614" stroke-width="1.5"/>
      <rect x="184" y="50" width="12" height="30" stroke="#2d6614" stroke-width="1.5"/>
    </svg>`;
}

// ── Ocultar todas las vistas ─────────────────────────
function hideAllViews() {
  const views = ['home-view','booking-view','success-view','misreservas-view','login-view','register-view','admin-view'];
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

// ── Mostrar Home ─────────────────────────────────────
function showHome() {
  hideAllViews();
  document.getElementById('home-view').style.display = 'block';
  selectedSlot    = null;
  selectedCancha  = null;
  renderCanchas(canchas);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Mostrar Login ─────────────────────────────────────
function showLogin() {
  hideAllViews();
  document.getElementById('login-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Mostrar Register ──────────────────────────────────
function showRegister() {
  hideAllViews();
  document.getElementById('register-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Mostrar Mis Reservas ──────────────────────────────
async function showMisReservas() {
  if (!usuarioActual) { showLogin(); return; }
  hideAllViews();
  document.getElementById('misreservas-view').style.display = 'block';
  await cargarMisReservas();
  renderMisReservas();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Renderizar cards de canchas ───────────────────────
function renderCanchas(lista) {
  const grid = document.getElementById('canchas-grid');
  if (!lista.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <p>No se encontraron canchas con esos filtros.</p>
      </div>`;
    return;
  }

  grid.innerHTML = lista.map(c => `
    <div class="cancha-card" onclick="showBooking(${c.id})">
      <div class="card-thumb">
        ${fieldSVG(false)}
        <div class="card-thumb-badge">${c.tipo}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${c.nombre}</div>
        <div class="card-sub">${c.zona}</div>
        <div class="card-row">
          <span class="card-price">$${c.precio}<span>/hr</span></span>
          <span class="pill ${c.luz ? 'pill-green' : 'pill-gray'}">${c.luz ? 'Con luz' : 'Sin luz'}</span>
        </div>
        <button class="btn-reservar">Reservar ahora</button>
      </div>
    </div>
  `).join('');
}

// ── Renderizar Mis Reservas ───────────────────────────
function renderMisReservas() {
  const container = document.getElementById('misreservas-content');

  if (!misReservas.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>No tienes reservas activas todavía.</p>
        <button class="btn-home" onclick="showHome()">Explorar canchas</button>
      </div>`;
    return;
  }

  container.innerHTML = `<div class="mis-reservas-grid">
    ${misReservas.map(r => `
      <div class="reserva-card">
        <div class="reserva-card-header">
          <span class="reserva-card-title">${r.cancha}</span>
          <span class="pill pill-green">${r.tipo}</span>
        </div>
        <div class="reserva-card-row">📅 ${r.fecha}</div>
        <div class="reserva-card-row">🕐 ${r.horario.slice(0,5)}</div>
        <div class="reserva-card-row">👤 ${r.nombre_jugador}</div>
        <div class="reserva-card-row">💰 $${r.precio_pagado}</div>
        <button class="btn-cancelar" onclick="cancelarReserva(${r.id})">Cancelar reserva</button>
      </div>
    `).join('')}
  </div>`;
}

// ── Filtrar canchas ───────────────────────────────────
function filterCanchas(filtro, btn) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');

  let lista = canchas;
  if      (filtro === 'luz')     lista = canchas.filter(c => c.luz);
  else if (filtro === 'techada') lista = canchas.filter(c => c.techada);
  else if (filtro !== 'Todas')   lista = canchas.filter(c => c.tipo === filtro);

  renderCanchas(lista);
}

// ── Buscar canchas ────────────────────────────────────
function buscarCanchas() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  if (!query) { renderCanchas(canchas); return; }

  const lista = canchas.filter(c =>
    c.nombre.toLowerCase().includes(query) ||
    c.zona.toLowerCase().includes(query)   ||
    c.tipo.toLowerCase().includes(query)
  );
  renderCanchas(lista);
}

// ── Menú hamburguesa (móvil) ──────────────────────────
function toggleNavMenu() {
  const links   = document.getElementById('nav-links');
  const overlay = document.getElementById('nav-overlay');
  const toggle  = document.getElementById('nav-toggle');
  const isOpen  = links.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
  toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeNavMenu() {
  document.getElementById('nav-links').classList.remove('open');
  document.getElementById('nav-overlay').classList.remove('open');
  document.getElementById('nav-toggle').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Cierra el menú al tocar un link y al cambiar a vista de escritorio
document.addEventListener('DOMContentLoaded', () => {
  const links = document.getElementById('nav-links');
  if (links) {
    links.querySelectorAll('a, .nav-cta-mobile').forEach(el => el.addEventListener('click', closeNavMenu));
  }
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeNavMenu();
  });
});

// ── Actualizar navbar según sesión ───────────────────
function updateNavbar() {
  const btns = document.querySelectorAll('.nav-cta');
  btns.forEach(btn => {
    if (usuarioActual) {
      btn.textContent = `👤 ${usuarioActual.nombre.split(' ')[0]}`;
      btn.onclick = cerrarSesion;
    } else {
      btn.textContent = 'Iniciar sesión';
      btn.onclick = showLogin;
    }
  });

  const adminLink = document.getElementById('nav-admin-link');
  if (adminLink) {
    adminLink.style.display = (usuarioActual && usuarioActual.rol === 'admin') ? 'inline' : 'none';
  }
}