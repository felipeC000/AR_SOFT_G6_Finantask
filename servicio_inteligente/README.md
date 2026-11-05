# Servicio inteligente de priorización · FinanTask

Servicio de inteligencia artificial de FinanTask, construido siguiendo la *Guía paso a paso: cómo crear un servicio inteligente de software con TensorFlow*. Un modelo de **TensorFlow/Keras** se expone como una API con **FastAPI** y el backend PHP de FinanTask lo consulta.

**¿Qué hace?** Sugiere la prioridad de una obligación (**BAJA, MEDIA o ALTA**) a partir de dos datos: los **días que faltan para su vencimiento** y su **valor**. En la pantalla *Nueva obligación* aparece el botón **Sugerir prioridad con IA**: el usuario ve la sugerencia, su confianza y decide si la aplica.

## Arquitectura

```
Navegador (frontend)  →  Backend PHP  →  Servicio inteligente (FastAPI)  →  Modelo TensorFlow
  botón "Sugerir"        POST /ia/prioridad    POST /predecir                modelo_prioridad.keras
                         · exige sesión        · valida el rango de datos
                         · valida los datos    · normaliza y predice
                         · limita consultas    · devuelve probabilidades
                         · calcula los días
```

Es la misma cadena de la guía (cliente → API → preprocesamiento → modelo → respuesta) con una capa más: el backend PHP. El navegador nunca llama al servicio de IA directamente; el servicio escucha solo en `127.0.0.1`.

## Archivos

| Archivo | Para qué sirve | Paso de la guía |
|---|---|---|
| `entrenar_modelo.py` | Genera datos sintéticos, entrena la red neuronal, la evalúa y guarda el modelo | 4 y 9 |
| `api.py` | API con FastAPI: carga el modelo y expone `/predecir` | 5 |
| `preprocesamiento.py` | Normalización y regla de etiquetado, compartidas por el entrenamiento y la API | 4 y 5 |
| `modelo_prioridad.keras` | Modelo entrenado (se puede regenerar) | 4 |
| `modelo_prioridad_info.json` | Ficha del modelo: versión, datos, métricas y limitaciones | 9 |
| `probar_api.py` | Envía solicitudes de ejemplo (válidas e inválidas) y muestra las respuestas | 7 |
| `requirements.txt` | Bibliotecas necesarias | 3 |

## Cómo ejecutarlo

Requiere **Python 3.10 a 3.12** (compatible con TensorFlow). Desde la carpeta `servicio_inteligente/`:

**Windows**
```
py -3.12 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**macOS / Linux**
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Después (la carpeta ya incluye un modelo entrenado; este paso es opcional y sirve para regenerarlo):
```
python entrenar_modelo.py
```

Iniciar el servicio (dejar la terminal abierta mientras se use FinanTask):
```
uvicorn api:app --reload
```

- Documentación interactiva y pruebas desde el navegador: <http://127.0.0.1:8000/docs>
- Prueba rápida por consola (con el servicio iniciado): `python probar_api.py`

> Si el puerto 8000 está ocupado, usar `uvicorn api:app --port 8001` y cambiar `ia.url` en `backend/config.php`.

Si al iniciar aparece un error al cargar `modelo_prioridad.keras` (por ejemplo, por diferencias de versión de TensorFlow), ejecutar de nuevo `python entrenar_modelo.py`.

## Endpoints del servicio

| Método y ruta | Descripción |
|---|---|
| `GET /` | Estado del servicio |
| `GET /modelo` | Ficha del modelo (versión, métricas, limitaciones) |
| `POST /predecir` | Prioridad sugerida para una obligación |

Ejemplo:

```json
POST /predecir
{ "dias_para_vencer": 2, "valor": 90000 }

