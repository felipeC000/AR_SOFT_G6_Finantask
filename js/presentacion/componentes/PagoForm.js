// js/presentacion/componentes/PagoForm.js
// CAPA DE PRESENTACIÓN (UI)
// Formulario corto para registrar el pago de una obligación (RF08).

const PagoForm = {
  html(obligacion) {
    return `
      <form id="pago-form" class="form-card form-card--compact" novalidate>
        <h2>Registrar pago</h2>
        <p class="hint">Al guardar, el pago queda en el historial y la obligación pasa a <strong>Pagada</strong>.</p>
        <div class="form-grid">
          <div class="field">
            <label for="valorPagado">Valor pagado</label>
            <input type="number" id="valorPagado" name="valorPagado" min="1" step="any" inputmode="decimal" value="${obligacion.valor}" />
          </div>
          <div class="field">
            <label for="fechaPago">Fecha de pago</label>
            <input type="date" id="fechaPago" name="fechaPago" max="${Fechas.hoyISO()}" value="${Fechas.hoyISO()}" />
          </div>
        </div>
        ${FormErrors.html()}
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${Iconos.check} Registrar pago</button>
        </div>
      </form>`;
  },

  bind(raiz, onRegistrar) {
    const form = Dom.$(raiz, "#pago-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const resultado = onRegistrar(Dom.leerFormulario(form));
      if (resultado && !resultado.ok) FormErrors.mostrar(form, resultado.errores || []);
    });
  },
};
