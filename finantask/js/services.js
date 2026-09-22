// js/services.js
// Capa de Servicios: comunica la interfaz con la logica de negocio y la gestion de datos

const Services = (() => {
  let usuarioActual = null;

  function iniciarSesion(correo, contrasena) {
    if (!correo || !contrasena) {
      return { ok: false, mensaje: "Correo y contrasena son obligatorios." };
    }
    // Autenticacion simulada: en esta fase no hay backend ni base de datos
    usuarioActual = { correo };
    return { ok: true };
  }

  function cerrarSesion() {
    usuarioActual = null;
  }

  function usuarioAutenticado() {
    return usuarioActual !== null;
  }

  function obtenerActividades() {
    const actividades = Data.listar();
    Logic.actualizarEstadosVencidos(actividades);
    return actividades;
  }

  function obtenerResumen() {
    return Logic.calcularResumen(obtenerActividades());
  }

  function obtenerProximosPagos() {
    return Logic.proximosPagos(obtenerActividades());
  }

  function crearActividad(datos) {
    const { valida, errores } = Logic.validarActividad(datos);
    if (!valida) return { ok: false, errores };
    const actividad = Data.crear({ ...datos, estado: "Pendiente" });
    return { ok: true, actividad };
  }

  function cambiarEstado(id, estado) {
    return Data.actualizar(id, { estado });
  }

  function eliminarActividad(id) {
    Data.eliminar(id);
  }

  return {
    iniciarSesion,
    cerrarSesion,
    usuarioAutenticado,
    obtenerActividades,
    obtenerResumen,
    obtenerProximosPagos,
    crearActividad,
    cambiarEstado,
    eliminarActividad,
  };
})();
