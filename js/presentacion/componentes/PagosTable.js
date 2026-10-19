// js/presentacion/componentes/PagosTable.js
// CAPA DE PRESENTACIÓN (UI)
// Tabla del historial de pagos (RF10).

const PagosTable = {
  html(pagos, { mostrarObligacion = true } = {}) {
    if (pagos.length === 0) return EmptyState.html("Todavía no hay pagos registrados.");
    const total = pagos.reduce((s, p) => s + Number(p.valorPagado), 0);
    return `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha de pago</th>
              ${mostrarObligacion ? "<th>Obligación</th><th>Categoría</th>" : ""}
              <th class="num">Valor pagado</th>
            </tr>
          </thead>
          <tbody>
            ${pagos.map((p) => `
              <tr>
                <td>${Formato.fecha(p.fechaPago)}</td>
                ${mostrarObligacion ? `
                  <td><a href="#/obligaciones/${p.idObligacion}" class="row-title">${Formato.escape(p.obligacion.nombre)}</a></td>
                  <td>${Formato.escape(p.obligacion.categoria)}</td>` : ""}
                <td class="num">${Formato.moneda(p.valorPagado)}</td>
              </tr>`).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="${mostrarObligacion ? 3 : 1}">Total</td>
              <td class="num">${Formato.moneda(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>`;
  },
};
