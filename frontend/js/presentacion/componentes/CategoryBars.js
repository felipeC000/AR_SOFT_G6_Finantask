// js/presentacion/componentes/CategoryBars.js
// CAPA DE PRESENTACIÓN (UI)
// Gráfico de barras horizontal (solo HTML y CSS) con el total por categoría.

const CategoryBars = {
  html(porCategoria) {
    if (porCategoria.length === 0) return EmptyState.html("No hay obligaciones en este mes.");
    const max = Math.max(...porCategoria.map((c) => c.total));
    return `
      <ul class="bars" aria-label="Total por categoría">
        ${porCategoria.map((c) => `
          <li class="bar-row">
            <span class="bar-label">${Formato.escape(c.categoria)} <small>(${c.cantidad})</small></span>
            <span class="bar-track"><span class="bar-fill" style="width:${Math.max(3, (c.total / max) * 100)}%"></span></span>
            <span class="bar-value">${Formato.moneda(c.total)}</span>
          </li>`).join("")}
      </ul>`;
  },
};
