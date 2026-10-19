// js/logica/servicios/asistenteIAService.js
// CAPA DE LÓGICA
// Asistente de registro con IA (RF13 — propuesto en el marco integrador).
//
// En esta entrega NO hay conexión con ningún servicio de IA. Esta es una simulación
// local con expresiones regulares, solo para mostrar cómo funcionaría la pantalla.
// En una fase posterior, extraerDesdeTexto() hará un POST a /api/ia/extraer en el
// backend, que es quien llama a la API de Gemini. Como la pantalla solo conoce esta
// función, el cambio no afecta a la interfaz.

const AsistenteIAService = (() => {
  const MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8,
    septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };

  const PALABRAS_CATEGORIA = [
    { nombre: "Servicios públicos", palabras: ["energía", "energia", "luz", "agua", "acueducto", "gas", "internet", "celular", "telefonía"] },
    { nombre: "Educación", palabras: ["matrícula", "matricula", "universidad", "semestre", "curso", "colegio"] },
    { nombre: "Créditos y tarjetas", palabras: ["tarjeta", "crédito", "credito", "cuota", "préstamo", "prestamo"] },
    { nombre: "Suscripciones", palabras: ["suscripción", "suscripcion", "plan", "plataforma", "membresía"] },
    { nombre: "Vivienda", palabras: ["arriendo", "administración", "administracion", "alquiler"] },
  ];

  function extraerValor(texto) {
    // Ej: $86.450 · $ 1.250.000 · 86450 pesos
    const m = texto.match(/\$\s?([\d.,]+)/) || texto.match(/([\d.]{4,})\s*(pesos|cop)/i);
    if (!m) return null;
    const limpio = m[1].replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
    const valor = Number(limpio);
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  }

  function extraerFecha(texto) {
    let m = texto.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    m = texto.toLowerCase().match(/(\d{1,2})\s+de\s+([a-zé]+)(?:\s+de\s+(\d{4}))?/);
    if (m && MESES[m[2]]) {
      const hoy = Fechas.hoy();
      let anio = m[3] ? Number(m[3]) : hoy.getFullYear();
      let iso = `${anio}-${String(MESES[m[2]]).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
      if (!m[3] && iso < Fechas.hoyISO()) iso = `${anio + 1}${iso.slice(4)}`; // si ya pasó, se asume el próximo año
      return iso;
    }
    return null;
  }

  function sugerirCategoria(texto) {
    const t = texto.toLowerCase();
    const hallada = PALABRAS_CATEGORIA.find((c) => c.palabras.some((p) => t.includes(p)));
    const nombre = hallada ? hallada.nombre : "Otros";
    const cat = ObligacionService.categorias().find((c) => c.nombre === nombre);
    return cat ? cat.id : null;
  }

  function sugerirNombre(texto) {
    const m = texto.match(/factura (?:de|del)\s+([a-záéíóúñ ]{3,30}?)(?:\s+por|\s+con|,|\.|$)/i);
    if (m) return "Factura " + m[1].trim();
    return texto.trim().split(/\s+/).slice(0, 4).join(" ");
  }

  // Devuelve un "borrador" con la misma forma que tendría la respuesta del backend
  function extraerDesdeTexto(texto) {
    if (!texto || texto.trim().length < 10) {
      return { ok: false, mensaje: "Pega un texto un poco más largo (por ejemplo, el SMS o correo de la factura)." };
    }
    const borrador = {
      nombre: sugerirNombre(texto),
      valor: extraerValor(texto),
      fechaLimite: extraerFecha(texto),
      idCategoria: sugerirCategoria(texto),
    };
    const encontrados = [borrador.valor, borrador.fechaLimite, borrador.idCategoria].filter(Boolean).length;
    borrador.confianza = Math.round((encontrados / 3) * 100) / 100;
    return { ok: true, borrador };
  }

  return { extraerDesdeTexto };
})();
