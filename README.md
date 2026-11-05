# FinanTask

Sistema web para gestionar **obligaciones financieras personales**: registrar lo que se debe pagar, saber qué está por vencer, registrar los pagos y ver un resumen del mes.

Proyecto académico de la asignatura Arquitectura de Software, Ingeniería de Software, Universidad Manuela Beltrán.

**Fase 4: integración de frontend, backend y base de datos.** La interfaz ya no guarda los datos en el navegador: los envía a una API en PHP que los almacena en MySQL.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Frontend | HTML, CSS y JavaScript (sin frameworks), organizado en componentes |
| Backend | PHP 8 (API REST en JSON) con PDO |
| Base de datos | MySQL / MariaDB (InnoDB), administrada con phpMyAdmin |
| Servicio de IA | Python 3.10 a 3.12, TensorFlow/Keras y FastAPI (carpeta `servicio_inteligente/`) |
| Entorno de ejecución | XAMPP (Apache + MySQL + PHP + phpMyAdmin) |

## Cómo ejecutarlo (XAMPP)

1. **Instalar XAMPP** e iniciar **Apache** y **MySQL** desde su panel de control.
2. **Copiar el proyecto** en la carpeta `htdocs` de XAMPP, de modo que quede en `C:\xampp\htdocs\finantask\`.
3. **Crear la base de datos.** Abrir `http://localhost/phpmyadmin`, ir a la pestaña **SQL** y ejecutar, en este orden, el contenido de:
   1. `database/schema.sql` (crea la base `finantask` y las tablas)
   2. `database/datos_prueba.sql` (carga datos de ejemplo)
4. **Configurar la conexión.** En la carpeta `backend/`, copiar `config.example.php` como `config.php`. Con XAMPP por defecto no hay que cambiar nada (usuario `root`, sin contraseña). `config.php` no se sube a GitHub.
5. **Abrir la aplicación** en `http://localhost/finantask/frontend/`.
6. Iniciar sesión con la cuenta de prueba: **demo@finantask.co** / contraseña **demo1234**, o crear una cuenta nueva.
7. *(Opcional, para el botón **Sugerir prioridad con IA**)* iniciar el servicio inteligente siguiendo [`servicio_inteligente/README.md`](servicio_inteligente/README.md). Sin él, todo lo demás funciona y el botón avisa que el servicio no está disponible.

> Importante: la aplicación debe abrirse por `http://localhost/...`. Si se abre el archivo `index.html` con doble clic (`file://`) o con otro servidor, el navegador no podrá comunicarse con el backend y se mostrará el aviso "No se pudo conectar con el servidor".

## Arquitectura

Frontend, backend y base de datos están separados en carpetas distintas. El navegador **nunca** habla con MySQL: toda la información pasa por la API.

```
 NAVEGADOR (frontend/)                    SERVIDOR (backend/)                     MySQL
┌──────────────────────────┐   HTTP/JSON  ┌────────────────────────────────┐   SQL  ┌──────────────┐
│ Presentación (pantallas) │ ───────────► │ Controlador (recibe, responde) │ ─────► │ usuarios     │
│ Lógica (servicios)       │              │ Servicio (reglas de negocio)   │        │ categorias   │
│ Datos (ApiCliente)       │ ◄─────────── │ Repositorio (consultas SQL)    │ ◄───── │ obligaciones │
└──────────────────────────┘              └────────────────────────────────┘        │ historial_   │
                                                                                    │   pagos      │
                                                                                    └──────────────┘
```

El **servicio de inteligencia artificial** es un componente aparte (Python, TensorFlow y FastAPI) que solo consulta el backend:

```
Navegador → Backend PHP (POST /ia/prioridad) → Servicio inteligente (POST /predecir) → Modelo TensorFlow
```

Flujo de una operación (por ejemplo, registrar un pago):

1. El usuario completa el formulario y pulsa **Registrar pago** (frontend).
2. `ObligacionService` valida lo básico y `ApiCliente` envía `POST /obligaciones/{id}/pagos` al backend.
3. El **controlador** recibe la petición y llama al **servicio**, que valida los datos, comprueba que la obligación sea del usuario y que no esté pagada.
4. El **repositorio** guarda el pago y cambia el estado a PAGADA en **una sola transacción** (si algo falla, no se guarda nada).
5. El backend responde con JSON (201 si salió bien, o un código de error con el mensaje).
6. El frontend muestra el resultado: confirmación o el error en el formulario.

### Relación con la arquitectura del documento maestro

| Capa del documento maestro | Dónde está en el proyecto |
|---|---|
| Presentación (Vista) | `frontend/js/presentacion/`, `frontend/assets/` |
| Servicios (Controlador) | `backend/controladores/` |
| Lógica de negocio | `backend/servicios/` (y reglas de consulta en `frontend/js/logica/`) |
| Acceso a datos | `backend/repositorios/` y `backend/nucleo/Conexion.php` |
| Base de datos | MySQL: `database/schema.sql` |

