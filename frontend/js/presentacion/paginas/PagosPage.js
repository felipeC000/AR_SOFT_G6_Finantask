// js/presentacion/paginas/PagosPage.js
// CAPA DE PRESENTACIÓN (UI)
// Historial de pagos del usuario (RF10).

const PagosPage = {
  async render(container) {
    const pagos = await ObligacionService.historialPagos();
    Layout.render(container, {
      activo: "pagos",
      titulo: "Historial de pagos",
      subtitulo: `${pagos.length} pago(s) registrado(s).`,
      contenido: `<section class="panel">${PagosTable.html(pagos)}</section>`,
    });
  },
};
