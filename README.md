# FinanTask

Prototipo de interfaz de **FinanTask**, un sistema para gestionar obligaciones financieras personales: registrar lo que se debe pagar, saber qué está por vencer, marcar los pagos y ver un resumen del mes.

Proyecto académico de la asignatura Arquitectura de Software, Ingeniería de Software, Universidad Manuela Beltrán.

## Cómo ejecutarlo

No necesita instalar nada.

1. Clonar el repositorio.
2. Abrir `index.html` en el navegador (Chrome, Firefox o Edge). También funciona con la extensión **Live Server** de VS Code.
3. En la pantalla de inicio de sesión usar el botón **"Usar cuenta de prueba"** (demo@finantask.co, cualquier contraseña) o crear una cuenta nueva.

> Los datos se guardan en el `localStorage` del navegador. Para volver a los datos de ejemplo se puede borrar el almacenamiento del sitio desde las herramientas del navegador.

## Qué hay en esta versión

| Pantalla | Ruta | Requerimiento del documento maestro |
|---|---|---|
| Iniciar sesión | `#/login` | RF02 (simulado) |
| Crear cuenta | `#/registro` | RF01 (simulado) |
| Resumen (pantalla principal) | `#/dashboard` | RF11 alertas de vencimiento, indicadores generales |
| Obligaciones (listado con filtros) | `#/obligaciones` | RF04 consultar, RF06 eliminar, RF09 vencidas automáticas |
| Nueva obligación | `#/obligaciones/nueva` | RF03 registrar, RF07 prioridad |
| Editar obligación | `#/obligaciones/:id/editar` | RF05 modificar |
| Detalle y registro de pago | `#/obligaciones/:id` | RF08 registrar pago, RF10 pagos de la obligación |
| Historial de pagos | `#/pagos` | RF10 |
| Resumen mensual | `#/reportes` | RF12 |
| Asistente de registro con IA | `#/asistente` | RF13 (propuesto, extracción simulada) |

Lo que **no** incluye todavía (según el alcance de esta entrega): base de datos, backend, autenticación real ni conexión con el servicio de IA.

## Organización del código: tres capas

El código está dividido en las tres capas de la arquitectura propuesta en el documento maestro. Cada capa tiene su propia carpeta y **solo usa a la capa que está debajo**: la presentación le pide cosas a la lógica, y la lógica es la única que habla con los datos.

```
            ┌──────────────────────────────────────────┐
            │  CAPA DE PRESENTACIÓN (UI)               │  js/presentacion/  +  assets/css/
            │  pantallas, componentes, navegación      │
            └───────────────────┬──────────────────────┘
                                │ llama a los servicios
            ┌───────────────────▼──────────────────────┐
            │  CAPA DE LÓGICA                          │  js/logica/
            │  reglas de negocio + servicios           │
            └───────────────────┬──────────────────────┘
                                │ guarda y consulta
            ┌───────────────────▼──────────────────────┐
            │  CAPA DE DATOS                           │  js/datos/
            │  almacenamiento y datos iniciales        │
            └──────────────────────────────────────────┘
```

```
finantask/
├── index.html                          Punto de entrada (carga las capas en orden)
├── assets/                             Recursos de la capa de presentación
│   ├── css/
│   │   ├── base.css                    Variables de diseño y estilos generales
│   │   ├── layout.css                  Menú lateral, contenido, responsive
│   │   ├── components.css              Botones, campos, tarjetas, tablas, insignias, modal
│   │   └── pages.css                   Ajustes propios de cada pantalla
│   └── img/logo.svg
└── js/
    ├── datos/                          ── 1. CAPA DE DATOS
    │   ├── datosIniciales.js           Datos de ejemplo (usuarios, categorías, obligaciones, pagos)
    │   └── almacen.js                  Guardar, consultar, actualizar, eliminar (+ transacción)
    │
    ├── logica/                         ── 2. CAPA DE LÓGICA
    │   ├── reglas.js                   Validaciones, estados, vencimientos, filtros, resúmenes
    │   └── servicios/
    │       ├── authService.js          Registro, inicio y cierre de sesión (simulado)
    │       ├── obligacionService.js    Crear, consultar, editar, eliminar, registrar pago
    │       ├── resumenService.js       Indicadores, alertas y resumen mensual
    │       └── asistenteIAService.js   Extracción de datos (simulada) para el asistente
    │
    ├── presentacion/                   ── 3. CAPA DE PRESENTACIÓN (UI)
    │   ├── componentes/                Piezas visuales reutilizables
    │   │   ├── Layout.js, Sidebar.js, PageHeader.js, AuthLayout.js
    │   │   ├── StatCard.js, AlertList.js, CategoryBars.js
    │   │   ├── ObligacionesTable.js, PagosTable.js, FiltrosBar.js
    │   │   ├── ObligacionForm.js, PagoForm.js, FormErrors.js
    │   │   └── Badge.js, EmptyState.js, Feedback.js, Iconos.js
    │   ├── paginas/                    Una pantalla por archivo
    │   ├── utilidades/                 Formato de moneda/fechas y atajos del DOM
    │   └── router.js                   Navegación entre pantallas y rutas protegidas
    │
    ├── compartido/fechas.js            Manejo de fechas que usan las tres capas
    └── app.js                          Arranque de la aplicación
```

