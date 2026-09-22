// js/app.js
// Controlador principal: enruta entre pantallas segun la ruta y el estado de sesion

function render() {
  const app = document.getElementById("app");
  const ruta = window.location.hash || "#/login";

  if (!Services.usuarioAutenticado() && ruta !== "#/login") {
    window.location.hash = "#/login";
    return;
  }

  switch (ruta) {
    case "#/login":
      UILogin.render(app);
      break;
    case "#/dashboard":
      UIDashboard.render(app);
      break;
    case "#/nueva":
      UINuevaActividad.render(app);
      break;
    case "#/lista":
      UILista.render(app);
      break;
    default:
      window.location.hash = "#/login";
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
