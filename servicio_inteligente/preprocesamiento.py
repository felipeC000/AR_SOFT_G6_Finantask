"""
Preprocesamiento compartido entre el entrenamiento (entrenar_modelo.py) y el servicio (api.py).

Se define en UN solo lugar para que el modelo reciba en producción exactamente
la misma transformación con la que se entrenó (evita resultados incoherentes).
"""
import numpy as np

# Índice de cada clase en la salida del modelo (el mismo orden se usa al entrenar y al predecir)
CLASES = ["BAJA", "MEDIA", "ALTA"]

# Rangos que el modelo conoce. Los valores fuera de rango se recortan antes de normalizar.
DIAS_MIN, DIAS_MAX = -30, 60            # días para el vencimiento (negativo = ya venció)
LOG_VALOR_MIN, LOG_VALOR_MAX = 3.0, 7.0  # log10 del valor: de $1.000 a $10.000.000 COP


def normalizar(dias_para_vencer: float, valor: float) -> np.ndarray:
    """Convierte (días para vencer, valor en COP) en el vector de entrada del modelo, con forma (1, 2)."""
    dias = np.clip(dias_para_vencer, DIAS_MIN, DIAS_MAX)
    log_valor = np.clip(np.log10(max(float(valor), 1.0)), LOG_VALOR_MIN, LOG_VALOR_MAX)
    x_dias = (dias - DIAS_MIN) / (DIAS_MAX - DIAS_MIN)
    x_valor = (log_valor - LOG_VALOR_MIN) / (LOG_VALOR_MAX - LOG_VALOR_MIN)
    return np.array([[x_dias, x_valor]], dtype=np.float32)


def normalizar_lote(dias: np.ndarray, valores: np.ndarray) -> np.ndarray:
    """Igual que normalizar(), pero para muchos datos a la vez (se usa al entrenar)."""
    return np.vstack([normalizar(d, v) for d, v in zip(dias, valores)]).astype(np.float32)


def etiqueta_sintetica(dias_para_vencer: float, valor: float) -> int:
    """
    Regla de priorización DIDÁCTICA con la que se etiquetan los datos sintéticos de entrenamiento.
    No proviene de datos reales de usuarios: es una política acordada por el equipo para la demostración.

      ALTA  : vence en 3 días o menos (o ya venció), o vale $1.000.000 o más y vence en 10 días o menos.
      MEDIA : vence en 15 días o menos, o vale $500.000 o más y vence en 30 días o menos.
      BAJA  : el resto.
    """
    if dias_para_vencer <= 3 or (valor >= 1_000_000 and dias_para_vencer <= 10):
        return 2
    if dias_para_vencer <= 15 or (valor >= 500_000 and dias_para_vencer <= 30):
        return 1
    return 0
