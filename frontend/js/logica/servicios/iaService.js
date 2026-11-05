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
