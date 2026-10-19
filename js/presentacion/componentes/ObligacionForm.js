// js/presentacion/componentes/ObligacionForm.js
// CAPA DE PRESENTACIÓN (UI)
// Formulario de obligación. Se reutiliza para crear (RF03), editar (RF05)
// y para revisar el borrador del asistente de IA (RF13).

const ObligacionForm = {
  // valores: datos iniciales; opciones: { textoBoton, idForm, destacar }
  html(valores = {}, categorias = [], { textoBoton = "Guardar obligación", idForm = "obligacion-form", destacar = false } = {}) {
    const v = { prioridad: "MEDIA", ...valores };
    const sel = (a, b) => (String(a ?? "") === String(b ?? "") ? "selected" : "");

    return `
      <form id="${idForm}" class="form-card ${destacar ? "form-card--review" : ""}" novalidate>
        <div class="form-grid">
          <div class="field field--full">
            <label for="nombre">Nombre</label>
            <input type="text" id="nombre" name="nombre" maxlength="100" required
              placeholder="Ej: Internet, Matrícula, Tarjeta de crédito" value="${Formato.escape(v.nombre || "")}" />
          </div>

          <div class="field">
            <label for="idCategoria">Categoría</label>
            <select id="idCategoria" name="idCategoria" required>
              <option value="" ${sel("", v.idCategoria)}>Selecciona…</option>
              ${categorias.map((c) => `<option value="${c.id}" ${sel(c.id, v.idCategoria)}>${Formato.escape(c.nombre)}</option>`).join("")}
            </select>
          </div>

          <div class="field">
            <label for="valor">Valor (COP)</label>
            <input type="number" id="valor" name="valor" min="1" step="any" inputmode="decimal" required
              placeholder="0" value="${v.valor ?? ""}" />
          </div>

          <div class="field">
            <label for="fechaLimite">Fecha límite</label>
            <input type="date" id="fechaLimite" name="fechaLimite" required value="${v.fechaLimite || ""}" />
          </div>

          <fieldset class="field segmented">
            <legend>Prioridad</legend>
            ${Object.entries(Reglas.PRIORIDADES).map(([k, t]) => `
              <label class="segmented-option segmented-option--${k.toLowerCase()}">
                <input type="radio" name="prioridad" value="${k}" ${v.prioridad === k ? "checked" : ""} />
                <span>${t}</span>
              </label>`).join("")}
          </fieldset>

          <div class="field field--full">
            <label for="descripcion">Descripción <span class="optional">(opcional)</span></label>
            <input type="text" id="descripcion" name="descripcion" maxlength="150"
              placeholder="Ej: Factura del mes" value="${Formato.escape(v.descripcion || "")}" />
          </div>
        </div>

        ${FormErrors.html()}

        <div class="form-actions">
          <a href="#/obligaciones" class="btn btn-ghost">Cancelar</a>
          <button type="submit" class="btn btn-primary">${textoBoton}</button>
        </div>
      </form>`;
  },

  // onGuardar(datos) debe devolver { ok, errores }
  bind(raiz, onGuardar, idForm = "obligacion-form") {
    const form = Dom.$(raiz, `#${idForm}`);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const resultado = onGuardar(Dom.leerFormulario(form));
      if (resultado && !resultado.ok) FormErrors.mostrar(form, resultado.errores || []);
    });
    return form;
  },
};
