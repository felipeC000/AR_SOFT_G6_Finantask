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
      acciones: pagos.length ? `<button class="btn btn-secondary" data-action="reporte">Descargar reporte (PDF)</button>` : "",
      contenido: `<section class="panel">${PagosTable.html(pagos)}</section>`,
    });

    Dom.onAction(container, "reporte", async () => {
      const r = await IAService.descargarReporte();
      if (!r.ok) Toast.mostrar(r.mensaje, "error");
    });
  },
};
