// js/ui/login.js
// Vista + Controlador de la pantalla de inicio de sesion

const UILogin = {
  render(container) {
    container.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <p class="eyebrow">FinanTask</p>
          <h1>Organiza lo que debes</h1>
          <p class="auth-sub">Inicia sesion para ver tus pagos pendientes, proximos vencimientos y prioridades.</p>
          <form id="login-form">
            <label for="correo">Correo</label>
            <input type="email" id="correo" placeholder="tucorreo@ejemplo.com" required />
            <label for="contrasena">Contrasena</label>
            <input type="password" id="contrasena" placeholder="********" required />
            <p class="form-error" id="login-error"></p>
            <button type="submit" class="btn-primary">Entrar</button>
          </form>
        </div>
      </div>
    `;

    const form = container.querySelector("#login-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const correo = container.querySelector("#correo").value;
      const contrasena = container.querySelector("#contrasena").value;
      const resultado = Services.iniciarSesion(correo, contrasena);
      if (!resultado.ok) {
        container.querySelector("#login-error").textContent = resultado.mensaje;
        return;
      }
      window.location.hash = "#/dashboard";
    });
  },
};