200 OK
{
  "prioridad_sugerida": "ALTA",
  "confianza": 0.9533,
  "probabilidades": { "BAJA": 0.0, "MEDIA": 0.0467, "ALTA": 0.9533 },
  "requiere_revision": false,
  "version_modelo": "1.0.0",
  "nota": "Sugerencia orientativa generada con un modelo entrenado con datos sintéticos; la decisión final es tuya."
}
```

Datos fuera de rango (`dias_para_vencer` entre -365 y 365; `valor` mayor que 0) → `422` con el detalle del error. Si la `confianza` es menor que 0,60, `requiere_revision` es `true` y la interfaz pide a la persona revisar la prioridad.

## Modelo y evaluación (Paso 9 de la guía)

- **Entradas:** días para vencer (se recorta a -30…60) y valor en COP (escala logarítmica de $1.000 a $10.000.000), ambos normalizados a 0-1.
- **Salida:** probabilidad de cada clase (BAJA, MEDIA, ALTA) con `softmax`.
- **Red:** `Dense(16, relu)` → `Dense(8, relu)` → `Dense(3, softmax)`, optimizador Adam, pérdida `sparse_categorical_crossentropy`, parada temprana con los datos de validación.
- **Datos:** 3.000 obligaciones **sintéticas**, etiquetadas con una regla didáctica (ver `preprocesamiento.py`): ALTA si vence en 3 días o menos (o ya venció) o si vale $1.000.000 o más y vence en 10 días o menos; MEDIA si vence en 15 días o menos (o vale $500.000 o más y vence en 30 días o menos); BAJA en los demás casos.
- **División:** 70 % entrenamiento, 15 % validación y 15 % prueba (datos que el modelo no vio al entrenar).

Resultados en los datos de prueba (versión 1.0.0 del modelo incluido):

| Métrica | Resultado |
|---|---|
| Exactitud | 94,9 % |
| Línea base (predecir siempre BAJA) | 42,2 % |
| ALTA: precisión / recall / F1 | 0,945 / 1,000 / 0,972 |
| MEDIA: precisión / recall / F1 | 0,901 / 0,830 / 0,864 |
| BAJA: precisión / recall / F1 | 0,973 / 0,958 / 0,966 |

Matriz de confusión (filas = real, columnas = predicho):

| | BAJA | MEDIA | ALTA |
|---|---|---|---|
| **BAJA** | 182 | 8 | 0 |
| **MEDIA** | 5 | 73 | 10 |
| **ALTA** | 0 | 0 | 172 |

Las métricas se guardan en `modelo_prioridad_info.json` cada vez que se entrena y se pueden consultar en `GET /modelo`. Al volver a entrenar pueden cambiar ligeramente.

## Limitaciones

- El modelo aprende una **regla definida por el equipo** a partir de datos sintéticos; **no** refleja el comportamiento real de los usuarios. Por eso su exactitud alta no significa que prediga bien la prioridad "real" de una persona.
- Solo considera el valor y los días para vencer; no tiene en cuenta la categoría, los intereses por mora, los ingresos del usuario ni otros factores.
- La sugerencia es **orientativa**: la persona decide la prioridad. Con confianza baja se le pide revisar.
- Para un uso real habría que entrenar con datos reales, autorizados y representativos, y volver a evaluar el modelo cada vez que cambien los datos o el software (versionando el modelo).
- En un despliegue real se agregarían HTTPS, autenticación entre el backend y el servicio, y registros de uso. En este proyecto el servicio solo escucha en `127.0.0.1`, el backend exige sesión y limita a 30 consultas por minuto por sesión.

## Cómo se integra con el resto del proyecto

1. `backend/config.php` define `ia.url` (por defecto `http://127.0.0.1:8000`) y el tiempo de espera.
2. `POST /ia/prioridad` del backend valida el valor y la fecha límite, calcula los días que faltan y consulta `POST /predecir`.
3. Si el servicio no responde, el backend contesta `503` y la interfaz muestra "El servicio de inteligencia artificial no está disponible", sin afectar el resto del formulario.
4. `frontend/js/logica/servicios/iaService.js` hace la consulta y `ObligacionForm.js` muestra el resultado con el botón **Aplicar**.
