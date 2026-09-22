// js/ui/dashboard.js
// Vista + Controlador de la pantalla de Resumen (Dashboard)

const UIDashboard = {
  render(container) {
    const resumen = Services.obtenerResumen();
    const proximos = Services.obtenerProximosPagos();

    container.innerHTML = UILayout.shell(
      "dashboard",
      `
        <h1>Resumen</h1>
        <p class="page-sub">Asi estan tus obligaciones financieras hoy.</p>

        <div class="summary-row">
          <div class="summary-item">
            <span class="summary-label">Pendiente</span>
            <span class="summary-value">${formatoMoneda(resumen.totalPendiente)}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Pagado</span>
            <span class="summary-value">${formatoMoneda(resumen.totalPagado)}</span>
          </div>
          <div class="summary-item summary-item--alert">
            <span class="summary-label">Vencidos</span>
            <span class="summary-value">${resumen.vencidas}</span>
          </div>
        </div>

        <h2>Proximos a vencer</h2>
        ${
          proximos.length === 0
            ? `<p class="empty-state">No tienes pagos proximos por ahora.</p>`
            : `<ul class="upcoming-list">
                ${proximos
                  .map(
                    (a) => `
                  <li>
                    <span class="upcoming-name">${a.nombre}</span>
                    <span class="upcoming-days">${a.diasRestantes < 0 ? "Vencido" : `vence en ${a.diasRestantes} dia(s)`}</span>
                    <span class="upcoming-value">${formatoMoneda(a.valor)}</span>
                  </li>
                `
                  )
                  .join("")}
              </ul>`
        }
      `
    );

    UILayout.bindNav(container);
  },
};
