// js/logica/servicios/authService.js
// CAPA DE LÓGICA
// Registro e inicio de sesión (RF01, RF02). La validación definitiva y el manejo de
// contraseñas los hace el backend; aquí solo se revisa lo básico antes de enviar.
// El usuario de la sesión se recuerda en memoria para que la interfaz lo consulte sin pedirlo cada vez.

const AuthService = (() => {
  let usuario = null;

  function comoResultado(error) {
    const errores = error.errores && error.errores.length ? error.errores : [error.message];
    return { ok: false, errores, mensaje: error.message };
  }

  // Al abrir la aplicación: ¿el servidor todavía tiene una sesión activa?
  async function restaurar() {
    try {
      usuario = (await ApiCliente.get("/auth/yo")).usuario;
    } catch (e) {
      usuario = null;
      // Sin sesión (401) es normal; sin conexión o base de datos caída se informa al usuario
      if (!(e instanceof ErrorApi) || e.estado !== 401) throw e;
    }
    return usuario;
  }

  async function iniciarSesion(correo, contrasena) {
    if (!correo || !contrasena) return { ok: false, mensaje: "Escribe tu correo y tu contraseña." };
    try {
      usuario = (await ApiCliente.post("/auth/login", { correo, contrasena })).usuario;
      return { ok: true };
    } catch (e) {
      if (e instanceof ErrorApi) return comoResultado(e);
      throw e;
    }
  }

  // RF01: crea la cuenta y deja la sesión iniciada
  async function registrar(datos) {
    const errores = Reglas.validarRegistroUsuario(datos);
    if (errores.length) return { ok: false, errores };
    try {
      usuario = (await ApiCliente.post("/auth/registro", datos)).usuario;
      return { ok: true };
    } catch (e) {
      if (e instanceof ErrorApi) return comoResultado(e);
      throw e;
    }
  }

  async function cerrarSesion() {
    try {
      await ApiCliente.post("/auth/logout");
    } catch (e) {
      // aunque el servidor no responda, la sesión local se cierra igual
    }
    usuario = null;
  }

  function limpiar() {
    usuario = null;
  }

  function usuarioActual() {
    return usuario;
  }

  function estaAutenticado() {
    return usuario !== null;
  }

  return { restaurar, iniciarSesion, registrar, cerrarSesion, limpiar, usuarioActual, estaAutenticado };
})();
