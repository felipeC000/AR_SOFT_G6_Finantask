// js/presentacion/componentes/EmptyState.js
// CAPA DE PRESENTACIÓN (UI)
// Mensaje que se muestra cuando una lista no tiene elementos.

const EmptyState = {
  html(mensaje, accion = "") {
    return `<div class="empty-state"><p>${mensaje}</p>${accion}</div>`;
  },
};
