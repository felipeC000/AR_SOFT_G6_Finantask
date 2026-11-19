// js/logica/servicios/iaService.js
// CAPA DE LÓGICA
// Servicio de inteligencia artificial: sugiere la prioridad de una obligación.
// Pide la sugerencia al backend (POST /ia/prioridad), que a su vez consulta el modelo de
// TensorFlow que corre en servicio_inteligente/. El navegador nunca habla con el modelo directamente.
// Devuelve { ok, sugerencia } o { ok: false, mensaje } (incluye el caso "servicio de IA apagado").

const IAService = {
  async sugerirPrioridad({ valor, fechaLimite }) {
    if (!valor || Number(valor) <= 0) return { ok: false, mensaje: "Escribe un valor mayor que 0 para sugerir la prioridad." };
    if (!fechaLimite) return { ok: false, mensaje: "Elige la fecha límite para sugerir la prioridad." };
    try {
      const sugerencia = await ApiCliente.post("/ia/prioridad", { valor, fechaLimite });
      return { ok: true, sugerencia };
    } catch (e) {
      if (e instanceof ErrorApi) return { ok: false, mensaje: e.message };
      throw e;
    }
  },

  // Comprobante de pago (PDF) de una obligación y reporte de todos los pagos. El backend envía los datos en JSON
  // al servicio de IA (POST /generar-pdf), que devuelve el PDF; aquí solo se descarga.
  async descargarComprobante(idObligacion) {
    return IAService._descargar(`/obligaciones/${idObligacion}/comprobante`, `comprobante-${idObligacion}.pdf`);
  },

  async descargarReporte() {
    return IAService._descargar("/pagos/reporte", "reporte-pagos.pdf");
  },

  async _descargar(ruta, nombre) {
    try {
      await ApiCliente.descargar(ruta, nombre);
      return { ok: true };
    } catch (e) {
      if (e instanceof ErrorApi) return { ok: false, mensaje: e.message };
      throw e;
    }
  },

  // Ficha del modelo (versión, métricas, limitaciones)
  async estado() {
    try {
      return { ok: true, ...(await ApiCliente.get("/ia/estado")) };
    } catch (e) {
      if (e instanceof ErrorApi) return { ok: false, mensaje: e.message };
      throw e;
    }
  },
};