Cada archivo empieza con un comentario que dice a qué capa pertenece (`// CAPA DE DATOS`, `// CAPA DE LÓGICA`, `// CAPA DE PRESENTACIÓN (UI)`).

### Relación con la arquitectura del documento maestro

| Capa en el prototipo | Carpeta | Capas del documento maestro | Tecnología final |
|---|---|---|---|
| Presentación (UI) | `js/presentacion/`, `assets/` | Presentación (Vista) | React |
| Lógica | `js/logica/` | Servicios (Controlador) + Lógica de negocio | Spring Boot (@RestController, @Service) |
| Datos | `js/datos/` | Acceso a datos + Base de datos | Spring Data JPA + PostgreSQL |

En el documento maestro la arquitectura tiene cinco capas. En el prototipo se agrupan en tres porque todavía no hay backend: los servicios y las reglas viven juntos en la capa de lógica, y el acceso a datos y el almacenamiento (localStorage) en la capa de datos.

Algunas decisiones que vale la pena mencionar:

- **Las pantallas no tocan los datos directamente.** Siempre pasan por un servicio. Así, cuando exista el backend, solo hay que cambiar `almacen.js` y los servicios para que llamen a la API.
- **Componentes reutilizables.** El mismo `ObligacionForm` se usa para crear, editar y revisar lo que propone el asistente de IA. `ObligacionesTable`, `AlertList` y `StatCard` se usan en varias pantallas.
- **Registrar un pago es "todo o nada".** `Almacen.transaccion()` guarda el pago y cambia el estado juntos; si algo falla se deshace todo, como hará `@Transactional` en el backend.
- **Estados y nombres iguales al modelo de datos:** `PENDIENTE`, `PAGADA`, `VENCIDA`; prioridad `ALTA`, `MEDIA`, `BAJA`; origen `MANUAL` o `ASISTENTE_IA`.
- **Seguridad básica en la interfaz:** todo texto escrito por el usuario se escapa antes de mostrarse (`Formato.escape`) y cada consulta filtra por el usuario de la sesión.
- Se usa HTML, CSS y JavaScript sin frameworks para este prototipo. La separación en componentes y páginas está pensada para que la migración a React sea directa.

## Cambios respecto a la versión anterior

- Se reorganizó el código en tres capas (datos, lógica y presentación) y se dividió la interfaz en componentes.
- "Actividades" pasó a llamarse **obligaciones**, igual que en el documento maestro.
- Pantallas nuevas: registro de cuenta, detalle con registro de pago, edición, historial de pagos, resumen mensual y asistente de IA (prototipo).
- Listado con búsqueda, filtros por estado, categoría, prioridad y fechas, y orden.
- Confirmación antes de eliminar y mensajes de éxito o error.
- No se permite eliminar una obligación que ya tiene pagos (se conserva el historial).
- Corrección: las fechas se mostraban un día antes por la zona horaria; ahora se leen como fecha local.
- Diseño responsive con menú desplegable en celular.
- Los datos y la sesión se mantienen al recargar la página.

## Equipo

- Brian Alexander Montes
- Juan Felipe Cáceres Espinosa
- Jamilton Fernando Benavides
