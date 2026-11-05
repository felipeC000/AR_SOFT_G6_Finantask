"""
Servicio inteligente de priorización de FinanTask (Paso 5 de la guía): TensorFlow + FastAPI.

Recibe los días que faltan para el vencimiento de una obligación y su valor, y devuelve la prioridad
sugerida (BAJA, MEDIA o ALTA) con la probabilidad de cada clase.

Uso:  uvicorn api:app --reload        (documentación interactiva en http://127.0.0.1:8000/docs)
El servicio escucha solo en 127.0.0.1: lo consulta el backend PHP, no el navegador.
"""
import json
import logging
import os
from contextlib import asynccontextmanager
from typing import Dict

import numpy as np
import tensorflow as tf
from fastapi import FastAPI
from pydantic import BaseModel, Field

from preprocesamiento import CLASES, normalizar

RUTA = os.path.dirname(os.path.abspath(__file__))
UMBRAL_CONFIANZA = 0.60   # por debajo de este valor se recomienda que la persona revise la sugerencia
registro = logging.getLogger("servicio_inteligente")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

estado: dict = {}


@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    """Carga el modelo UNA vez al iniciar el servicio (no en cada petición)."""
    ruta_modelo = os.path.join(RUTA, "modelo_prioridad.keras")
    if not os.path.exists(ruta_modelo):
        raise RuntimeError("No se encuentra modelo_prioridad.keras. Ejecuta primero: python entrenar_modelo.py")
    estado["modelo"] = tf.keras.models.load_model(ruta_modelo)
    estado["modelo"](normalizar(0, 10_000), training=False)  # "calentamiento": la primera predicción es la más lenta
    ruta_info = os.path.join(RUTA, "modelo_prioridad_info.json")
    estado["info"] = json.load(open(ruta_info, encoding="utf-8")) if os.path.exists(ruta_info) else {}
    registro.info("Modelo cargado (versión %s)", estado["info"].get("version", "desconocida"))
    yield
    estado.clear()


app = FastAPI(
    title="Servicio inteligente de priorización · FinanTask",
    description="Sugiere la prioridad (BAJA, MEDIA, ALTA) de una obligación financiera. Ejemplo educativo con TensorFlow y FastAPI.",
    version="1.0.0",
    lifespan=ciclo_de_vida,
)


class Solicitud(BaseModel):
    # Los límites se validan automáticamente: fuera de rango la API responde 422 con el detalle del error
    dias_para_vencer: int = Field(ge=-365, le=365, description="Días hasta la fecha límite (negativo si ya venció)")
    valor: float = Field(gt=0, le=999_999_999_999.99, description="Valor de la obligación en pesos colombianos")


class Prediccion(BaseModel):
    prioridad_sugerida: str
    confianza: float
    probabilidades: Dict[str, float]
    requiere_revision: bool
    version_modelo: str
    nota: str


@app.get("/")
def inicio():
    return {"mensaje": "Servicio inteligente activo", "modelo_cargado": "modelo" in estado}


@app.get("/modelo")
def informacion_del_modelo():
    """Ficha del modelo: versión, datos de entrenamiento, métricas y limitaciones."""
    return estado.get("info", {})


@app.post("/predecir", response_model=Prediccion)
def predecir(solicitud: Solicitud):
    entrada = normalizar(solicitud.dias_para_vencer, solicitud.valor)
    probabilidades = estado["modelo"](entrada, training=False).numpy()[0]
    indice = int(np.argmax(probabilidades))
    confianza = float(probabilidades[indice])
    prioridad = CLASES[indice]
    registro.info("predicción dias=%s valor=%.0f -> %s (%.2f)", solicitud.dias_para_vencer, solicitud.valor, prioridad, confianza)
    return {
        "prioridad_sugerida": prioridad,
        "confianza": round(confianza, 4),
        "probabilidades": {c: round(float(p), 4) for c, p in zip(CLASES, probabilidades)},
        "requiere_revision": confianza < UMBRAL_CONFIANZA,
        "version_modelo": estado["info"].get("version", "desconocida"),
        "nota": "Sugerencia orientativa generada con un modelo entrenado con datos sintéticos; la decisión final es tuya.",
    }
