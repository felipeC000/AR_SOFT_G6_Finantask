// js/presentacion/paginas/AsistentePage.js
// CAPA DE PRESENTACIÓN (UI)
// Asistente de registro con IA (RF13, propuesto). Muestra cómo funcionaría la pantalla:
// el usuario pega el texto, el sistema propone los datos y el usuario los revisa y confirma.
// La extracción es una simulación local (ver js/logica/servicios/asistenteIAService.js).

const AsistentePage = {
  render(container) {
    const ejemplo = "Aviso de pago: su factura de energía por $86.450 vence el 5 de noviembre. Evite recargos.";

    Layout.render(container, {
      activo: "asistente",
      titulo: "Asistente de registro",
      subtitulo: "Pega el mensaje o correo de tu factura y el asistente te propone los datos de la obligación.",
      contenido: `
        <div class="notice">
          <strong>Función propuesta (RF13).</strong>
          En este prototipo la extracción se simula en el navegador. En la siguiente fase el texto se enviará
          al backend, que usará la API de Gemini. Nada se guarda hasta que confirmes el formulario.
        </div>

        <div class="assistant-grid">
          <section class="panel">
            <div class="panel-head"><h2>${Iconos.ia} 1. Pega el texto</h2></div>
            <form id="ia-form" novalidate>
              <div class="field">
                <label for="texto-ia">Mensaje, SMS o correo</label>
                <textarea id="texto-ia" name="texto" rows="6" placeholder="${Formato.escape(ejemplo)}"></textarea>
              </div>
              <div class="field">
                <label for="archivo-ia">O sube la foto / PDF de la factura</label>
                <input type="file" id="archivo-ia" accept="image/*,application/pdf" disabled />
                <small class="hint">Disponible cuando se conecte el servicio de IA.</small>
              </div>
              <p class="form-error" id="ia-error" role="alert"></p>
              <div class="form-actions">
                <button type="button" class="btn btn-ghost" data-action="ejemplo">Usar ejemplo</button>
                <button type="submit" class="btn btn-primary">${Iconos.ia} Extraer datos</button>
              </div>
            </form>
          </section>

          <section class="panel" id="revision">
            <div class="panel-head"><h2>2. Revisa y confirma</h2></div>
            ${EmptyState.html("Aquí aparecerá el formulario con los datos sugeridos.")}
          </section>
        </div>
      `,
    });

    const form = Dom.$(container, "#ia-form");
    Dom.onAction(container, "ejemplo", () => { Dom.$(container, "#texto-ia").value = ejemplo; });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { texto } = Dom.leerFormulario(form);
      const r = AsistenteIAService.extraerDesdeTexto(texto);
      Dom.$(container, "#ia-error").textContent = r.ok ? "" : r.mensaje;
      if (r.ok) AsistentePage.mostrarRevision(container, r.borrador);
    });
  },

  // Muestra el formulario prellenado con lo que encontró el asistente
  mostrarRevision(container, borrador) {
    const zona = Dom.$(container, "#revision");
    const porcentaje = Math.round(borrador.confianza * 100);
    const baja = borrador.confianza < 0.7;
    zona.innerHTML = `
      <div class="panel-head">
        <h2>2. Revisa y confirma</h2>
        <span class="badge ${baja ? "badge--prioridad-media" : "badge--estado-pagada"}">Confianza ${porcentaje}%</span>
      </div>
      ${baja ? `<p class="hint hint--warn">No se encontraron todos los datos. Revisa con cuidado los campos vacíos.</p>` : ""}
      ${ObligacionForm.html(borrador, ObligacionService.categorias(), { textoBoton: "Confirmar y guardar", idForm: "revision-form", destacar: true })}
    `;
    ObligacionForm.bind(zona, (datos) => {
      const r = ObligacionService.crear({ ...datos, origen: "ASISTENTE_IA" });
      if (r.ok) {
        Toast.mostrar("Obligación registrada con el asistente.");
        Dom.ir(`#/obligaciones/${r.obligacion.id}`);
      }
      return r;
    }, "revision-form");
  },
};
