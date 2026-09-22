// js/ui/listaActividades.js
// Vista + Controlador de la pantalla "Lista de actividades"

const UILista = {
  render(container) {
    const actividades = Services.obtenerActividades();

    container.innerHTML = UILayout.shell(
      "lista",
      `
        <h1>Tus actividades</h1>
        <p class="page-sub">${actividades.length} registradas</p>

        <table class="activities-table">
          <thead>
            <tr>
              <th>Nombre</th><th>Categoria</th><th>Valor</th><th>Fecha limite</th><th>Prioridad</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${actividades
              .map(
                (a) => `
              <tr>
                <td>${a.nombre}</td>
                <td>${a.categoria}</td>
                <td>${formatoMoneda(a.valor)}</td>
                <td>${formatoFecha(a.fechaLimite)}</td>
                <td><span class="badge badge--prioridad-${a.prioridad.toLowerCase()}">${a.prioridad}</span></td>
                <td><span class="badge badge--estado-${a.estado.toLowerCase()}">${a.estado}</span></td>
                <td class="actions-cell">
                  ${
                    a.estado !== "Pagado"
                      ? `<button class="btn-link" data-action="pagar" data-id="${a.id}">Marcar pagado</button>`
                      : ""
                  }
                  <button class="btn-link btn-link--danger" data-action="eliminar" data-id="${a.id}">Eliminar</button>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `
    );

    UILayout.bindNav(container);

    container.querySelectorAll("[data-action='pagar']").forEach((btn) => {
      btn.addEventListener("click", () => {
        Services.cambiarEstado(btn.dataset.id, "Pagado");
        UILista.render(container);
      });
    });

    container.querySelectorAll("[data-action='eliminar']").forEach((btn) => {
      btn.addEventListener("click", () => {
        Services.eliminarActividad(btn.dataset.id);
        UILista.render(container);
      });
    });
  },
};
