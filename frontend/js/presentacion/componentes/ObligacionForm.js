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


          <div class="field field--full ia-box">
            <button type="button" class="btn btn-secondary" data-action="sugerir-prioridad">${Iconos.ia} Sugerir prioridad con IA</button>
            <div class="ia-resultado" role="status" aria-live="polite"></div>
          </div>

          <div class="field field--full">
            <label for="descripcion">Descripción <span class="optional">(opcional)</span></label>
            <input type="text" id="descripcion" name="descripcion" maxlength="150"
              placeholder="Ej: Factura del mes" value="${Formato.escape(v.descripcion || "")}" />
          </div>
        </div>

        ${FormErrors.html()}

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${textoBoton}</button>
          <a href="#/obligaciones" class="btn btn-ghost">Cancelar</a>
        </div>
      </form>`;
  },

  // onGuardar(datos) debe devolver (o prometer) { ok, errores }
  bind(raiz, onGuardar, idForm = "obligacion-form") {
    const form = Dom.$(raiz, `#${idForm}`);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await Dom.enviar(form, () => onGuardar(Dom.leerFormulario(form)));
    });
    this.bindSugerencia(form);
    return form;
  },

  // Botón "Sugerir prioridad con IA": consulta el modelo y permite aplicar la sugerencia
  bindSugerencia(form) {
    const boton = Dom.$(form, '[data-action="sugerir-prioridad"]');
    const zona = Dom.$(form, ".ia-resultado");
    if (!boton || !zona) return;
    const limpiar = () => { zona.innerHTML = ""; zona.className = "ia-resultado"; };
    ["valor", "fechaLimite"].forEach((n) => form.elements[n].addEventListener("input", limpiar)); // la sugerencia ya no aplica

    boton.addEventListener("click", async () => {
      const { valor, fechaLimite, prioridad } = Dom.leerFormulario(form);
      boton.disabled = true;
      zona.className = "ia-resultado";
      zona.textContent = "Consultando al asistente…";
      let r;
      try {
        r = await IAService.sugerirPrioridad({ valor, fechaLimite });
      } catch (e) {
        console.error(e);
        r = { ok: false, mensaje: "Ocurrió un error inesperado. Intenta de nuevo." };
      }
      boton.disabled = false;

      if (!r.ok) {
        zona.className = "ia-resultado ia-resultado--error";
        zona.textContent = r.mensaje;
        return;
      }
      const s = r.sugerencia;
      const nombre = Reglas.PRIORIDADES[s.prioridad] || s.prioridad;
      const pct = (p) => `${Math.round((p || 0) * 100)} %`;
      const detalle = ["ALTA", "MEDIA", "BAJA"].map((k) => `${Reglas.PRIORIDADES[k]} ${pct(s.probabilidades[k])}`).join(" · ");
      const coincide = prioridad === s.prioridad;
      zona.className = "ia-resultado ia-resultado--ok";
      zona.innerHTML = `
        <p><strong>Sugerencia: prioridad ${Formato.escape(nombre)}</strong> (${pct(s.confianza)} de confianza).
          ${coincide ? "Coincide con la prioridad elegida." : `<button type="button" class="btn-link" data-aplicar="${Formato.escape(s.prioridad)}">Aplicar</button>`}</p>
        <p class="hint">${Formato.escape(detalle)} · faltan ${Number(s.diasParaVencer)} día(s) para vencer</p>
        ${s.requiereRevision ? `<p class="hint hint--warn">La confianza es baja: revisa tú la prioridad.</p>` : ""}
        <p class="hint">${Formato.escape(s.nota)} (modelo v${Formato.escape(s.versionModelo)})</p>`;
      const aplicar = Dom.$(zona, "[data-aplicar]");
      if (aplicar) {
        aplicar.addEventListener("click", () => {
          const radio = Dom.$(form, `input[name="prioridad"][value="${aplicar.dataset.aplicar}"]`);
          if (radio) radio.checked = true;
          zona.querySelector("p").innerHTML = `<strong>Prioridad ${Formato.escape(nombre)} aplicada.</strong> Puedes cambiarla si lo prefieres.`;
        });
      }
    });
  },
};
