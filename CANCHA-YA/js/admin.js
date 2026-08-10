/* ═══════════════════════════════════════════════════════
   admin.js  —  CanchaYa
   Panel de administración (solo para usuarios con rol 'admin')
═══════════════════════════════════════════════════════ */

let adminTabActual = 'dashboard';

// ── Mostrar panel de admin ────────────────────────────
async function showAdmin() {
  if (!usuarioActual || usuarioActual.rol !== 'admin') {
    alert('Acceso restringido a administradores.');
    showHome();
    return;
  }
  hideAllViews();
  document.getElementById('admin-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await switchAdminTab('dashboard');
}

// ── Cambiar de pestaña dentro del panel ───────────────
async function switchAdminTab(tab, btn) {
  adminTabActual = tab;
  document.querySelectorAll('#admin-tabs .chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const idx = ['dashboard', 'usuarios', 'reservas', 'canchas'].indexOf(tab);
    document.querySelectorAll('#admin-tabs .chip')[idx]?.classList.add('active');
  }

  const content = document.getElementById('admin-content');
  content.innerHTML = `<div class="empty-state"><p>Cargando...</p></div>`;

  if (tab === 'dashboard') await renderAdminDashboard();
  else if (tab === 'usuarios') await renderAdminUsuarios();
  else if (tab === 'reservas') await renderAdminReservas();
  else if (tab === 'canchas') await renderAdminCanchas();
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════ */
async function renderAdminDashboard() {
  const content = document.getElementById('admin-content');
  try {
    const res  = await fetch(`${API_BASE}admin/stats.php`);
    const data = await res.json();

    if (!res.ok) {
      content.innerHTML = `<div class="empty-state"><p>${data.error}</p></div>`;
      return;
    }

    content.innerHTML = `
      <div class="admin-stats">
        <div class="admin-stat-card">
          <div class="admin-stat-num">${data.total_usuarios}</div>
          <div class="admin-stat-label">Usuarios registrados</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-num">${data.total_canchas}</div>
          <div class="admin-stat-label">Canchas activas</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-num">${data.reservas_hoy}</div>
          <div class="admin-stat-label">Reservas para hoy</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-num">$${data.ingresos_hoy}</div>
          <div class="admin-stat-label">Ingresos de hoy</div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-num">${data.total_reservas_activas}</div>
          <div class="admin-stat-label">Reservas activas (total)</div>
        </div>
      </div>`;
  } catch (e) {
    console.error(e);
    content.innerHTML = `<div class="empty-state"><p>No se pudo conectar con el servidor.</p></div>`;
  }
}

/* ═══════════════════════════════════════════════════════
   USUARIOS
═══════════════════════════════════════════════════════ */
async function renderAdminUsuarios() {
  const content = document.getElementById('admin-content');

  const formHtml = `
    <div class="admin-form-card">
      <h3 style="margin-bottom:16px;">Crear nuevo usuario</h3>
      <div class="admin-form-grid">
        <div class="form-group">
          <label>Nombre completo</label>
          <input type="text" id="au-nombre" placeholder="Tu nombre completo"/>
        </div>
        <div class="form-group">
          <label>Correo electrónico</label>
          <input type="email" id="au-email" placeholder="correo@ejemplo.com"/>
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input type="tel" id="au-tel" placeholder="+507 6000-0000"/>
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" id="au-pass" placeholder="Mínimo 6 caracteres"/>
        </div>
        <div class="form-group">
          <label>Rol</label>
          <select id="au-rol">
            <option value="cliente">Cliente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>
      <button class="btn-confirm" style="width:auto; padding:11px 28px;" onclick="crearUsuarioAdmin()">+ Crear usuario</button>
    </div>
    <div id="admin-usuarios-tabla"></div>
  `;
  content.innerHTML = formHtml;

  await cargarYRenderizarUsuarios();
}

async function cargarYRenderizarUsuarios() {
  const tabla = document.getElementById('admin-usuarios-tabla');
  try {
    const res = await fetch(`${API_BASE}admin/usuarios_listar.php`);
    const usuarios = await res.json();

    if (!usuarios.length) {
      tabla.innerHTML = `<div class="empty-state"><p>No hay usuarios registrados.</p></div>`;
      return;
    }

    tabla.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Registrado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios.map(u => `
            <tr>
              <td>${u.nombre}</td>
              <td>${u.email}</td>
              <td>${u.tel || '—'}</td>
              <td><span class="${u.rol === 'admin' ? 'badge-admin' : 'badge-cliente'}">${u.rol}</span></td>
              <td>${u.creado_en.slice(0, 10)}</td>
              <td>
                ${u.rol === 'admin'
                  ? `<button class="btn-mini btn-mini-green" onclick="cambiarRolUsuario(${u.id}, 'cliente')">Quitar admin</button>`
                  : `<button class="btn-mini btn-mini-green" onclick="cambiarRolUsuario(${u.id}, 'admin')">Hacer admin</button>`
                }
                <button class="btn-mini btn-mini-danger" onclick="eliminarUsuarioAdmin(${u.id}, '${u.nombre.replace(/'/g, "\\'")}')">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    console.error(e);
    tabla.innerHTML = `<div class="empty-state"><p>No se pudo conectar con el servidor.</p></div>`;
  }
}

async function crearUsuarioAdmin() {
  const nombre   = document.getElementById('au-nombre').value.trim();
  const email    = document.getElementById('au-email').value.trim();
  const tel      = document.getElementById('au-tel').value.trim();
  const password = document.getElementById('au-pass').value;
  const rol      = document.getElementById('au-rol').value;

  if (!nombre || !email || !password) {
    alert('Nombre, correo y contraseña son obligatorios.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}admin/usuarios_crear.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, tel, password, rol }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'No se pudo crear el usuario.');
      return;
    }

    document.getElementById('au-nombre').value = '';
    document.getElementById('au-email').value = '';
    document.getElementById('au-tel').value = '';
    document.getElementById('au-pass').value = '';
    await cargarYRenderizarUsuarios();
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
  }
}

async function eliminarUsuarioAdmin(id, nombre) {
  if (!confirm(`¿Eliminar la cuenta de "${nombre}"? Esta acción no se puede deshacer.`)) return;

  try {
    const res = await fetch(`${API_BASE}admin/usuarios_eliminar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: id }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'No se pudo eliminar el usuario.');
      return;
    }
    await cargarYRenderizarUsuarios();
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
  }
}

