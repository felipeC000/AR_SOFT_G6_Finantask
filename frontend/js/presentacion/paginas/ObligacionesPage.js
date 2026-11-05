// js/presentacion/paginas/ObligacionesPage.js
// CAPA DE PRESENTACIÓN (UI)
// Consulta de obligaciones con filtros y orden (RF04) y eliminación (RF06).

const ObligacionesPage = (() => {
  // Los filtros se recuerdan mientras el usuario navega por la aplicación
  let filtros = { orden: "fecha" };

  async function render(container, params = {}) {
    if (params.estado) filtros = { ...filtros, estado: params.estado };
    const categorias = await ObligacionService.categorias();

    Layout.render(container, {
      activo: "obligaciones",
      titulo: "Obligaciones",
      subtitulo: `<span id="conteo"></span>`,
      acciones: `<a href="#/obligaciones/nueva" class="btn btn-primary">Nueva obligación</a>`,
      contenido: `
        ${FiltrosBar.html(filtros, categorias)}
        <section id="resultados" aria-live="polite"></section>
      `,
    });

    FiltrosBar.bind(container, async (nuevos) => {
      filtros = { orden: "fecha", ...nuevos };
      if (Object.keys(nuevos).length === 0) {
        await render(container); // limpiar: se vuelve a dibujar la barra vacía
        return;
      }
      await pintarResultados(container);
    });
    await pintarResultados(container);
  }

  // Solo se vuelve a dibujar la tabla, no toda la pantalla (así no se pierde el foco del buscador)
  async function pintarResultados(container) {
    const { orden, ...soloFiltros } = filtros;
    const zona = Dom.$(container, "#resultados");
    let lista;
    try {
      lista = await ObligacionService.listar(soloFiltros, orden);
    } catch (error) {
      // sin conexión o servidor caído: se avisa dentro de la pantalla, sin perder los filtros
      Dom.$(container, "#conteo").textContent = "";
      const aviso = Formato.escape(error instanceof ErrorApi ? error.message : "Ocurrió un error inesperado.");
      zona.innerHTML = EmptyState.html(
        aviso,
        `<button type="button" class="btn btn-primary" data-action="reintentar">Reintentar</button>`
      );
      Dom.onAction(zona, "reintentar", () => pintarResultados(container));
      return;
    }
    Dom.$(container, "#conteo").textContent = `${lista.length} obligación(es) encontrada(s)`;
    zona.innerHTML = ObligacionesTable.html(lista);

    Dom.onAction(zona, "eliminar", async ({ id }) => {
      const ob = lista.find((o) => String(o.id) === String(id));
      if (!ob) return;
      const confirmar = await ConfirmDialog.abrir({
        titulo: "Eliminar obligación",
        mensaje: `¿Seguro que quieres eliminar "${ob.nombre}"? Esta acción no se puede deshacer.`,
        textoConfirmar: "Eliminar",
        peligro: true,
      });
      if (!confirmar) return;
      const r = await ObligacionService.eliminar(id);
      Toast.mostrar(r.ok ? "Obligación eliminada." : r.mensaje, r.ok ? "ok" : "error");
      await pintarResultados(container);
    });
  }

  return { render };
})();
