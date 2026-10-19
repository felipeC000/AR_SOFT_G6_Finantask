// js/datos/almacen.js
// CAPA DE DATOS
// Capa de acceso a datos.
// En esta fase no hay base de datos: la información se guarda en el localStorage del
// navegador para que no se pierda al recargar. Más adelante este archivo se reemplaza por
// llamadas a la API REST (Spring Boot + PostgreSQL) sin tener que tocar las pantallas.

const Almacen = (() => {
  const CLAVE = "finantask:datos:v2";
  let db = cargar();

  function cargar() {
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado) return JSON.parse(guardado);
    } catch (e) {
      // Si el navegador bloquea el almacenamiento se trabaja solo en memoria
    }
    return crearDatosIniciales();
  }

  function guardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(db));
    } catch (e) {
      /* sin almacenamiento disponible */
    }
  }

  function siguienteId(tabla) {
    return db[tabla].reduce((max, fila) => Math.max(max, fila.id), 0) + 1;
  }

  // Devuelve copias para que las pantallas no modifiquen los datos por accidente
  function listar(tabla, filtro = () => true) {
    return db[tabla].filter(filtro).map((fila) => ({ ...fila }));
  }

  function obtener(tabla, id) {
    const fila = db[tabla].find((f) => f.id === Number(id));
    return fila ? { ...fila } : null;
  }

  function insertar(tabla, datos) {
    const fila = { id: siguienteId(tabla), ...datos };
    db[tabla].push(fila);
    guardar();
    return { ...fila };
  }

  function actualizar(tabla, id, cambios) {
    const fila = db[tabla].find((f) => f.id === Number(id));
    if (!fila) return null;
    Object.assign(fila, cambios);
    guardar();
    return { ...fila };
  }

  function eliminar(tabla, id) {
    const antes = db[tabla].length;
    db[tabla] = db[tabla].filter((f) => f.id !== Number(id));
    guardar();
    return db[tabla].length < antes;
  }

  // Simula una transacción: si la función falla, se restaura el estado anterior.
  // Así se representa el comportamiento de @Transactional del backend (todo o nada).
  function transaccion(fn) {
    const copia = JSON.stringify(db);
    try {
      const resultado = fn();
      guardar();
      return resultado;
    } catch (error) {
      db = JSON.parse(copia);
      throw error;
    }
  }

  function reiniciar() {
    db = crearDatosIniciales();
    guardar();
  }

  return { listar, obtener, insertar, actualizar, eliminar, transaccion, reiniciar };
})();
