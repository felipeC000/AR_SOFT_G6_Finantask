// js/logica/servicios/obligacionService.js
// CAPA DE LÓGICA
// Servicio de obligaciones (RF03 a RF10).
// Une las pantallas con las reglas de negocio y el acceso a datos. Es el equivalente
// en el frontend de ObligacionService del diagrama de clases.

const ObligacionService = (() => {
  function idUsuario() {
    const u = AuthService.usuarioActual();
    if (!u) throw new Error("No hay una sesión activa.");
    return u.id;
  }

  // RF09: antes de cada consulta se actualizan las obligaciones vencidas.
  // En el backend esto lo hará una tarea programada diaria.
  function actualizarVencidas() {
    const propias = Almacen.listar("obligaciones", (o) => o.idUsuario === idUsuario());
    Reglas.obligacionesPorVencer(propias).forEach((o) => {
      Almacen.actualizar("obligaciones", o.id, { estado: "VENCIDA", fechaActualizacion: Fechas.hoyISO() });
    });
  }

  function conCategoria(obligacion) {
    const cat = Almacen.obtener("categorias", obligacion.idCategoria);
    return { ...obligacion, categoria: cat ? cat.nombre : "Sin categoría" };
  }

  function categorias() {
    return Almacen.listar("categorias");
  }

  // RF04: consultar con filtros y orden
  function listar(filtros = {}, orden = "fecha") {
    actualizarVencidas();
    const propias = Almacen.listar("obligaciones", (o) => o.idUsuario === idUsuario());
    return Reglas.ordenar(Reglas.filtrar(propias, filtros), orden).map(conCategoria);
  }

  function obtener(id) {
    actualizarVencidas();
    const o = Almacen.obtener("obligaciones", id);
    // Cada usuario solo puede ver sus propias obligaciones (RNF01)
    if (!o || o.idUsuario !== idUsuario()) return null;
    return conCategoria(o);
  }

  function normalizar(datos) {
    return {
      nombre: datos.nombre,
      descripcion: datos.descripcion || "",
      idCategoria: Number(datos.idCategoria),
      valor: Math.round(Number(datos.valor) * 100) / 100,
      fechaLimite: datos.fechaLimite,
      prioridad: datos.prioridad || "MEDIA", // RF07: prioridad media por defecto
    };
  }

  // RF03
  function crear(datos) {
    const errores = Reglas.validarObligacion({ prioridad: "MEDIA", ...datos });
    if (errores.length) return { ok: false, errores };
    const hoy = Fechas.hoyISO();
    const nueva = Almacen.insertar("obligaciones", {
      ...normalizar(datos),
      idUsuario: idUsuario(),
      estado: "PENDIENTE",
      origen: datos.origen === "ASISTENTE_IA" ? "ASISTENTE_IA" : "MANUAL",
      fechaCreacion: hoy,
      fechaActualizacion: hoy,
    });
    actualizarVencidas();
    return { ok: true, obligacion: nueva };
  }

  // RF05
  function actualizar(id, datos) {
    const actual = obtener(id);
    if (!actual) return { ok: false, errores: ["La obligación no existe."] };
    if (actual.estado === "PAGADA") return { ok: false, errores: ["Una obligación pagada no se puede editar."] };
    const errores = Reglas.validarObligacion(datos);
    if (errores.length) return { ok: false, errores };
    const cambios = { ...normalizar(datos), fechaActualizacion: Fechas.hoyISO() };
    // Si se corrige la fecha a una futura, vuelve a quedar pendiente
    if (actual.estado === "VENCIDA" && cambios.fechaLimite >= Fechas.hoyISO()) cambios.estado = "PENDIENTE";
    Almacen.actualizar("obligaciones", id, cambios);
    actualizarVencidas();
    return { ok: true };
  }

  // RF06: no se eliminan obligaciones con pagos, para no perder el historial
  function eliminar(id) {
    const actual = obtener(id);
    if (!actual) return { ok: false, mensaje: "La obligación no existe." };
    const pagos = Almacen.listar("pagos", (p) => p.idObligacion === actual.id);
    if (!Reglas.puedeEliminarse(actual, pagos)) {
      return { ok: false, mensaje: "No se puede eliminar porque ya tiene pagos registrados." };
    }
    Almacen.eliminar("obligaciones", id);
    return { ok: true };
  }

  // RF08: registrar el pago y cambiar el estado en una sola transacción
  function registrarPago(id, datos) {
    const obligacion = obtener(id);
    const errores = Reglas.validarPago(datos, obligacion);
    if (errores.length) return { ok: false, errores };
    try {
      const pago = Almacen.transaccion(() => {
        const nuevo = Almacen.insertar("pagos", {
          idObligacion: obligacion.id,
          fechaPago: datos.fechaPago,
          valorPagado: Number(datos.valorPagado),
        });
        const ok = Almacen.actualizar("obligaciones", obligacion.id, { estado: "PAGADA", fechaActualizacion: Fechas.hoyISO() });
        if (!ok) throw new Error("No se pudo actualizar el estado.");
        return nuevo;
      });
      return { ok: true, pago };
    } catch (e) {
      return { ok: false, errores: ["No se pudo registrar el pago. No se guardó ningún cambio."] };
    }
  }

  // RF10: historial de pagos del usuario (opcionalmente de una sola obligación)
  function historialPagos(idObligacion = null) {
    const propias = listar();
    const porId = new Map(propias.map((o) => [o.id, o]));
    return Almacen.listar("pagos", (p) => porId.has(p.idObligacion) && (!idObligacion || p.idObligacion === Number(idObligacion)))
      .map((p) => ({ ...p, obligacion: porId.get(p.idObligacion) }))
      .sort((a, b) => b.fechaPago.localeCompare(a.fechaPago));
  }

  return { categorias, listar, obtener, crear, actualizar, eliminar, registrarPago, historialPagos };
})();
