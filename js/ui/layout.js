// js/ui/layout.js
// Estructura visual compartida (sidebar + contenido) y helpers de formato

const UILayout = {
  shell(activo, contenidoHtml) {
    return `
      <div class="app-shell">
        <aside class="sidebar">
          <p class="brand">FinanTask</p>
          <nav>
            <a href="#/dashboard" class="nav-link ${activo === "dashboard" ? "is-active" : ""}">Resumen</a>
            <a href="#/nueva" class="nav-link ${activo === "nueva" ? "is-active" : ""}">Nueva actividad</a>
            <a href="#/lista" class="nav-link ${activo === "lista" ? "is-active" : ""}">Actividades</a>
          </nav>
          <button id="logout-btn" class="nav-logout">Cerrar sesion</button>
        </aside>
        <main class="content">
          ${contenidoHtml}
        </main>
      </div>
    `;
  },

  bindNav(container) {
    const logout = container.querySelector("#logout-btn");
    if (logout) {
      logout.addEventListener("click", () => {
        Services.cerrarSesion();
        window.location.hash = "#/login";
      });
    }
  },
};

function formatoMoneda(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CO");
}

function formatoFecha(fecha) {
  const d = new Date(fecha);
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}
