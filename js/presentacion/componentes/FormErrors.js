// js/presentacion/componentes/FormErrors.js
// CAPA DE PRESENTACIÓN (UI)
// Muestra la lista de errores de validación de un formulario.

const FormErrors = {
  html() {
    return `<div class="form-errors" role="alert" aria-live="polite"></div>`;
  },

  mostrar(form, errores) {
    const caja = form.querySelector(".form-errors");
    if (!caja) return;
    caja.innerHTML = errores.length
      ? `<ul>${errores.map((e) => `<li>${Formato.escape(e)}</li>`).join("")}</ul>`
      : "";
    if (errores.length) caja.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },
};
