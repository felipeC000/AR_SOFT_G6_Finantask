// js/presentacion/componentes/Badge.js
// CAPA DE PRESENTACIÓN (UI)
// Etiqueta de color para el estado y la prioridad de una obligación.

const Badge = {
  estado(estado) {
    const texto = Reglas.ESTADOS[estado] || estado;
    return `<span class="badge badge--estado-${estado.toLowerCase()}">${texto}</span>`;
  },

  prioridad(prioridad) {
    const texto = Reglas.PRIORIDADES[prioridad] || prioridad;
    return `<span class="badge badge--prioridad-${prioridad.toLowerCase()}">${texto}</span>`;
  },

  origen(origen) {
    return origen === "ASISTENTE_IA" ? `<span class="badge badge--ia">Asistente IA</span>` : "";
  },
};
