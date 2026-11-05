// js/presentacion/componentes/PageHeader.js
// CAPA DE PRESENTACIÓN (UI)
// Encabezado de cada pantalla: título, subtítulo y botones de acción a la derecha.

const PageHeader = {
  html(titulo, subtitulo = "", acciones = "") {
    return `
      <header class="page-header">
        <div>
          <h1>${Formato.escape(titulo)}</h1>
          ${subtitulo ? `<p class="page-sub">${subtitulo}</p>` : ""}
        </div>
        ${acciones ? `<div class="page-actions">${acciones}</div>` : ""}
      </header>`;
  },
};
