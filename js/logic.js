// js/logic.js
// Capa de Logica de Negocio: reglas del sistema

const Logic = (() => {
  function validarActividad({ nombre, valor, fechaLimite }) {
    const errores = [];
    if (!nombre || nombre.trim().length === 0) errores.push("El nombre es obligatorio.");
    if (!valor || Number(valor) <= 0) errores.push("El valor debe ser mayor a 0.");
    if (!fechaLimite) errores.push("La fecha limite es obligatoria.");
    return { valida: errores.length === 0, errores };
  }

  function estaVencida(actividad) {
    if (actividad.estado === "Pagado") return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(actividad.fechaLimite);
    return limite < hoy;
  }

  // Regla: si la fecha limite ya paso y sigue pendiente, pasa a "Vencido"
  function actualizarEstadosVencidos(actividades) {
    actividades.forEach((a) => {
      if (a.estado === "Pendiente" && estaVencida(a)) {
        a.estado = "Vencido";
      }
    });
  }

  function calcularResumen(actividades) {
    const totalPendiente = actividades
      .filter((a) => a.estado === "Pendiente" || a.estado === "Vencido")
      .reduce((sum, a) => sum + Number(a.valor), 0);
    const totalPagado = actividades
      .filter((a) => a.estado === "Pagado")
      .reduce((sum, a) => sum + Number(a.valor), 0);
    const vencidas = actividades.filter((a) => a.estado === "Vencido").length;
    return { totalPendiente, totalPagado, vencidas };
  }

  function proximosPagos(actividades, dias = 10) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return actividades
      .filter((a) => a.estado !== "Pagado")
      .map((a) => {
        const limite = new Date(a.fechaLimite);
        const diff = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));
        return { ...a, diasRestantes: diff };
      })
      .filter((a) => a.diasRestantes <= dias)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }

  return { validarActividad, estaVencida, actualizarEstadosVencidos, calcularResumen, proximosPagos };
})();
