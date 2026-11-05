// js/presentacion/paginas/DashboardPage.js
// CAPA DE PRESENTACIÓN (UI)
// Pantalla principal: indicadores, alertas de vencimiento (RF11) y próximos pagos.

const DashboardPage = {
  async render(container) {
    const usuario = AuthService.usuarioActual();
    const { resumen, alertas, proximos } = await ResumenService.tablero();
    const primerNombre = (usuario.nombre || "").split(" ")[0];

    Layout.render(container, {
      activo: "dashboard",
      titulo: "Resumen",
      subtitulo: `Hola, ${Formato.escape(primerNombre)}. Hoy es ${Formato.fecha(Fechas.hoyISO())}.`,
      acciones: `<a href="#/obligaciones/nueva" class="btn btn-primary">Nueva obligación</a>`,
      contenido: `
        ${StatCard.fila([
          { etiqueta: "Por pagar", valor: Formato.moneda(resumen.totalPendiente), detalle: `${resumen.cantidadPendientes} pendiente(s)` },
          { etiqueta: "Vencido", valor: Formato.moneda(resumen.totalVencido), detalle: `${resumen.cantidadVencidas} obligación(es)`, variante: resumen.cantidadVencidas ? "alerta" : "normal" },
          { etiqueta: "Pagado", valor: Formato.moneda(resumen.totalPagado), detalle: `${resumen.cantidadPagadas} pagada(s)`, variante: "ok" },
        ])}

        <div class="dashboard-grid">
          <section class="panel">
            <div class="panel-head">
              <h2>Requieren atención</h2>
              <span class="panel-note">Vencidas y las que vencen en ${Reglas.DIAS_ALERTA} días</span>
            </div>
            ${AlertList.html(alertas, { vacio: "No hay obligaciones urgentes." })}
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>Próximos 30 días</h2>
              <a href="#/obligaciones" class="panel-link">Ver todas</a>
            </div>
            ${AlertList.html(proximos, { vacio: "No tienes otros pagos en los próximos 30 días.", tipo: "proximo" })}
          </section>
        </div>
      `,
    });
  },
};
