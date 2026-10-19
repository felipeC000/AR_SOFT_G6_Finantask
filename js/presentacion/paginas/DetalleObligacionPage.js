// js/presentacion/paginas/DetalleObligacionPage.js
// CAPA DE PRESENTACIÓN (UI)
// Detalle de una obligación: datos, registro de pago (RF08) y sus pagos (RF10).

const DetalleObligacionPage = {
  render(container, params) {
    const o = ObligacionService.obtener(params.id);
    if (!o) return NoEncontradaPage.render(container);

    const pagos = ObligacionService.historialPagos(o.id);
    const dias = Reglas.diasParaVencer(o);
    const pagada = o.estado === "PAGADA";

    Layout.render(container, {
      activo: "obligaciones",
      titulo: o.nombre,
      subtitulo: `<a href="#/obligaciones" class="back-link">${Iconos.volver} Volver a obligaciones</a>`,
      acciones: pagada ? "" : `
        <a href="#/obligaciones/${o.id}/editar" class="btn btn-secondary">${Iconos.editar} Editar</a>
        <button class="btn btn-ghost btn-ghost--danger" data-action="eliminar">${Iconos.papelera} Eliminar</button>`,
      contenido: `
        <div class="detail-grid">
          <section class="panel">
            <dl class="detail-list">
              <div><dt>Estado</dt><dd>${Badge.estado(o.estado)} ${pagada ? "" : `<small class="muted">${Formato.diasRestantes(dias)}</small>`}</dd></div>
              <div><dt>Valor</dt><dd class="detail-amount">${Formato.moneda(o.valor)}</dd></div>
              <div><dt>Fecha límite</dt><dd>${Formato.fecha(o.fechaLimite)}</dd></div>
              <div><dt>Prioridad</dt><dd>${Badge.prioridad(o.prioridad)}</dd></div>
              <div><dt>Categoría</dt><dd>${Formato.escape(o.categoria)}</dd></div>
              <div><dt>Descripción</dt><dd>${Formato.escape(o.descripcion) || '<span class="muted">Sin descripción</span>'}</dd></div>
              <div><dt>Registrada</dt><dd>${Formato.fecha(o.fechaCreacion)} · ${o.origen === "ASISTENTE_IA" ? "con asistente IA" : "manual"}</dd></div>
              <div><dt>Última actualización</dt><dd>${Formato.fecha(o.fechaActualizacion)}</dd></div>
            </dl>
          </section>

          <section>
            ${pagada
              ? `<div class="panel panel--ok"><h2>${Iconos.check} Obligación pagada</h2><p class="hint">El pago quedó registrado en el historial.</p></div>`
              : PagoForm.html(o)}
          </section>
        </div>

        <section class="panel">
          <div class="panel-head"><h2>${Iconos.pagos} Pagos de esta obligación</h2></div>
          ${PagosTable.html(pagos, { mostrarObligacion: false })}
        </section>
      `,
    });

    PagoForm.bind(container, (datos) => {
      const r = ObligacionService.registrarPago(o.id, datos);
      if (r.ok) {
        Toast.mostrar("Pago registrado.");
        DetalleObligacionPage.render(container, params);
      }
      return r;
    });

    Dom.onAction(container, "eliminar", async () => {
      const si = await ConfirmDialog.abrir({
        titulo: "Eliminar obligación",
        mensaje: `¿Seguro que quieres eliminar "${o.nombre}"?`,
        textoConfirmar: "Eliminar",
        peligro: true,
      });
      if (!si) return;
      const r = ObligacionService.eliminar(o.id);
      Toast.mostrar(r.ok ? "Obligación eliminada." : r.mensaje, r.ok ? "ok" : "error");
      if (r.ok) Dom.ir("#/obligaciones");
    });
  },
};
