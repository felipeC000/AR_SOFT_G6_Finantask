// js/presentacion/paginas/LoginPage.js
// CAPA DE PRESENTACIÓN (UI)
// Pantalla de inicio de sesión (RF02). Las credenciales se verifican en el backend.

const LoginPage = {
  render(container) {
    document.title = "Iniciar sesión · FinanTask";
    container.innerHTML = AuthLayout.html(`
      <h1>Iniciar sesión</h1>
      <p class="auth-sub">Ingresa tu correo y contraseña.</p>
      <form id="login-form" novalidate>
        <div class="field">
          <label for="correo">Correo</label>
          <input type="email" id="correo" name="correo" autocomplete="email" placeholder="tucorreo@ejemplo.com" required />
        </div>
        <div class="field">
          <label for="contrasena">Contraseña</label>
          <input type="password" id="contrasena" name="contrasena" autocomplete="current-password" placeholder="••••••••" required />
        </div>
        <p class="form-error" id="login-error" role="alert"></p>
        <button type="submit" class="btn btn-primary btn-block">Entrar</button>
      </form>
      <p class="auth-switch">¿No tienes cuenta? <a href="#/registro">Regístrate</a></p>
      <div class="demo-box">
        <strong>Cuenta de prueba</strong>
        <span>demo@finantask.co · contraseña demo1234</span>
        <button type="button" class="btn-link" data-action="usar-demo">Usar cuenta de prueba</button>
      </div>
    `);

    const form = Dom.$(container, "#login-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const boton = Dom.$(form, 'button[type="submit"]');
      boton.disabled = true;
      const { correo, contrasena } = Dom.leerFormulario(form);
      const resultado = await AuthService.iniciarSesion(correo, contrasena);
      boton.disabled = false;
      if (!resultado.ok) {
        Dom.$(container, "#login-error").textContent = resultado.mensaje;
        return;
      }
      Dom.ir("#/dashboard");
    });

    Dom.onAction(container, "usar-demo", () => {
      Dom.$(container, "#correo").value = "demo@finantask.co";
      Dom.$(container, "#contrasena").value = "demo1234";
      form.requestSubmit();
    });
  },
};
