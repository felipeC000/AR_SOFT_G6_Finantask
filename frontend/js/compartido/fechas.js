// js/compartido/fechas.js
// Utilidad transversal: manejo de fechas "AAAA-MM-DD" como fecha local.
// La usan las tres capas (datos, lógica y presentación), por eso está aparte.

const Fechas = (() => {
  function parse(iso) {
    const [a, m, d] = iso.split("-").map(Number);
    return new Date(a, m - 1, d);
  }

  function aISO(date) {
    const a = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${a}-${m}-${d}`;
  }

  function hoy() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function hoyISO() {
    return aISO(hoy());
  }

  function sumarDias(iso, dias) {
    const d = parse(iso);
    d.setDate(d.getDate() + dias);
    return aISO(d);
  }

  function diasEntre(desdeISO, hastaISO) {
    const ms = parse(hastaISO) - parse(desdeISO);
    return Math.round(ms / 86400000);
  }

  function mesActual() {
    return hoyISO().slice(0, 7);
  }

  return { parse, aISO, hoy, hoyISO, sumarDias, diasEntre, mesActual };
})();
