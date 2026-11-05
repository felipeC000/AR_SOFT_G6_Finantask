// js/presentacion/paginas/RegistroPage.js
// CAPA DE PRESENTACIÓN (UI)
// Pantalla de registro de cuenta (RF01).

const RegistroPage = {
  render(container) {
    document.title = "Crear cuenta · FinanTask";
    container.innerHTML = AuthLayout.html(`
      <h1>Empieza en un minuto</h1>
      <p class="auth-sub">Solo necesitas tu nombre, un correo y una contraseña.</p>
      <form id="registro-form" novalidate>
        <div class="field">
          <label for="nombre">Nombre</label>
          <input type="text" id="nombre" name="nombre" autocomplete="name" required />
        </div>
        <div class="field">
          <label for="correo">Correo</label>
          <input type="email" id="correo" name="correo" autocomplete="email" required />
        </div>
        <div class="field">
          <label for="contrasena">Contraseña</label>
          <input type="password" id="contrasena" name="contrasena" autocomplete="new-password" minlength="8" required />
          <small class="hint">Mínimo 8 caracteres.</small>
        </div>
        <div class="field">
          <label for="confirmar">Confirmar contraseña</label>
          <input type="password" id="confirmar" name="confirmar" autocomplete="new-password" required />
        </div>
        ${FormErrors.html()}
        <button type="submit" class="btn btn-primary btn-block">Crear cuenta</button>
      </form>
      <p class="auth-switch">¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a></p>
    `);

    const form = Dom.$(container, "#registro-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await Dom.enviar(form, async () => {
        const resultado = await AuthService.registrar(Dom.leerFormulario(form));
        if (resultado.ok) {
          Toast.mostrar("Cuenta creada. ¡Bienvenido!");
          Dom.ir("#/dashboard");
        }
        return resultado;
      });
    });
  },
};
