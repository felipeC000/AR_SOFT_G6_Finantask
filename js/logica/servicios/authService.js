// js/logica/servicios/authService.js
// CAPA DE LÓGICA
// Servicio de autenticación (RF01, RF02).
// IMPORTANTE: en esta fase la autenticación es simulada. No se guardan contraseñas;
// en el backend se usará Spring Security con hash de contraseñas y tokens JWT.

const AuthService = (() => {
  const CLAVE_SESION = "finantask:sesion";

  function leerSesion() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_SESION));
    } catch (e) {
      return null;
    }
  }

  function guardarSesion(usuario) {
    try {
      if (usuario) localStorage.setItem(CLAVE_SESION, JSON.stringify({ id: usuario.id }));
      else localStorage.removeItem(CLAVE_SESION);
    } catch (e) {
      /* sin almacenamiento disponible */
    }
  }

  let sesion = leerSesion();

  function iniciarSesion(correo, contrasena) {
    if (!correo || !contrasena) {
      return { ok: false, mensaje: "Correo y contraseña son obligatorios." };
    }
    const usuario = Almacen.listar("usuarios", (u) => u.correo === correo.toLowerCase())[0];
    if (!usuario) {
      // Mensaje general: no se dice si falló el correo o la contraseña (RF02)
      return { ok: false, mensaje: "Correo o contraseña incorrectos." };
    }
    sesion = { id: usuario.id };
    guardarSesion(usuario);
    return { ok: true, usuario };
  }

  function registrar(datos) {
    const errores = Reglas.validarRegistroUsuario(datos);
    const correo = (datos.correo || "").toLowerCase();
    if (Almacen.listar("usuarios", (u) => u.correo === correo).length > 0) {
      errores.push("Ya existe una cuenta con ese correo.");
    }
    if (errores.length) return { ok: false, errores };
    const usuario = Almacen.insertar("usuarios", {
      nombre: datos.nombre,
      correo,
      fechaRegistro: Fechas.hoyISO(),
    });
    return { ok: true, usuario };
  }

  function cerrarSesion() {
    sesion = null;
    guardarSesion(null);
  }

  function usuarioActual() {
    return sesion ? Almacen.obtener("usuarios", sesion.id) : null;
  }

  function estaAutenticado() {
    return usuarioActual() !== null;
  }

  return { iniciarSesion, registrar, cerrarSesion, usuarioActual, estaAutenticado };
})();
