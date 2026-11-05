# Pruebas de integración · FinanTask (Fase 4)

Las pruebas verifican el flujo completo: interfaz → API (PHP) → base de datos (MySQL) → respuesta.

## Cómo ejecutarlas

1. Iniciar **Apache** y **MySQL** en XAMPP y cargar `database/schema.sql` y `database/datos_prueba.sql`.
   Para las pruebas 5 y 6 (IA), iniciar también el servicio inteligente (ver `servicio_inteligente/README.md`).
2. Abrir `http://localhost/finantask/tests/pruebas_integracion.html`.
3. Pulsar **Ejecutar pruebas**.
4. Tomar una captura de la tabla de resultados (sirve como evidencia) y copiar el resultado obtenido de cada prueba a la tabla de abajo.

La página inicia sesión con el usuario de prueba, ejecuta las pruebas y al final elimina el registro que creó, por lo que se puede ejecutar varias veces.

## Resultados

Fecha de ejecución: ____ / ____ / ________  ·  Ejecutadas por: ______________________

| N.º | Escenario | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| 1 | Registrar una obligación desde la interfaz y comprobar que queda almacenada en MySQL | El servidor responde 201 con la obligación creada (id y estado PENDIENTE) y al consultarla por id se recupera de la base | | |
| 2 | Consultar las obligaciones y verificar que se visualizan correctamente | La lista trae todos los campos de cada obligación e incluye la creada en la prueba 1 | | |
| 3 | Enviar información inválida (valor negativo y fecha vacía) | El backend rechaza la petición con 400, devuelve los mensajes de error y no guarda ningún registro | | |
| 4 | Simular un error de comunicación (el servidor no responde) | El cliente informa "No se pudo conectar con el servidor..." sin romperse | | |
| 5 (IA) | Pedir al servicio de IA la prioridad de una obligación de $90.000 que vence en 2 días (requiere el servicio inteligente iniciado) | Responde 200 con prioridad ALTA, probabilidades que suman 1 y la versión del modelo | | |
| 6 (IA) | Enviar datos inválidos al servicio de IA (valor negativo y fecha inexistente) | El backend responde 400 con mensajes claros, sin consultar el modelo | | |
| 7 (extra) | Acceder sin sesión y con contraseña incorrecta | Responde 401 en ambos casos | | |

## Pruebas manuales complementarias (con la aplicación abierta)

Estas pruebas se hacen desde la interfaz y sirven para capturar evidencia visual.

| N.º | Escenario | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| M1 | Crear una obligación desde **Nueva obligación** y revisarla en phpMyAdmin (tabla `obligaciones`) | Aparece en el listado y como una fila nueva en la tabla | | |
| M2 | Registrar un pago desde el detalle de una obligación y revisar `historial_pagos` | Estado PAGADA y una fila nueva en el historial | | |
| M3 | Intentar guardar una obligación con valor 0 o sin nombre | El formulario muestra el mensaje de error y no se guarda | | |
| M4 | Detener **MySQL** en el panel de XAMPP y recargar el listado de obligaciones | Se muestra "No hay conexión con la base de datos..." con el botón Reintentar | | |
| M5 | Detener **Apache** y recargar | Se muestra "No se pudo conectar con el servidor..." | | |
| M6 | Intentar eliminar una obligación que ya tiene pagos | Se informa que no se puede eliminar y el registro se conserva | | |
| M7 | En **Nueva obligación**, escribir valor y fecha límite y pulsar **Sugerir prioridad con IA** | Aparece la prioridad sugerida con su confianza y el botón Aplicar | | |
| M8 | Detener el servicio inteligente (Ctrl+C en la terminal de uvicorn) y pulsar de nuevo **Sugerir prioridad con IA** | Se muestra "El servicio de inteligencia artificial no está disponible..." y el formulario sigue funcionando | | |
| M9 | Pulsar **Sugerir prioridad con IA** sin escribir valor ni fecha | Se pide completar el valor y la fecha, sin llamar al servicio | | |