async function cambiarRolUsuario(id, rol) {
  try {
    const res = await fetch(`${API_BASE}admin/usuarios_rol.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: id, rol }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'No se pudo actualizar el rol.');
      return;
    }
    await cargarYRenderizarUsuarios();
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
  }
}

/* ═══════════════════════════════════════════════════════
   RESERVAS
═══════════════════════════════════════════════════════ */
async function renderAdminReservas() {
  const content = document.getElementById('admin-content');
  content.innerHTML = `
    <div class="admin-tabs">
      <button class="chip active" onclick="filtrarReservasAdmin('confirmada', this)">Confirmadas</button>
      <button class="chip" onclick="filtrarReservasAdmin('cancelada', this)">Canceladas</button>
      <button class="chip" onclick="filtrarReservasAdmin('', this)">Todas</button>
    </div>
    <div id="admin-reservas-tabla"></div>
  `;
  await cargarYRenderizarReservas('confirmada');
}

async function filtrarReservasAdmin(estado, btn) {
  document.querySelectorAll('#admin-content .admin-tabs .chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  await cargarYRenderizarReservas(estado);
}

async function cargarYRenderizarReservas(estado) {
  const tabla = document.getElementById('admin-reservas-tabla');
  tabla.innerHTML = `<div class="empty-state"><p>Cargando...</p></div>`;

  try {
    const qs  = estado ? `?estado=${estado}` : '';
    const res = await fetch(`${API_BASE}admin/reservas_listar.php${qs}`);
    const reservas = await res.json();

    if (!reservas.length) {
      tabla.innerHTML = `<div class="empty-state"><p>No hay reservas para este filtro.</p></div>`;
      return;
    }

    tabla.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Cancha</th><th>Fecha</th><th>Hora</th><th>Jugador</th><th>Contacto</th>
            <th>Jugadores</th><th>Precio</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${reservas.map(r => `
            <tr>
              <td>${r.cancha}<br><span style="color:var(--text-muted); font-size:12px;">${r.tipo}</span></td>
              <td>${r.fecha}</td>
              <td>${r.horario.slice(0, 5)}</td>
              <td>${r.nombre_jugador}</td>
              <td>${r.email}<br><span style="color:var(--text-muted); font-size:12px;">${r.telefono || '—'}</span></td>
              <td>${r.jugadores}</td>
              <td>$${r.precio_pagado}</td>
              <td><span class="${r.estado === 'confirmada' ? 'badge-admin' : 'badge-cliente'}">${r.estado}</span></td>
              <td>
                ${r.estado === 'confirmada'
                  ? `<button class="btn-mini btn-mini-danger" onclick="cancelarReservaAdmin(${r.id})">Cancelar</button>`
                  : '—'
                }
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    console.error(e);
    tabla.innerHTML = `<div class="empty-state"><p>No se pudo conectar con el servidor.</p></div>`;
  }
}

async function cancelarReservaAdmin(id) {
  if (!confirm('¿Cancelar esta reserva?')) return;

  try {
    const res = await fetch(`${API_BASE}admin/reservas_cancelar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reserva_id: id }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'No se pudo cancelar la reserva.');
      return;
    }

    const activeChip = document.querySelector('#admin-content .admin-tabs .chip.active');
    const estadoActivo = activeChip?.textContent === 'Confirmadas' ? 'confirmada'
                        : activeChip?.textContent === 'Canceladas' ? 'cancelada' : '';
    await cargarYRenderizarReservas(estadoActivo);
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
  }
}

/* ═══════════════════════════════════════════════════════
   CANCHAS
═══════════════════════════════════════════════════════ */
async function renderAdminCanchas() {
  const content = document.getElementById('admin-content');
  content.innerHTML = `
    <div class="admin-form-card">
      <h3 style="margin-bottom:16px;">Crear nueva cancha</h3>
      <div class="admin-form-grid">
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" id="ac-nombre" placeholder="Ej: Cancha Central"/>
        </div>
        <div class="form-group">
          <label>Tipo</label>
          <select id="ac-tipo">
            <option>Fútbol 5</option>
            <option>Fútbol 7</option>
            <option>Fútbol 11</option>
          </select>
        </div>
        <div class="form-group">
          <label>Zona</label>
          <input type="text" id="ac-zona" placeholder="Ej: Zona Norte"/>
        </div>
        <div class="form-group">
          <label>Precio por hora ($)</label>
          <input type="number" id="ac-precio" placeholder="30" min="1" step="0.01"/>
        </div>
        <div class="form-group">
          <label>Iluminación</label>
          <select id="ac-luz">
            <option value="0">Sin luz</option>
            <option value="1">Con luz</option>
          </select>
        </div>
        <div class="form-group">
          <label>Techo</label>
          <select id="ac-techada">
            <option value="0">Al aire libre</option>
            <option value="1">Techada</option>
          </select>
        </div>
      </div>
      <button class="btn-confirm" style="width:auto; padding:11px 28px;" onclick="crearCanchaAdmin()">+ Crear cancha</button>
    </div>
    <div id="admin-canchas-tabla"></div>
  `;
  await cargarYRenderizarCanchas();
}

async function crearCanchaAdmin() {
  const nombre  = document.getElementById('ac-nombre').value.trim();
  const tipo    = document.getElementById('ac-tipo').value;
  const zona    = document.getElementById('ac-zona').value.trim();
  const precio  = document.getElementById('ac-precio').value;
  const luz     = document.getElementById('ac-luz').value === '1';
  const techada = document.getElementById('ac-techada').value === '1';

  if (!nombre || !zona || !precio) {
    alert('Nombre, zona y precio son obligatorios.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}admin/canchas_crear.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, tipo, zona, precio, luz, techada }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'No se pudo crear la cancha.');
      return;
    }

    document.getElementById('ac-nombre').value = '';
    document.getElementById('ac-zona').value = '';
    document.getElementById('ac-precio').value = '';
    await cargarYRenderizarCanchas();
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
  }
}

async function cargarYRenderizarCanchas() {
  const tabla = document.getElementById('admin-canchas-tabla');

  try {
    const res = await fetch(`${API_BASE}admin/canchas_listar.php`);
    const listaCanchas = await res.json();

    tabla.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr><th>Nombre</th><th>Tipo</th><th>Zona</th><th>Precio/hr</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          ${listaCanchas.map(c => `
            <tr>
              <td>${c.nombre}</td>
              <td>${c.tipo}</td>
              <td>${c.zona}</td>
              <td>$${c.precio}</td>
              <td><span class="${c.activa ? 'badge-admin' : 'badge-cliente'}">${c.activa ? 'Activa' : 'Inactiva'}</span></td>
              <td>
                <button class="btn-mini ${c.activa ? 'btn-mini-danger' : 'btn-mini-green'}" onclick="toggleCanchaAdmin(${c.id})">
                  ${c.activa ? 'Desactivar' : 'Activar'}
                </button>
                <button class="btn-mini btn-mini-danger" onclick="eliminarCanchaAdmin(${c.id}, '${c.nombre.replace(/'/g, "\\'")}')">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  } catch (e) {
    console.error(e);
    tabla.innerHTML = `<div class="empty-state"><p>No se pudo conectar con el servidor.</p></div>`;
  }
}

async function toggleCanchaAdmin(id) {
  try {
    const res = await fetch(`${API_BASE}admin/canchas_toggle.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancha_id: id }),
    });
    if (!res.ok) {
      alert('No se pudo actualizar la cancha.');
      return;
    }
    await cargarYRenderizarCanchas();
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
  }
}

async function eliminarCanchaAdmin(id, nombre) {
  if (!confirm(`¿Eliminar "${nombre}"? Esto también borrará todas sus reservas (activas e históricas). Si solo quieres ocultarla, usa "Desactivar" en su lugar.`)) return;

  try {
    const res = await fetch(`${API_BASE}admin/canchas_eliminar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cancha_id: id }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'No se pudo eliminar la cancha.');
      return;
    }
    await cargarYRenderizarCanchas();
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
  }
}
