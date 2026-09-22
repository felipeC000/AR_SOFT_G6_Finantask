// js/data.js
// Capa de Gestion de Datos (Modelo)
// En esta fase los datos viven en memoria; mas adelante se conectara a una base de datos real.

const Data = (() => {
  let nextId = 4;

  let actividades = [
    { id: 1, nombre: "Internet", categoria: "Servicios", descripcion: "Factura del mes", valor: 80000, fechaLimite: "2026-09-25", prioridad: "Alta", estado: "Pendiente" },
    { id: 2, nombre: "Netflix", categoria: "Suscripciones", descripcion: "Plan estandar", valor: 25000, fechaLimite: "2026-10-01", prioridad: "Baja", estado: "Pendiente" },
    { id: 3, nombre: "Matricula", categoria: "Educacion", descripcion: "Semestre 2026-2", valor: 1200000, fechaLimite: "2026-09-10", prioridad: "Alta", estado: "Pagado" },
  ];

  function listar() {
    return actividades;
  }

  function obtenerPorId(id) {
    return actividades.find((a) => a.id === Number(id));
  }

  function crear(actividad) {
    const nueva = { id: nextId++, ...actividad };
    actividades.push(nueva);
    return nueva;
  }

  function actualizar(id, cambios) {
    const actividad = obtenerPorId(id);
    if (!actividad) return null;
    Object.assign(actividad, cambios);
    return actividad;
  }

  function eliminar(id) {
    actividades = actividades.filter((a) => a.id !== Number(id));
  }

  return { listar, obtenerPorId, crear, actualizar, eliminar };
})();