La estructura Controlador → Servicio → Repositorio es la misma que propone el documento maestro (en Spring Boot serían `@RestController`, `@Service` y Spring Data); aquí se implementa con PHP porque es la tecnología disponible en el entorno XAMPP.

### Decisión tecnológica: PHP y MySQL

El documento maestro plantea Spring Boot y PostgreSQL como tecnologías finales. Para esta fase se eligió **PHP con MySQL sobre XAMPP** porque permite ejecutar frontend, backend y base de datos en un solo entorno y administrar los datos con phpMyAdmin. La separación en capas y el modelo relacional se mantienen, de modo que la migración a la tecnología final solo reemplaza la implementación del backend y la base.

## Estructura del repositorio

```
finantask/
├── frontend/                     Interfaz de usuario
│   ├── index.html
│   ├── assets/                   Estilos (css/) e imágenes
│   └── js/
│       ├── datos/                Cliente de la API (config.js, apiCliente.js)
│       ├── logica/               Reglas de consulta y servicios (llaman a la API)
│       ├── presentacion/         Componentes, pantallas y navegación
│       ├── compartido/fechas.js
│       └── app.js
├── backend/                      API REST en PHP
│   ├── index.php                 Punto de entrada y tabla de rutas
│   ├── config.example.php        Plantilla de configuración (copiar como config.php)
│   ├── controladores/            Reciben la petición y devuelven JSON
│   ├── servicios/                Reglas de negocio, validación e integración con la IA
│   ├── repositorios/             Consultas SQL (PDO, consultas preparadas)
│   └── nucleo/                   Conexión, sesión, respuestas, errores, fechas
├── servicio_inteligente/         Servicio de IA (Python + TensorFlow + FastAPI)
│   ├── entrenar_modelo.py        Entrena y evalúa el modelo
│   ├── api.py                    API del modelo (/predecir)
│   ├── preprocesamiento.py       Normalización compartida
│   ├── modelo_prioridad.keras    Modelo entrenado
│   └── README.md                 Instalación, endpoints, métricas y limitaciones
├── database/
│   ├── schema.sql                Crea la base de datos y las tablas
│   └── datos_prueba.sql          Datos de ejemplo
├── tests/
│   ├── pruebas_integracion.html  Ejecuta las pruebas de integración en el navegador
│   └── PRUEBAS_INTEGRACION.md    Registro de resultados de las pruebas
├── README.md
└── .gitignore
```

## Base de datos

Entidades principales y relaciones (todas las tablas usan InnoDB y claves foráneas):

| Tabla | Descripción | Relaciones |
|---|---|---|
| `usuarios` | Cuentas del sistema (contraseña cifrada con bcrypt) | |
| `categorias` | Clasificación de las obligaciones | |
| `obligaciones` | Pagos que debe hacer cada usuario: valor, fecha límite, prioridad, estado | `id_usuario` → usuarios, `id_categoria` → categorias |
| `historial_pagos` | Pagos realizados | `id_obligacion` → obligaciones |

Tipos de datos: valores monetarios en `DECIMAL(14,2)`, fechas en `DATE`, y `ENUM` para estado (`PENDIENTE`, `PAGADA`, `VENCIDA`), prioridad (`ALTA`, `MEDIA`, `BAJA`) y origen (`MANUAL`, `ASISTENTE_IA`). Hay restricciones `CHECK` para que el valor siempre sea mayor que 0.

## API REST

URL base: `http://localhost/finantask/backend/index.php`. Todas las respuestas son JSON; los errores tienen la forma `{ "error": "mensaje", "errores": ["..."] }`.

| Método y ruta | Descripción | Respuestas |
|---|---|---|
| `POST /auth/registro` | Crear cuenta (inicia sesión) | 201, 400, 409 |
| `POST /auth/login` | Iniciar sesión | 200, 400, 401 |
| `POST /auth/logout` | Cerrar sesión | 204 |
| `GET /auth/yo` | Usuario de la sesión actual | 200, 401 |
| `GET /categorias` | Listar categorías | 200 |
| `GET /obligaciones` | Listar las obligaciones del usuario | 200 |
| `GET /obligaciones/{id}` | Consultar una obligación | 200, 404 |
| `POST /obligaciones` | Registrar una obligación | 201, 400 |
| `PUT /obligaciones/{id}` | Modificar una obligación | 200, 400, 404, 409 |
| `DELETE /obligaciones/{id}` | Eliminar (no si tiene pagos) | 204, 404, 409 |
| `POST /obligaciones/{id}/pagos` | Registrar un pago (transacción) | 201, 400, 404, 409 |
| `GET /pagos` | Historial de pagos (`?idObligacion=`) | 200 |
| `POST /ia/prioridad` | Prioridad sugerida por el modelo de IA (`valor`, `fechaLimite`) | 200, 400, 429, 503 |
| `GET /ia/estado` | Ficha del modelo (versión, métricas, limitaciones) | 200, 503 |

