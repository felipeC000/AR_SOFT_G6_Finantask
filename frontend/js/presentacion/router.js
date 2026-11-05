// js/presentacion/router.js
// CAPA DE PRESENTACIÓN (UI)
// Enrutador por hash (#/ruta). Decide qué pantalla mostrar según la URL y si
// la ruta necesita sesión iniciada. Las rutas pueden tener parámetros (:id).

const Router = (() => {
  const RUTAS = [
    { patron: "#/login", pagina: () => LoginPage, publica: true },
    { patron: "#/registro", pagina: () => RegistroPage, publica: true },
    { patron: "#/dashboard", pagina: () => DashboardPage },
    { patron: "#/obligaciones", pagina: () => ObligacionesPage },
    { patron: "#/obligaciones/nueva", pagina: () => ObligacionFormPage },
    { patron: "#/obligaciones/:id/editar", pagina: () => ObligacionFormPage },
    { patron: "#/obligaciones/:id", pagina: () => DetalleObligacionPage },
    { patron: "#/vencidas", pagina: () => ObligacionesPage, params: { estado: "VENCIDA" } },
    { patron: "#/pagos", pagina: () => PagosPage },
    { patron: "#/reportes", pagina: () => ReportesPage },
  ];

  // Compara "#/obligaciones/5/editar" con "#/obligaciones/:id/editar" y saca { id: "5" }
  function coincidir(patron, ruta) {
    const p = patron.split("/");
    const r = ruta.split("/");
    if (p.length !== r.length) return null;
    const params = {};
    for (let i = 0; i < p.length; i++) {
      if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(r[i]);
      else if (p[i] !== r[i]) return null;
    }
    return params;
  }

  // Dibuja una pantalla. Si tarda, muestra "Cargando…"; si falla, muestra la pantalla de error.
  async function dibujar(app, tarea) {
    const temporizador = setTimeout(() => {
      app.innerHTML = `<div class="cargando" role="status">Cargando…</div>`;
    }, 300);
    try {
      await tarea();
      window.scrollTo(0, 0);
    } catch (error) {
      if (error instanceof ErrorApi && error.estado === 401) return; // la sesión venció: ya se redirigió al login
      ErrorPage.render(app, error);
    } finally {
      clearTimeout(temporizador);
    }
  }

  async function resolver() {
    const app = document.getElementById("app");
    if (!window.location.hash) history.replaceState(null, "", "#/login");
    const ruta = (window.location.hash || "#/login").split("?")[0];
    const autenticado = AuthService.estaAutenticado();

    // Las rutas fijas van antes que las de parámetros (nueva antes que :id)
    for (const r of RUTAS) {
      const params = coincidir(r.patron, ruta);
      if (!params) continue;
      if (!r.publica && !autenticado) return Dom.ir("#/login");
      if (r.publica && autenticado) return Dom.ir("#/dashboard");
      return dibujar(app, () => r.pagina().render(app, { ...(r.params || {}), ...params }));
    }

    if (!autenticado) return Dom.ir("#/login");
    NoEncontradaPage.render(app);
  }

  let arrancado = false;

  // Al abrir la aplicación se consulta al servidor si ya hay una sesión activa
  async function iniciar() {
    const app = document.getElementById("app");
    if (!arrancado) {
      arrancado = true;
      window.addEventListener("hashchange", resolver);
      ApiCliente.alSesionExpirada = () => {
        AuthService.limpiar();
        Toast.mostrar("Tu sesión expiró. Inicia sesión de nuevo.", "error");
        Dom.ir("#/login");
      };
    }
    try {
      await AuthService.restaurar();
    } catch (error) {
      ErrorPage.render(app, error); // sin conexión con el servidor o con la base de datos
      return;
    }
    resolver();
  }

  // Botón "Reintentar" de la pantalla de error
  function reintentar() {
    return AuthService.estaAutenticado() ? resolver() : iniciar();
  }

  return { iniciar, reintentar };
})();
