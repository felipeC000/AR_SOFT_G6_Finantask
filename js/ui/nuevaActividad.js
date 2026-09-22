// js/ui/nuevaActividad.js
// Vista + Controlador de la pantalla "Nueva actividad"

const UINuevaActividad = {
  render(container) {
    container.innerHTML = UILayout.shell(
      "nueva",
      `
        <h1>Nueva actividad financiera</h1>
        <p class="page-sub">Registra un pago o una obligacion por cumplir.</p>

        <form id="nueva-form" class="form-card">
          <label for="nombre">Nombre</label>
          <input type="text" id="nombre" placeholder="Ej: Internet, Matricula, Tarjeta de credito" />

          <label for="categoria">Categoria</label>
          <select id="categoria">
            <option>Servicios</option>
            <option>Educacion</option>
            <option>Creditos y tarjetas</option>
            <option>Suscripciones</option>
            <option>Otros</option>
          </select>

          <label for="descripcion">Descripcion (opcional)</label>
          <input type="text" id="descripcion" placeholder="Ej: Factura del mes" />

          <label for="valor">Valor</label>
          <input type="number" id="valor" min="0" placeholder="0" />

          <label for="fechaLimite">Fecha limite</label>
          <input type="date" id="fechaLimite" />

          <label for="prioridad">Prioridad</label>
          <select id="prioridad">
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>

          <div class="form-errors" id="form-errors"></div>

          <button type="submit" class="btn-primary">Guardar actividad</button>
        </form>
      `
    );

    UILayout.bindNav(container);

    const form = container.querySelector("#nueva-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const datos = {
        nombre: container.querySelector("#nombre").value,
        categoria: container.querySelector("#categoria").value,
        descripcion: container.querySelector("#descripcion").value,
        valor: container.querySelector("#valor").value,
        fechaLimite: container.querySelector("#fechaLimite").value,
        prioridad: container.querySelector("#prioridad").value,
      };
      const resultado = Services.crearActividad(datos);
      if (!resultado.ok) {
        container.querySelector("#form-errors").innerHTML = resultado.errores
          .map((err) => `<p class="form-error">${err}</p>`)
          .join("");
        return;
      }
      window.location.hash = "#/lista";
    });
  },
};
