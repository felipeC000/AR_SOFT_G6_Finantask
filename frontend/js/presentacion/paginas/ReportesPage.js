// js/presentacion/paginas/ReportesPage.js
// CAPA DE PRESENTACIÓN (UI)
// Resumen mensual por estado y por categoría (RF12).

const ReportesPage = (() => {
  let mesSeleccionado = null;

  async function render(container) {
    const datos = await ResumenService.mensual(mesSeleccionado);
    const { meses, resumen: r } = datos;
    mesSeleccionado = datos.mes;

    Layout.render(container, {
      activo: "reportes",
      titulo: "Resumen mensual",
      subtitulo: "Obligaciones con fecha límite en el mes seleccionado.",
      acciones: `
        <label class="inline-field" for="mes">Mes
          <select id="mes">
            ${meses.map((m) => `<option value="${m}" ${m === mesSeleccionado ? "selected" : ""}>${Formato.mes(m)}</option>`).join("")}
          </select>
        </label>`,
      contenido: `
        ${StatCard.fila([
          { etiqueta: "Total del mes", valor: Formato.moneda(r.totalPendiente + r.totalVencido + r.totalPagado), detalle: `${r.cantidad} obligación(es)` },
          { etiqueta: "Pagado", valor: Formato.moneda(r.totalPagado), detalle: `${r.cantidadPagadas} pagada(s)`, variante: "ok" },
          { etiqueta: "Pendiente", valor: Formato.moneda(r.totalPendiente), detalle: `${r.cantidadPendientes} pendiente(s)` },
          { etiqueta: "Vencido", valor: Formato.moneda(r.totalVencido), detalle: `${r.cantidadVencidas} vencida(s)`, variante: r.cantidadVencidas ? "alerta" : "normal" },
        ])}
        <section class="panel">
          <div class="panel-head"><h2>${Iconos.reporte} Por categoría</h2></div>
          ${CategoryBars.html(r.porCategoria)}
        </section>
      `,
    });

    Dom.$(container, "#mes").addEventListener("change", async (e) => {
      mesSeleccionado = e.target.value;
      try {
        await render(container);
      } catch (error) {
        ErrorPage.render(container, error);
      }
    });
  }

  return { render };
})();
