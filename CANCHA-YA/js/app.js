/* ═══════════════════════════════════════════════════════
   app.js  —  CanchaYa
   Inicialización de la aplicación
═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('canchas-grid');
  if (grid) grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>Cargando canchas...</p></div>`;

  await Promise.all([cargarCanchas(), restaurarSesion()]);

  if (usuarioActual) await cargarMisReservas();

  renderCanchas(canchas);
  updateNavbar();

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') buscarCanchas();
    });
  }
});
