// js/logica/servicios/resumenService.js
// CAPA DE LÓGICA
// Servicio de resúmenes y alertas (RF11, RF12). Equivale a ResumenService del diagrama de clases.
// Pide las obligaciones una sola vez y calcula los indicadores con las reglas de Reglas.

const ResumenService = {
  // Todo lo que necesita la pantalla principal con una sola consulta (RF11)
  async tablero() {
    const lista = await ObligacionService.listar();
    return {
      resumen: Reglas.calcularResumen(lista),
      alertas: Reglas.alertas(lista),
      proximos: Reglas.proximos(lista, 30),
    };
  },

  // RF12: resumen de un mes ("AAAA-MM") y meses disponibles para el selector
  async mensual(claveMes) {
    const [lista, categorias] = await Promise.all([ObligacionService.listar(), ObligacionService.categorias()]);
    const meses = new Set(lista.map((o) => o.fechaLimite.slice(0, 7)));
    meses.add(Fechas.mesActual());
    const disponibles = [...meses].sort().reverse();
    const mes = disponibles.includes(claveMes) ? claveMes : Fechas.mesActual();
    return { meses: disponibles, mes, resumen: Reglas.resumenMensual(lista, categorias, mes) };
  },
};
