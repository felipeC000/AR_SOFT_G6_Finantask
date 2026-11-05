// js/presentacion/paginas/ObligacionFormPage.js
// CAPA DE PRESENTACIÓN (UI)
// Crear (RF03 + RF07) y editar (RF05) una obligación. Usa el mismo componente de formulario.

const ObligacionFormPage = {
  async render(container, params = {}) {
    const editando = Boolean(params.id);
    const actual = editando ? await ObligacionService.obtener(params.id) : null;
    const categorias = await ObligacionService.categorias();

    if (editando && !actual) return NoEncontradaPage.render(container);
    if (editando && actual.estado === "PAGADA") {
      Toast.mostrar("Una obligación pagada no se puede editar.", "error");
      return Dom.ir(`#/obligaciones/${actual.id}`);
    }

    Layout.render(container, {
      activo: editando ? "obligaciones" : "nueva",
      titulo: editando ? "Editar obligación" : "Nueva obligación",
      subtitulo: editando
        ? `Estás editando <strong>${Formato.escape(actual.nombre)}</strong>.`
        : `Registra un pago que tengas que hacer.`,
      contenido: ObligacionForm.html(actual || {}, categorias, {
        textoBoton: editando ? "Guardar cambios" : "Guardar obligación",
      }),
    });

    ObligacionForm.bind(container, async (datos) => {
      const r = await (editando ? ObligacionService.actualizar(actual.id, datos) : ObligacionService.crear(datos));
      if (r.ok) {
        Toast.mostrar(editando ? "Cambios guardados." : "Obligación registrada.");
        Dom.ir(editando ? `#/obligaciones/${actual.id}` : "#/obligaciones");
      }
      return r;
    });
  },
};