Las rutas distintas de `/auth/*` exigen sesión iniciada (401 si no la hay).

### Reglas que aplica el backend

- **Validación de los datos recibidos:** nombre, categoría existente, valor mayor que 0, fecha real (se rechaza, por ejemplo, 2026-02-31), prioridad válida. Se valida otra vez aunque el formulario ya lo haya hecho.
- **Obligaciones vencidas (RF09):** las pendientes con fecha límite pasada pasan a VENCIDA automáticamente al consultarlas.
- **Registro de pago (RF08):** guarda el pago y cambia el estado en una transacción; no permite pagar dos veces la misma obligación ni fechas futuras.
- **Eliminación (RF06):** no se puede eliminar una obligación con pagos registrados.
- **Pertenencia:** cada usuario solo ve y modifica sus propias obligaciones.
- **Servicio de IA:** el backend valida los datos, calcula los días para el vencimiento, limita a 30 consultas por minuto por sesión y, si el servicio no responde, contesta 503 con un mensaje claro.
- **Manejo de errores:** respuestas JSON con mensajes claros; ante fallos internos o de la base de datos no se exponen detalles técnicos (503 si MySQL no responde).

### Seguridad

- Consultas preparadas con PDO (protección contra inyección SQL).
- Contraseñas con `password_hash` (bcrypt); nunca se guardan ni se devuelven en texto plano.
- Sesión con cookie `HttpOnly` y `SameSite=Lax`; el id de sesión se regenera al iniciar sesión.
- Todo texto escrito por el usuario se escapa antes de mostrarse en pantalla.
- Las credenciales de la base de datos están en `backend/config.php`, que está en `.gitignore`.

## Pantallas y requerimientos

| Pantalla | Ruta | Requerimiento |
|---|---|---|
| Iniciar sesión | `#/login` | RF02 |
| Crear cuenta | `#/registro` | RF01 |
| Resumen (principal) | `#/dashboard` | RF11 |
| Obligaciones (con filtros) | `#/obligaciones` | RF04, RF06, RF09 |
| Nueva obligación | `#/obligaciones/nueva` | RF03, RF07 |
| Editar obligación | `#/obligaciones/:id/editar` | RF05 |
| Detalle y registro de pago | `#/obligaciones/:id` | RF08, RF10 |
| Historial de pagos | `#/pagos` | RF10 |
| Resumen mensual | `#/reportes` | RF12 |
| Asistente de registro con IA | `#/asistente` | RF13 (extracción de texto simulada) |
| Sugerencia de prioridad con IA | botón en `#/obligaciones/nueva`, `#/obligaciones/:id/editar` y `#/asistente` | Servicio de IA (modelo TensorFlow) |

## Pruebas de integración

Abrir `http://localhost/finantask/tests/pruebas_integracion.html` y pulsar **Ejecutar pruebas**. La página realiza las pruebas contra la API y la base reales y muestra el escenario, el resultado esperado, el obtenido y el estado de cada una. Los resultados se registran en [`tests/PRUEBAS_INTEGRACION.md`](tests/PRUEBAS_INTEGRACION.md).

## Lo que no incluye todavía

- La extracción de datos desde el texto de una factura (asistente de registro) sigue **simulada** en el navegador; el servicio de IA implementado sugiere la prioridad de una obligación.
- El modelo de IA se entrenó con datos sintéticos (ver sus limitaciones en `servicio_inteligente/README.md`).
- Autenticación con tokens (JWT) y recuperación de contraseña.
- Despliegue en un servidor de producción.

## Cambios respecto a la versión anterior (Fase 3)

- Se creó el **backend en PHP** (controladores, servicios y repositorios) y la **base de datos MySQL** con su script de creación y datos de prueba.
- El frontend dejó de usar `localStorage`: ahora consume la API (`ApiCliente`), muestra un aviso si no hay conexión y permite reintentar.
- La autenticación es real: contraseñas cifradas y sesión en el servidor (antes era simulada).
- Las reglas de negocio y la validación definitiva pasaron al backend; en el navegador solo quedan las validaciones rápidas de los formularios.
- Se reorganizó el repositorio en `frontend/`, `backend/`, `database/` y `tests/`.
- Se agregó el **servicio de inteligencia artificial** (`servicio_inteligente/`): un modelo de TensorFlow, expuesto con FastAPI, que sugiere la prioridad de una obligación y está integrado en el formulario mediante el backend.

## Equipo

- Brian Alexander Montes
- Juan Felipe Cáceres Espinosa

Docente: Jamilton Fernando Benavides
