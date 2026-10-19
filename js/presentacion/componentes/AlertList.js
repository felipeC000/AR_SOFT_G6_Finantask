// js/presentacion/componentes/AlertList.js
// CAPA DE PRESENTACIÓN (UI)
// Lista de obligaciones con su tiempo restante. Se usa para las alertas (RF11)
// y para los próximos pagos del panel principal.

const AlertList = {
  html(items, { vacio = "No hay nada por aquí.", tipo = "alerta" } = {}) {
    if (items.length === 0) return EmptyState.html(vacio);
    return `
      <ul class="alert-list alert-list--${tipo}">
        ${items.map((o) => `
          <li class="alert-item ${o.diasRestantes < 0 ? "is-overdue" : ""}">
            <a href="#/obligaciones/${o.id}" class="alert-link">
              <span class="alert-main">
                <span class="alert-name">${Formato.escape(o.nombre)}</span>
                <span class="alert-meta">${Formato.escape(o.categoria)} · ${Formato.fecha(o.fechaLimite)}</span>
              </span>
              <span class="alert-days">${Formato.diasRestantes(o.diasRestantes)}</span>
              <span class="alert-value">${Formato.moneda(o.valor)}</span>
            </a>
          </li>`).join("")}
      </ul>`;
  },
};
