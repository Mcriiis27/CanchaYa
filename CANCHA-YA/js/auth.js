/* ═══════════════════════════════════════════════════════
   auth.js  —  CanchaYa
   Lógica de autenticación: login, registro, logout (vía API)
═══════════════════════════════════════════════════════ */

// ── Iniciar sesión ────────────────────────────────────
async function doLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;

  if (!email || !password) {
    alert('Por favor completa todos los campos.');
    return;
  }

  try {
    const res = await fetch(API_BASE + 'login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Correo o contraseña incorrectos.');
      return;
    }

    usuarioActual = data.usuario;
    await cargarMisReservas();
    updateNavbar();
    showHome();
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
  }
}

// ── Registrar usuario ─────────────────────────────────
async function doRegister() {
  const nombre   = document.getElementById('reg-nombre').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const tel      = document.getElementById('reg-tel').value.trim();
  const password = document.getElementById('reg-pass').value;

  if (!nombre || !email || !password) {
    alert('Por favor completa todos los campos obligatorios.');
    return;
  }
  if (password.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres.');
    return;
  }

  try {
    const res = await fetch(API_BASE + 'registro.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, tel, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'No se pudo crear la cuenta.');
      return;
    }

    usuarioActual = data.usuario;
    await cargarMisReservas();
    updateNavbar();
    showHome();
  } catch (e) {
    console.error(e);
    alert('No se pudo conectar con el servidor.');
  }
}

// ── Cerrar sesión ─────────────────────────────────────
async function cerrarSesion() {
  if (!confirm('¿Deseas cerrar sesión?')) return;

  try {
    await fetch(API_BASE + 'logout.php');
  } catch (e) {
    console.error(e);
  }

  usuarioActual = null;
  misReservas = [];
  updateNavbar();
  showHome();
}
