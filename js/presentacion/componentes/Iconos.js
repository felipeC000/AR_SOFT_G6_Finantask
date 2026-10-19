// js/presentacion/componentes/Iconos.js
// CAPA DE PRESENTACIÓN (UI)
// Íconos SVG sencillos (trazos) usados en el menú y en los botones.

const Iconos = (() => {
  const svg = (contenido) =>
    `<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${contenido}</svg>`;

  return {
    resumen: svg('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
    lista: svg('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>'),
    mas: svg('<path d="M12 5v14M5 12h14"/>'),
    pagos: svg('<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M7 15h3"/>'),
    reporte: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    ia: svg('<path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'),
    salir: svg('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/>'),
    menu: svg('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    alerta: svg('<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/>'),
    calendario: svg('<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>'),
    editar: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
    papelera: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    volver: svg('<path d="M15 18l-6-6 6-6"/>'),
  };
})();
