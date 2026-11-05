// js/presentacion/componentes/ErrorPage.js
// CAPA DE PRESENTACIÓN (UI)
// Pantalla que se muestra cuando no se pudo cargar la información: sin conexión con el
// servidor, base de datos caída o un error inesperado. Ofrece "Reintentar".

const ErrorPage = {
  render(container, error) {
    const conocido = error instanceof ErrorApi;
    if (!conocido) console.error(error);
    const mensaje = conocido ? error.message : "Ocurrió un error inesperado. Intenta de nuevo.";
    const titulo = conocido && error.estado === 0 ? "Sin conexión con el servidor" : "No pudimos cargar la información";
    const contenido = `
      <div class="empty-state" role="alert">
        <p>${Formato.escape(mensaje)}</p>
        <button type="button" class="btn btn-primary" data-action="reintentar">Reintentar</button>
      </div>`;

    if (AuthService.estaAutenticado()) {
      Layout.render(container, { activo: "", titulo, contenido });
    } else {
      container.innerHTML = AuthLayout.html(`<h1>${Formato.escape(titulo)}</h1>${contenido}`);
    }
    document.title = `${titulo} · FinanTask`;
    Dom.onAction(container, "reintentar", () => Router.reintentar());
  },
};
