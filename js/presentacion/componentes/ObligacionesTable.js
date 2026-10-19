// js/presentacion/componentes/ObligacionesTable.js
// CAPA DE PRESENTACIÓN (UI)
// Tabla de obligaciones con acciones por fila (ver, editar, pagar, eliminar).
// La tabla solo dibuja; las acciones las resuelve la pantalla que la usa.

const ObligacionesTable = {
  html(obligaciones) {
    if (obligaciones.length === 0) {
      return EmptyState.html("No hay obligaciones que coincidan con los filtros.",
        `<a href="#/obligaciones/nueva" class="btn btn-secondary">Registrar una obligación</a>`);
    }
    return `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th><th>Categoría</th><th class="num">Valor</th><th>Fecha límite</th>
              <th>Prioridad</th><th>Estado</th><th><span class="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            ${obligaciones.map((o) => ObligacionesTable.fila(o)).join("")}
          </tbody>
        </table>
      </div>`;
  },

  fila(o) {
    const pagada = o.estado === "PAGADA";
    return `
      <tr>
        <td><a href="#/obligaciones/${o.id}" class="row-title">${Formato.escape(o.nombre)}</a> ${Badge.origen(o.origen)}</td>
        <td>${Formato.escape(o.categoria)}</td>
        <td class="num">${Formato.moneda(o.valor)}</td>
        <td>${Formato.fecha(o.fechaLimite)}</td>
        <td>${Badge.prioridad(o.prioridad)}</td>
        <td>${Badge.estado(o.estado)}</td>
        <td class="actions-cell">
          ${pagada ? "" : `<a class="icon-btn" href="#/obligaciones/${o.id}" title="Registrar pago" aria-label="Registrar pago de ${Formato.escape(o.nombre)}">${Iconos.check}</a>`}
          ${pagada ? "" : `<a class="icon-btn" href="#/obligaciones/${o.id}/editar" title="Editar" aria-label="Editar ${Formato.escape(o.nombre)}">${Iconos.editar}</a>`}
          <button class="icon-btn icon-btn--danger" data-action="eliminar" data-id="${o.id}" title="Eliminar" aria-label="Eliminar ${Formato.escape(o.nombre)}">${Iconos.papelera}</button>
        </td>
      </tr>`;
  },
};
