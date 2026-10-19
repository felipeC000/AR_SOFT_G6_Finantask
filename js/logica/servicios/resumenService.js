// js/logica/servicios/resumenService.js
// CAPA DE LÓGICA
// Servicio de resúmenes y alertas (RF11, RF12). Equivale a ResumenService del diagrama de clases.

const ResumenService = {
  general() {
    return Reglas.calcularResumen(ObligacionService.listar());
  },

  // RF11: vencidas y las que vencen en los próximos días
  alertas() {
    return Reglas.alertas(ObligacionService.listar());
  },

  proximos(dias = 30) {
    return Reglas.proximos(ObligacionService.listar(), dias);
  },

  // RF12: resumen de un mes ("AAAA-MM")
  mensual(claveMes) {
    return Reglas.resumenMensual(ObligacionService.listar(), ObligacionService.categorias(), claveMes);
  },

  // Meses que tienen obligaciones, para el selector del reporte
  mesesDisponibles() {
    const meses = new Set(ObligacionService.listar().map((o) => o.fechaLimite.slice(0, 7)));
    meses.add(Fechas.mesActual());
    return [...meses].sort().reverse();
  },
};
