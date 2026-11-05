// js/presentacion/componentes/Sidebar.js
// CAPA DE PRESENTACIÓN (UI)
// Menú de navegación lateral. Cada opción corresponde a un módulo del sistema.

const Sidebar = (() => {
  const OPCIONES = [
    { id: "dashboard", ruta: "#/dashboard", texto: "Resumen", icono: "resumen" },
    { id: "obligaciones", ruta: "#/obligaciones", texto: "Obligaciones", icono: "lista" },
    { id: "pagos", ruta: "#/pagos", texto: "Historial de pagos", icono: "pagos" },
    { id: "reportes", ruta: "#/reportes", texto: "Resumen mensual", icono: "reporte" },
  ];

  function html(activo, usuario) {
    const enlaces = OPCIONES.map(
      (o) => `
        <a href="${o.ruta}" class="nav-link ${activo === o.id ? "is-active" : ""}" ${activo === o.id ? 'aria-current="page"' : ""}>
          <span>${o.texto}</span>${o.etiqueta ? `<small class="nav-tag">${o.etiqueta}</small>` : ""}
        </a>`
    ).join("");

    return `
      <header class="topbar" id="sidebar">
          <a href="#/dashboard" class="brand">FinanTask</a>
          <nav class="nav" id="nav-principal">${enlaces}</nav>
          <button class="menu-toggle" id="menu-toggle" aria-label="Abrir menú" aria-expanded="false">Menú</button>
          <div class="topbar-user">
            <span>${Formato.escape(usuario.nombre)}</span>
            <button id="logout-btn" class="nav-logout">Cerrar sesión</button>
          </div>
        </header>`;
  }

  function bind(raiz) {
    const toggle = Dom.$(raiz, "#menu-toggle");
    const sidebar = Dom.$(raiz, "#sidebar");
    toggle.addEventListener("click", () => {
      const abierto = sidebar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(abierto));
    });
    Dom.$(raiz, "#logout-btn").addEventListener("click", async () => {
      await AuthService.cerrarSesion();
      Dom.ir("#/login");
    });
  }

  return { html, bind };
})();
