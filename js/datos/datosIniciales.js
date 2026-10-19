// js/datos/datosIniciales.js
// CAPA DE DATOS
// Datos de ejemplo para el prototipo. Las fechas se calculan a partir del día actual
// para que siempre haya obligaciones pendientes, próximas a vencer y vencidas.
// La estructura sigue el modelo relacional del documento maestro:
// usuarios, categorias, obligaciones (obligaciones_financieras) y pagos (historial_pagos).

function crearDatosIniciales() {
  const hoy = Fechas.hoyISO();
  const d = (dias) => Fechas.sumarDias(hoy, dias);

  return {
    usuarios: [
      { id: 1, nombre: "Usuario de prueba", correo: "demo@finantask.co", fechaRegistro: d(-60) },
    ],
    categorias: [
      { id: 1, nombre: "Servicios públicos", descripcion: "Agua, energía, gas, internet" },
      { id: 2, nombre: "Educación", descripcion: "Matrículas, cursos, materiales" },
      { id: 3, nombre: "Créditos y tarjetas", descripcion: "Cuotas de créditos y tarjetas de crédito" },
      { id: 4, nombre: "Suscripciones", descripcion: "Plataformas y servicios mensuales" },
      { id: 5, nombre: "Vivienda", descripcion: "Arriendo y administración" },
      { id: 6, nombre: "Otros", descripcion: "Pagos que no encajan en las demás" },
    ],
    obligaciones: [
      { id: 1, idUsuario: 1, idCategoria: 1, nombre: "Internet hogar", descripcion: "Factura mensual", valor: 89900, fechaLimite: d(2), prioridad: "ALTA", estado: "PENDIENTE", origen: "MANUAL", fechaCreacion: d(-10), fechaActualizacion: d(-10) },
      { id: 2, idUsuario: 1, idCategoria: 4, nombre: "Plataforma de música", descripcion: "Plan individual", valor: 18900, fechaLimite: d(6), prioridad: "BAJA", estado: "PENDIENTE", origen: "MANUAL", fechaCreacion: d(-20), fechaActualizacion: d(-20) },
      { id: 3, idUsuario: 1, idCategoria: 2, nombre: "Matrícula semestre", descripcion: "Segundo pago", valor: 1250000, fechaLimite: d(-12), prioridad: "ALTA", estado: "PAGADA", origen: "MANUAL", fechaCreacion: d(-40), fechaActualizacion: d(-14) },
      { id: 4, idUsuario: 1, idCategoria: 3, nombre: "Tarjeta de crédito", descripcion: "Pago mínimo", valor: 245000, fechaLimite: d(-3), prioridad: "ALTA", estado: "PENDIENTE", origen: "MANUAL", fechaCreacion: d(-25), fechaActualizacion: d(-25) },
      { id: 5, idUsuario: 1, idCategoria: 1, nombre: "Energía", descripcion: "Factura del mes", valor: 86450, fechaLimite: d(1), prioridad: "MEDIA", estado: "PENDIENTE", origen: "MANUAL", fechaCreacion: d(-5), fechaActualizacion: d(-5) },
      { id: 6, idUsuario: 1, idCategoria: 5, nombre: "Arriendo", descripcion: "Apartamento", valor: 950000, fechaLimite: d(15), prioridad: "ALTA", estado: "PENDIENTE", origen: "MANUAL", fechaCreacion: d(-3), fechaActualizacion: d(-3) },
      { id: 7, idUsuario: 1, idCategoria: 1, nombre: "Plan de celular", descripcion: "", valor: 55000, fechaLimite: d(-20), prioridad: "MEDIA", estado: "PAGADA", origen: "MANUAL", fechaCreacion: d(-45), fechaActualizacion: d(-21) },
      { id: 8, idUsuario: 1, idCategoria: 4, nombre: "Plataforma de video", descripcion: "Plan estándar", valor: 26900, fechaLimite: d(24), prioridad: "BAJA", estado: "PENDIENTE", origen: "MANUAL", fechaCreacion: d(-2), fechaActualizacion: d(-2) },
    ],
    pagos: [
      { id: 1, idObligacion: 3, fechaPago: d(-14), valorPagado: 1250000 },
      { id: 2, idObligacion: 7, fechaPago: d(-21), valorPagado: 55000 },
    ],
  };
}
