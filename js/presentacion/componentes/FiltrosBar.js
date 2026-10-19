// js/presentacion/componentes/FiltrosBar.js
// CAPA DE PRESENTACIÓN (UI)
// Barra de filtros y orden para la consulta de obligaciones (RF04).

const FiltrosBar = {
  html(filtros, categorias) {
    const opcion = (valor, texto, actual) =>
      `<option value="${valor}" ${String(actual ?? "") === String(valor) ? "selected" : ""}>${texto}</option>`;

    return `
      <form class="filters" id="filtros" role="search">
        <div class="field field--grow">
          <label for="f-texto">Buscar</label>
          <input id="f-texto" name="texto" type="search" placeholder="Nombre de la obligación" value="${Formato.escape(filtros.texto || "")}" />
        </div>
        <div class="field">
          <label for="f-estado">Estado</label>
          <select id="f-estado" name="estado">
            ${opcion("", "Todos", filtros.estado)}
            ${Object.entries(Reglas.ESTADOS).map(([k, v]) => opcion(k, v, filtros.estado)).join("")}
          </select>
        </div>
        <div class="field">
          <label for="f-categoria">Categoría</label>
          <select id="f-categoria" name="idCategoria">
            ${opcion("", "Todas", filtros.idCategoria)}
            ${categorias.map((c) => opcion(c.id, Formato.escape(c.nombre), filtros.idCategoria)).join("")}
          </select>
        </div>
        <div class="field">
          <label for="f-prioridad">Prioridad</label>
          <select id="f-prioridad" name="prioridad">
            ${opcion("", "Todas", filtros.prioridad)}
            ${Object.entries(Reglas.PRIORIDADES).map(([k, v]) => opcion(k, v, filtros.prioridad)).join("")}
          </select>
        </div>
        <div class="field">
          <label for="f-desde">Desde</label>
          <input id="f-desde" name="desde" type="date" value="${filtros.desde || ""}" />
        </div>
        <div class="field">
          <label for="f-hasta">Hasta</label>
          <input id="f-hasta" name="hasta" type="date" value="${filtros.hasta || ""}" />
        </div>
        <div class="field">
          <label for="f-orden">Ordenar por</label>
          <select id="f-orden" name="orden">
            ${opcion("fecha", "Fecha límite", filtros.orden)}
            ${opcion("prioridad", "Prioridad", filtros.orden)}
            ${opcion("valor", "Valor (mayor)", filtros.orden)}
          </select>
        </div>
        <button type="button" class="btn btn-ghost" data-action="limpiar-filtros">Limpiar</button>
      </form>`;
  },

  // Llama a onCambio(filtros) cada vez que el usuario cambia algo
  bind(raiz, onCambio) {
    const form = Dom.$(raiz, "#filtros");
    const emitir = () => onCambio(Dom.leerFormulario(form));
    form.addEventListener("change", emitir);
    form.addEventListener("submit", (e) => { e.preventDefault(); emitir(); });
    let espera;
    Dom.$(form, "#f-texto").addEventListener("input", () => {
      clearTimeout(espera);
      espera = setTimeout(emitir, 250);
    });
    Dom.onAction(raiz, "limpiar-filtros", () => onCambio({}));
  },
};
