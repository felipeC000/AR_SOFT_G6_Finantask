// js/presentacion/componentes/AuthLayout.js
// CAPA DE PRESENTACIÓN (UI)
// Estructura de las pantallas de acceso (inicio de sesión y registro).

const AuthLayout = {
  html(contenido) {
    return `
      <div class="auth-screen">
        <div class="auth-card">
          <p class="auth-title">FinanTask</p>
          ${contenido}
        </div>
      </div>`;
  },
};
