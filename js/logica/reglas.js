// js/logica/reglas.js
// CAPA DE LÓGICA
// Capa de lógica de negocio: reglas del sistema que no dependen de la pantalla
// ni de dónde se guardan los datos. Corresponde a lo que en el backend harán
// las entidades y los servicios de dominio.

const Reglas = (() => {
  const ESTADOS = { PENDIENTE: "Pendiente", PAGADA: "Pagada", VENCIDA: "Vencida" };
  const PRIORIDADES = { ALTA: "Alta", MEDIA: "Media", BAJA: "Baja" };
  const PESO_PRIORIDAD = { ALTA: 0, MEDIA: 1, BAJA: 2 };
  const DIAS_ALERTA = 3; // RF11: alertas para lo que vence en los próximos 3 días

  // ---------- Validaciones
  function validarObligacion(datos) {
    const errores = [];
    if (!datos.nombre) errores.push("El nombre es obligatorio.");
    else if (datos.nombre.length > 100) errores.push("El nombre no puede tener más de 100 caracteres.");
    if (!datos.idCategoria) errores.push("Selecciona una categoría.");
    const valor = Number(datos.valor);
    if (!datos.valor || Number.isNaN(valor) || valor <= 0) errores.push("El valor debe ser mayor que 0.");
    if (!datos.fechaLimite) errores.push("La fecha límite es obligatoria.");
    if (!PRIORIDADES[datos.prioridad]) errores.push("Selecciona una prioridad válida.");
    return errores;
  }

  function validarPago(datos, obligacion) {
    const errores = [];
    if (!obligacion) errores.push("La obligación no existe.");
    else if (obligacion.estado === "PAGADA") errores.push("Esta obligación ya está pagada.");
    const valor = Number(datos.valorPagado);
    if (!datos.valorPagado || Number.isNaN(valor) || valor <= 0) errores.push("El valor pagado debe ser mayor que 0.");
    if (!datos.fechaPago) errores.push("La fecha de pago es obligatoria.");
    else if (datos.fechaPago > Fechas.hoyISO()) errores.push("La fecha de pago no puede ser futura.");
    return errores;
  }

  function validarRegistroUsuario(datos) {
    const errores = [];
    if (!datos.nombre) errores.push("El nombre es obligatorio.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo || "")) errores.push("Escribe un correo válido.");
    if (!datos.contrasena || datos.contrasena.length < 8) errores.push("La contraseña debe tener mínimo 8 caracteres.");
    if (datos.contrasena !== datos.confirmar) errores.push("Las contraseñas no coinciden.");
    return errores;
  }

  // ---------- Estados (ver diagrama de estados del documento maestro)
  function estaVencida(obligacion, hoyISO = Fechas.hoyISO()) {
    return obligacion.estado !== "PAGADA" && obligacion.fechaLimite < hoyISO;
  }

  // RF09: las pendientes con fecha límite superada pasan a VENCIDA
  function obligacionesPorVencer(obligaciones) {
    return obligaciones.filter((o) => o.estado === "PENDIENTE" && estaVencida(o));
  }

  function puedeEliminarse(obligacion, pagos) {
    return !pagos.some((p) => p.idObligacion === obligacion.id);
  }

  function diasParaVencer(obligacion) {
    return Fechas.diasEntre(Fechas.hoyISO(), obligacion.fechaLimite);
  }

  // ---------- Consultas
  function filtrar(obligaciones, filtros = {}) {
    return obligaciones.filter((o) => {
      if (filtros.estado && o.estado !== filtros.estado) return false;
      if (filtros.idCategoria && o.idCategoria !== Number(filtros.idCategoria)) return false;
      if (filtros.prioridad && o.prioridad !== filtros.prioridad) return false;
      if (filtros.desde && o.fechaLimite < filtros.desde) return false;
      if (filtros.hasta && o.fechaLimite > filtros.hasta) return false;
      if (filtros.texto && !o.nombre.toLowerCase().includes(filtros.texto.toLowerCase())) return false;
      return true;
    });
  }

  function ordenar(obligaciones, criterio = "fecha") {
    const copia = [...obligaciones];
    if (criterio === "prioridad") {
      copia.sort((a, b) => PESO_PRIORIDAD[a.prioridad] - PESO_PRIORIDAD[b.prioridad] || a.fechaLimite.localeCompare(b.fechaLimite));
    } else if (criterio === "valor") {
      copia.sort((a, b) => b.valor - a.valor);
    } else {
      copia.sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite));
    }
    return copia;
  }

  // ---------- Resúmenes
  function calcularResumen(obligaciones) {
    const suma = (lista) => lista.reduce((s, o) => s + Number(o.valor), 0);
    const pendientes = obligaciones.filter((o) => o.estado === "PENDIENTE");
    const vencidas = obligaciones.filter((o) => o.estado === "VENCIDA");
    const pagadas = obligaciones.filter((o) => o.estado === "PAGADA");
    return {
      totalPendiente: suma(pendientes),
      totalVencido: suma(vencidas),
      totalPagado: suma(pagadas),
      cantidadPendientes: pendientes.length,
      cantidadVencidas: vencidas.length,
      cantidadPagadas: pagadas.length,
    };
  }

  function alertas(obligaciones) {
    return obligaciones
      .filter((o) => o.estado !== "PAGADA")
      .map((o) => ({ ...o, diasRestantes: diasParaVencer(o) }))
      .filter((o) => o.diasRestantes <= DIAS_ALERTA)
      .sort((a, b) => a.diasRestantes - b.diasRestantes || PESO_PRIORIDAD[a.prioridad] - PESO_PRIORIDAD[b.prioridad]);
  }

  function proximos(obligaciones, dias = 30) {
    return obligaciones
      .filter((o) => o.estado === "PENDIENTE")
      .map((o) => ({ ...o, diasRestantes: diasParaVencer(o) }))
      .filter((o) => o.diasRestantes > DIAS_ALERTA && o.diasRestantes <= dias)
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }

  // RF12: totales del mes por estado y por categoría
  function resumenMensual(obligaciones, categorias, claveMes) {
    const delMes = obligaciones.filter((o) => o.fechaLimite.startsWith(claveMes));
    const porCategoria = categorias
      .map((c) => {
        const lista = delMes.filter((o) => o.idCategoria === c.id);
        return { categoria: c.nombre, total: lista.reduce((s, o) => s + Number(o.valor), 0), cantidad: lista.length };
      })
      .filter((c) => c.cantidad > 0)
      .sort((a, b) => b.total - a.total);
    return { ...calcularResumen(delMes), porCategoria, cantidad: delMes.length };
  }

  return {
    ESTADOS, PRIORIDADES, DIAS_ALERTA,
    validarObligacion, validarPago, validarRegistroUsuario,
    estaVencida, obligacionesPorVencer, puedeEliminarse, diasParaVencer,
    filtrar, ordenar, calcularResumen, alertas, proximos, resumenMensual,
  };
})();
