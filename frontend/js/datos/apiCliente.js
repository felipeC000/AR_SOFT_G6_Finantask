// js/datos/apiCliente.js
// CAPA DE DATOS (frontend)
// Único lugar del frontend que se comunica con el backend (API REST en PHP).
// Todo error (sin conexión, base de datos caída, validación) llega a las capas
// superiores como un ErrorApi con un mensaje claro para el usuario.

class ErrorApi extends Error {
  // estado: código HTTP (0 = no hubo respuesta del servidor); errores: lista de mensajes de validación
  constructor(mensaje, { estado = 0, errores = [] } = {}) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
    this.errores = errores;
  }
}

const ApiCliente = (() => {
  const MSG_SIN_CONEXION =
    "No se pudo conectar con el servidor. Verifica que Apache y MySQL estén iniciados e inténtalo de nuevo.";

  async function pedir(metodo, ruta, cuerpo) {
    let respuesta;
    try {
      respuesta = await fetch(CONFIG.API_URL + ruta, {
        method: metodo,
        credentials: "same-origin",
        headers: cuerpo !== undefined ? { "Content-Type": "application/json" } : {},
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      });
    } catch (e) {
      throw new ErrorApi(MSG_SIN_CONEXION, { estado: 0 });
    }

    let datos = null;
    try {
      datos = await respuesta.json();
    } catch (e) {
      datos = null; // 204 sin cuerpo, o el servidor no devolvió JSON
    }

    if (!respuesta.ok) {
      const mensaje = datos && datos.error ? datos.error : "El servidor respondió con un error inesperado.";
      const error = new ErrorApi(mensaje, { estado: respuesta.status, errores: (datos && datos.errores) || [] });
      // Sesión vencida en medio del uso: se avisa para volver al inicio de sesión
      if (respuesta.status === 401 && !ruta.startsWith("/auth/") && ApiCliente.alSesionExpirada) {
        ApiCliente.alSesionExpirada();
      }
      throw error;
    }
    return datos;
  }

  return {
    alSesionExpirada: null, // la asigna el enrutador al arrancar
    get: (ruta) => pedir("GET", ruta),
    post: (ruta, cuerpo = {}) => pedir("POST", ruta, cuerpo),
    put: (ruta, cuerpo = {}) => pedir("PUT", ruta, cuerpo),
    eliminar: (ruta) => pedir("DELETE", ruta),
  };
})();
