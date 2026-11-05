// js/presentacion/componentes/StatCard.js
// CAPA DE PRESENTACIÓN (UI)
// Tarjeta informativa con un indicador (total pendiente, pagado, vencido...).

const StatCard = {
  // variante: "normal" | "alerta" | "ok"
  html({ etiqueta, valor, detalle = "", variante = "normal" }) {
    return `
      <article class="stat-card stat-card--${variante}">
        <span class="stat-label">${etiqueta}</span>
        <span class="stat-value">${valor}</span>
        ${detalle ? `<span class="stat-detail">${detalle}</span>` : ""}
      </article>`;
  },

  fila(tarjetas) {
    return `<section class="stat-row">${tarjetas.map((t) => StatCard.html(t)).join("")}</section>`;
  },
};
