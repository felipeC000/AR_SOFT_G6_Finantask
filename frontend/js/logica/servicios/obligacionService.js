// js/logica/servicios/obligacionService.js
// CAPA DE LÓGICA
// Casos de uso sobre obligaciones y pagos (RF03 a RF10). Equivale a ObligacionService del diagrama de clases.
// Las reglas de negocio (estados, validación final, eliminación, transacción del pago) las aplica
// el backend; este servicio valida lo básico para dar respuesta inmediata y llama a la API.
//
// Las operaciones que escriben devuelven { ok, ... }: si el servidor rechaza los datos o no hay
// conexión, el resultado trae los mensajes para mostrarlos en el formulario.

const ObligacionService = (() => {
  let categoriasEnMemoria = null; // las categorías casi no cambian: se piden una sola vez

  async function escribir(operacion) {
    try {
      return await operacion();
    } catch (e) {
      if (e instanceof ErrorApi) {
        return { ok: false, errores: e.errores.length ? e.errores : [e.message], mensaje: e.message };
      }
      throw e;
    }
  }

  async function categorias() {
    if (!categoriasEnMemoria) categoriasEnMemoria = await ApiCliente.get("/categorias");
    return categoriasEnMemoria;
  }

  // RF04: consulta con filtros y orden
  async function listar(filtros = {}, orden = "fecha") {
    const todas = await ApiCliente.get("/obligaciones");
    return Reglas.ordenar(Reglas.filtrar(todas, filtros), orden);
  }

  async function obtener(id) {
    try {
      return await ApiCliente.get(`/obligaciones/${encodeURIComponent(id)}`);
    } catch (e) {
      if (e instanceof ErrorApi && e.estado === 404) return null;
      throw e;
    }
  }

  // RF03 + RF07
  async function crear(datos) {
    const errores = Reglas.validarObligacion(datos);
    if (errores.length) return { ok: false, errores };
    return escribir(async () => {
      const r = await ApiCliente.post("/obligaciones", datos);
      return { ok: true, obligacion: r.obligacion };
    });
  }

  // RF05
  async function actualizar(id, datos) {
    const errores = Reglas.validarObligacion(datos);
    if (errores.length) return { ok: false, errores };
    return escribir(async () => {
      const r = await ApiCliente.put(`/obligaciones/${encodeURIComponent(id)}`, datos);
      return { ok: true, obligacion: r.obligacion };
    });
  }

  // RF06: el backend no permite eliminar si ya hay pagos registrados
  async function eliminar(id) {
    return escribir(async () => {
      await ApiCliente.eliminar(`/obligaciones/${encodeURIComponent(id)}`);
      return { ok: true };
    });
  }

  // RF10: historial de pagos (de todas las obligaciones o de una)
  async function historialPagos(idObligacion = null) {
    const consulta = idObligacion ? `?idObligacion=${encodeURIComponent(idObligacion)}` : "";
    return ApiCliente.get("/pagos" + consulta);
  }

  // RF08: el backend guarda el pago y cambia el estado en una sola transacción
  async function registrarPago(id, datos) {
    const errores = Reglas.validarPago(datos);
    if (errores.length) return { ok: false, errores };
    return escribir(async () => {
      const r = await ApiCliente.post(`/obligaciones/${encodeURIComponent(id)}/pagos`, datos);
      return { ok: true, pago: r.pago, obligacion: r.obligacion };
    });
  }

  return { categorias, listar, obtener, crear, actualizar, eliminar, historialPagos, registrarPago };
})();
