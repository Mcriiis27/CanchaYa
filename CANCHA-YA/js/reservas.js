/* ═══════════════════════════════════════════════════════
   reservas.js  —  CanchaYa
   Lógica de reservas: booking view, slots, confirmación (vía API)
═══════════════════════════════════════════════════════ */

let selectedSlot   = null;   // texto de la hora seleccionada, ej "14:00"
let selectedCancha = null;

// ── Mostrar vista de reserva ──────────────────────────
async function showBooking(id) {
  selectedCancha = canchas.find(c => c.id === id);
  selectedSlot   = null;

  await cargarHorariosYOcupados(id);
  const busy = ocupadosPorCancha[id] || [];

  hideAllViews();
  document.getElementById('booking-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  document.getElementById('booking-content').innerHTML = `
    <div class="booking-layout">

      <!-- ── Left panel ── -->
      <div class="booking-left">
        <h2>${selectedCancha.nombre}</h2>
        <p>${selectedCancha.tipo} · ${selectedCancha.zona}</p>

        <div class="info-chips">
          <span class="pill pill-green">${selectedCancha.tipo}</span>
          <span class="pill ${selectedCancha.luz ? 'pill-green' : 'pill-gray'}">
            ${selectedCancha.luz ? '💡 Con iluminación' : 'Sin iluminación'}
          </span>
          <span class="pill ${selectedCancha.techada ? 'pill-green' : 'pill-gray'}">
            ${selectedCancha.techada ? '🏠 Techada' : 'Al aire libre'}
          </span>
        </div>

        <div class="label-section">Selecciona un horario</div>
        <div class="slot-legend">
          <span><span class="dot-avail"></span> Disponible</span>
          <span><span class="dot-busy"></span> Ocupado</span>
          <span><span class="dot-sel"></span> Seleccionado</span>
        </div>
        <div class="slots-grid">
          ${horarios.map(h => `
            <button
              class="slot ${busy.includes(h.id) ? 'busy' : ''}"
              ${busy.includes(h.id) ? 'disabled' : `onclick="selectSlot(this, '${h.hora}')"`}>
              ${h.hora}
            </button>
          `).join('')}
        </div>

        <div class="label-section">Datos del jugador</div>
        <div class="booking-form">
          <div class="form-group">
            <label>Nombre completo</label>
            <input type="text" id="f-nombre"
              value="${usuarioActual ? usuarioActual.nombre : ''}"
              placeholder="Tu nombre completo"/>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input type="tel" id="f-tel"
              value="${usuarioActual ? usuarioActual.tel || '' : ''}"
              placeholder="+507 6000-0000"/>
          </div>
          <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" id="f-email"
              value="${usuarioActual ? usuarioActual.email : ''}"
              placeholder="correo@ejemplo.com"/>
          </div>
          <div class="form-group">
            <label>Número de jugadores</label>
            <select id="f-jugadores">
              <option value="5">5 jugadores</option>
              <option value="6">6 jugadores</option>
              <option value="7">7 jugadores</option>
              <option value="10">10 jugadores</option>
              <option value="11">11 jugadores</option>
            </select>
          </div>
        </div>
      </div>

      <!-- ── Right panel (summary) ── -->
      <div>
        <div class="summary">
          <h3>Resumen de reserva</h3>
          <div class="sum-thumb">${fieldSVG(true)}</div>
          <div class="sum-rows">
            <div class="sum-row">
              <span class="label">Cancha</span>
              <span class="value">${selectedCancha.nombre}</span>
            </div>
            <div class="sum-row">
              <span class="label">Tipo</span>
              <span class="value">${selectedCancha.tipo}</span>
            </div>
            <div class="sum-row">
              <span class="label">Fecha</span>
              <span class="value">${new Date().toLocaleDateString('es-PA', {weekday:'short', day:'numeric', month:'short'})}</span>
            </div>
            <div class="sum-row">
              <span class="label">Horario</span>
              <span class="value" id="sum-hora">— Selecciona</span>
            </div>
            <div class="sum-row">
              <span class="label">Duración</span>
              <span class="value">1 hora</span>
            </div>
          </div>
          <div class="sum-total">
            <span class="t-label">Total a pagar</span>
            <span class="t-value">$${selectedCancha.precio}</span>
          </div>
          <button class="btn-confirm" onclick="confirmarReserva()">Confirmar reserva</button>
        </div>
      </div>

    </div>`;
}

// ── Seleccionar horario ───────────────────────────────
function selectSlot(el, hora) {
  document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selectedSlot = hora;
  const sumHora = document.getElementById('sum-hora');
  if (sumHora) sumHora.textContent = hora;
}

// ── Confirmar reserva ─────────────────────────────────
async function confirmarReserva() {
  if (!selectedSlot) {
    alert('Por favor selecciona un horario antes de confirmar.');
    return;
  }

  const nombre    = document.getElementById('f-nombre')?.value.trim();
  const email     = document.getElementById('f-email')?.value.trim();
  const tel       = document.getElementById('f-tel')?.value.trim();
  const jugadores = document.getElementById('f-jugadores')?.value;

  if (!nombre) { alert('Por favor ingresa tu nombre.'); return; }
  if (!email)  { alert('Por favor ingresa tu correo.'); return; }

  const btn = document.querySelector('.btn-confirm');
  if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }

  try {
    const res = await fetch(`${API_BASE}crear_reserva.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cancha_id: selectedCancha.id,
        horario:   selectedSlot,
        fecha:     fechaHoy(),
        nombre, tel, email, jugadores,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'No se pudo confirmar la reserva.');
      if (btn) { btn.disabled = false; btn.textContent = 'Confirmar reserva'; }
      // El horario pudo haber sido tomado por otra persona: recargamos la vista
      await showBooking(selectedCancha.id);
      return;
    }

    // Mostrar pantalla de éxito
    hideAllViews();
    document.getElementById('success-view').style.display = 'block';
    document.getElementById('success-detail-card').innerHTML = `
      <div class="sc-row"><span class="sc-label">Cancha</span><span class="sc-value">${selectedCancha.nombre}</span></div>
      <div class="sc-row"><span class="sc-label">Tipo</span><span class="sc-value">${selectedCancha.tipo}</span></div>
      <div class="sc-row"><span class="sc-label">Fecha</span><span class="sc-value">${new Date().toLocaleDateString('es-PA', { weekday:'long', day:'numeric', month:'long' })}</span></div>
      <div class="sc-row"><span class="sc-label">Horario</span><span class="sc-value">${selectedSlot}</span></div>
      <div class="sc-row"><span class="sc-label">Jugador</span><span class="sc-value">${nombre}</span></div>
      <div class="sc-row"><span class="sc-label">Jugadores</span><span class="sc-value">${jugadores}</span></div>
      <div class="sc-row"><span class="sc-label">Total pagado</span><span class="sc-value">$${selectedCancha.precio}</span></div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
    if (btn) { btn.disabled = false; btn.textContent = 'Confirmar reserva'; }
  }
}

// ── Cancelar reserva ──────────────────────────────────
async function cancelarReserva(reservaId) {
  const reserva = misReservas.find(r => r.id === reservaId);
  if (!reserva) return;

  if (!confirm(`¿Cancelar tu reserva en ${reserva.cancha} a las ${reserva.horario}?`)) return;

  try {
    const res = await fetch(`${API_BASE}cancelar_reserva.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reserva_id: reservaId }),
    });
    if (!res.ok) {
      alert('No se pudo cancelar la reserva.');
      return;
    }
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
    return;
  }

  await cargarMisReservas();
  renderMisReservas();
}
