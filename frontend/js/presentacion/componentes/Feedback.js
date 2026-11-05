// js/presentacion/componentes/Feedback.js
// CAPA DE PRESENTACIÓN (UI)
// Mensajes emergentes (toast) y ventana de confirmación.

const Toast = {
  mostrar(mensaje, tipo = "ok") {
    let zona = document.getElementById("toast-zone");
    if (!zona) {
      zona = document.createElement("div");
      zona.id = "toast-zone";
      zona.setAttribute("aria-live", "polite");
      document.body.appendChild(zona);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast--${tipo}`;
    toast.textContent = mensaje;
    zona.appendChild(toast);
    setTimeout(() => toast.classList.add("is-leaving"), 2600);
    setTimeout(() => toast.remove(), 3000);
  },
};

const ConfirmDialog = {
  // Devuelve una promesa que se resuelve en true (confirmar) o false (cancelar)
  abrir({ titulo, mensaje, textoConfirmar = "Confirmar", peligro = false }) {
    return new Promise((resolver) => {
      const capa = document.createElement("div");
      capa.className = "modal-backdrop";
      capa.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
          <h2 id="modal-titulo">${Formato.escape(titulo)}</h2>
          <p>${Formato.escape(mensaje)}</p>
          <div class="form-actions">
            <button class="btn btn-ghost" data-r="no">Cancelar</button>
            <button class="btn ${peligro ? "btn-danger" : "btn-primary"}" data-r="si">${Formato.escape(textoConfirmar)}</button>
          </div>
        </div>`;
      const cerrar = (valor) => {
        document.removeEventListener("keydown", onKey);
        capa.remove();
        resolver(valor);
      };
      const onKey = (e) => { if (e.key === "Escape") cerrar(false); };
      capa.addEventListener("click", (e) => {
        if (e.target === capa) cerrar(false);
        if (e.target.dataset.r) cerrar(e.target.dataset.r === "si");
      });
      document.addEventListener("keydown", onKey);
      document.body.appendChild(capa);
      capa.querySelector('[data-r="si"]').focus();
    });
  },
};
