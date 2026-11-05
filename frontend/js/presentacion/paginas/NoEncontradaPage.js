// js/presentacion/paginas/NoEncontradaPage.js
// CAPA DE PRESENTACIÓN (UI)
// Se muestra cuando la ruta o la obligación no existen.

const NoEncontradaPage = {
  render(container) {
    Layout.render(container, {
      activo: "",
      titulo: "No encontramos esa página",
      contenido: EmptyState.html("Puede que la obligación se haya eliminado o que el enlace esté mal escrito.",
        `<a href="#/dashboard" class="btn btn-primary">Ir al resumen</a>`),
    });
  },
};
