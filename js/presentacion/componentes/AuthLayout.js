// js/presentacion/componentes/AuthLayout.js
// CAPA DE PRESENTACIÓN (UI)
// Estructura de las pantallas de acceso (inicio de sesión y registro).

const AuthLayout = {
  html(contenido) {
    return `
      <div class="auth-screen">
        <section class="auth-aside" aria-hidden="true">
          <p class="brand brand--light"><img src="assets/img/logo.svg" alt="" width="30" height="30" />FinanTask</p>
          <p class="auth-quote">Todo lo que debes pagar, en un solo lugar.</p>
          <ul class="auth-points">
            <li>Registra tus obligaciones y su fecha límite</li>
            <li>Recibe alertas antes de que se venzan</li>
            <li>Lleva el historial de lo que ya pagaste</li>
          </ul>
        </section>
        <section class="auth-main">
          <div class="auth-card">${contenido}</div>
        </section>
      </div>`;
  },
};
