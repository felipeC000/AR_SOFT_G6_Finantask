// js/presentacion/componentes/Sidebar.js
// CAPA DE PRESENTACIÓN (UI)
// Menú de navegación lateral. Cada opción corresponde a un módulo del sistema.

const Sidebar = (() => {
  const OPCIONES = [
    { id: "dashboard", ruta: "#/dashboard", texto: "Resumen", icono: "resumen" },
    { id: "obligaciones", ruta: "#/obligaciones", texto: "Obligaciones", icono: "lista" },
    { id: "nueva", ruta: "#/obligaciones/nueva", texto: "Nueva obligación", icono: "mas" },
    { id: "pagos", ruta: "#/pagos", texto: "Historial de pagos", icono: "pagos" },
    { id: "reportes", ruta: "#/reportes", texto: "Resumen mensual", icono: "reporte" },
    { id: "asistente", ruta: "#/asistente", texto: "Asistente IA", icono: "ia", etiqueta: "Propuesto" },
  ];

  function html(activo, usuario) {
    const enlaces = OPCIONES.map(
      (o) => `
        <a href="${o.ruta}" class="nav-link ${activo === o.id ? "is-active" : ""}" ${activo === o.id ? 'aria-current="page"' : ""}>
          ${Iconos[o.icono]}<span>${o.texto}</span>${o.etiqueta ? `<small class="nav-tag">${o.etiqueta}</small>` : ""}
        </a>`
    ).join("");

    return `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-top">
          <a href="#/dashboard" class="brand"><img src="assets/img/logo.svg" alt="" width="28" height="28" />FinanTask</a>
          <button class="menu-toggle" id="menu-toggle" aria-label="Abrir menú" aria-expanded="false">${Iconos.menu}</button>
        </div>
        <nav class="nav" id="nav-principal">${enlaces}</nav>
        <div class="sidebar-user">
          <span class="user-avatar">${Formato.escape((usuario.nombre || "?").charAt(0).toUpperCase())}</span>
          <span class="user-info"><strong>${Formato.escape(usuario.nombre)}</strong><small>${Formato.escape(usuario.correo)}</small></span>
          <button id="logout-btn" class="nav-logout" title="Cerrar sesión" aria-label="Cerrar sesión">${Iconos.salir}</button>
        </div>
      </aside>`;
  }

  function bind(raiz) {
    const toggle = Dom.$(raiz, "#menu-toggle");
    const sidebar = Dom.$(raiz, "#sidebar");
    toggle.addEventListener("click", () => {
      const abierto = sidebar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(abierto));
    });
    Dom.$(raiz, "#logout-btn").addEventListener("click", () => {
      AuthService.cerrarSesion();
      Dom.ir("#/login");
    });
  }

  return { html, bind };
})();
