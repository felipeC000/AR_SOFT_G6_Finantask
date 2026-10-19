// js/presentacion/componentes/Layout.js
// CAPA DE PRESENTACIÓN (UI)
// Estructura común de las pantallas internas: menú lateral + encabezado + contenido.

const Layout = {
  // opciones: { activo, titulo, subtitulo, acciones, contenido }
  render(container, { activo, titulo, subtitulo = "", acciones = "", contenido }) {
    const usuario = AuthService.usuarioActual();
    container.innerHTML = `
      <div class="app-shell">
        ${Sidebar.html(activo, usuario)}
        <main class="content" id="contenido">
          ${PageHeader.html(titulo, subtitulo, acciones)}
          ${contenido}
        </main>
      </div>`;
    Sidebar.bind(container);
    document.title = `${titulo} · FinanTask`;
  },
};
