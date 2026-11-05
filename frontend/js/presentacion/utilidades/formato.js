// js/presentacion/utilidades/formato.js
// CAPA DE PRESENTACIÓN (UI)
// Funciones de apoyo para mostrar datos en pantalla (moneda, fechas, texto seguro).
// No tienen reglas de negocio, solo formato.

const Formato = (() => {
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre", "diciembre"];

  function moneda(valor) {
    return "$" + Number(valor || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });
  }

  // Las fechas se guardan como texto "AAAA-MM-DD". Se leen como fecha local para que
  // no se corran un día por la zona horaria (new Date("2026-09-25") la toma en UTC).
  function fecha(iso) {
    if (!iso) return "";
    const d = Fechas.parse(iso);
    return `${String(d.getDate()).padStart(2, "0")} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  }

  function mes(claveMes) {
    // claveMes: "AAAA-MM"
    const [a, m] = claveMes.split("-").map(Number);
    return `${MESES_LARGOS[m - 1]} de ${a}`;
  }

  function diasRestantes(dias) {
    if (dias < 0) return `Vencida hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? "" : "s"}`;
    if (dias === 0) return "Vence hoy";
    if (dias === 1) return "Vence mañana";
    return `Vence en ${dias} días`;
  }

  // Evita que un texto escrito por el usuario se interprete como HTML.
  function escape(texto) {
    return String(texto ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  return { moneda, fecha, mes, diasRestantes, escape };
})();
