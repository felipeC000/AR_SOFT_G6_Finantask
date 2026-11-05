// js/presentacion/utilidades/dom.js
// CAPA DE PRESENTACIÓN (UI)
// Atajos pequeños para trabajar con el DOM sin repetir tanto código.

const Dom = {
  $(raiz, selector) {
    return raiz.querySelector(selector);
  },

  $$(raiz, selector) {
    return Array.from(raiz.querySelectorAll(selector));
  },

  // Asocia un evento a todos los elementos que tengan data-action="nombre".
  onAction(raiz, accion, manejador) {
    raiz.querySelectorAll(`[data-action="${accion}"]`).forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        manejador(el.dataset, el);
      });
    });
  },

  // Lee los campos de un formulario y devuelve un objeto { name: valor }.
  leerFormulario(form) {
    const datos = {};
    new FormData(form).forEach((valor, clave) => {
      datos[clave] = typeof valor === "string" ? valor.trim() : valor;
    });
    return datos;
  },

  ir(ruta) {
    window.location.hash = ruta;
  },

  // Envía un formulario sin permitir doble clic: desactiva el botón mientras el servidor responde
  // y muestra los errores (de validación o de conexión) en el propio formulario.
  async enviar(form, accion) {
    const boton = form.querySelector('button[type="submit"]');
    if (boton) boton.disabled = true;
    try {
      const resultado = await accion();
      if (resultado && !resultado.ok) FormErrors.mostrar(form, resultado.errores || []);
    } catch (e) {
      console.error(e);
      FormErrors.mostrar(form, ["Ocurrió un error inesperado. Intenta de nuevo."]);
    } finally {
      if (boton && boton.isConnected) boton.disabled = false;
    }
  },
};
