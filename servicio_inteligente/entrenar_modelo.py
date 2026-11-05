"""
Entrena el modelo de prioridad de FinanTask con TensorFlow/Keras (Pasos 4 y 9 de la guía).

Qué hace:
  1. Genera datos SINTÉTICOS: obligaciones con (días para vencer, valor) y su prioridad según una regla didáctica.
  2. Separa los datos en entrenamiento (70 %), validación (15 %) y prueba (15 %).
  3. Entrena una red neuronal pequeña que clasifica la prioridad en BAJA, MEDIA o ALTA.
  4. Evalúa con los datos de prueba (que el modelo nunca vio): exactitud, precisión, recall, F1 y matriz de confusión,
     y la compara con una línea base (predecir siempre la clase más frecuente).
  5. Guarda el modelo (modelo_prioridad.keras) y su ficha (modelo_prioridad_info.json).

Uso:  python entrenar_modelo.py
Los datos son sintéticos: sirven para demostrar el flujo técnico, no para decisiones financieras reales.
"""
import datetime
import json
import os

import numpy as np
import tensorflow as tf

from preprocesamiento import CLASES, DIAS_MAX, DIAS_MIN, etiqueta_sintetica, normalizar_lote

SEMILLA = 42
VERSION_MODELO = "1.0.0"
N_MUESTRAS = 3000
RUTA = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- 1. Datos sintéticos
rng = np.random.default_rng(SEMILLA)
dias = rng.integers(DIAS_MIN, DIAS_MAX + 1, N_MUESTRAS)       # de 30 días vencida a 60 días por vencer
valores = 10 ** rng.uniform(3.7, 6.7, N_MUESTRAS)             # de $5.000 a $5.000.000 (escala logarítmica)
y = np.array([etiqueta_sintetica(d, v) for d, v in zip(dias, valores)], dtype=np.int32)
X = normalizar_lote(dias, valores)

# ---------------------------------------------------------------- 2. Entrenamiento / validación / prueba
orden = rng.permutation(N_MUESTRAS)
n_ent, n_val = int(0.70 * N_MUESTRAS), int(0.15 * N_MUESTRAS)
i_ent, i_val, i_pru = orden[:n_ent], orden[n_ent:n_ent + n_val], orden[n_ent + n_val:]
X_ent, y_ent = X[i_ent], y[i_ent]
X_val, y_val = X[i_val], y[i_val]
X_pru, y_pru = X[i_pru], y[i_pru]
print(f"Datos: {len(i_ent)} entrenamiento, {len(i_val)} validación, {len(i_pru)} prueba")

# ---------------------------------------------------------------- 3. Modelo
tf.keras.utils.set_random_seed(SEMILLA)
modelo = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(2,)),
    tf.keras.layers.Dense(16, activation="relu"),
    tf.keras.layers.Dense(8, activation="relu"),
    tf.keras.layers.Dense(len(CLASES), activation="softmax"),
])
modelo.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])

parada = tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=20, restore_best_weights=True)
historial = modelo.fit(X_ent, y_ent, validation_data=(X_val, y_val), epochs=400, batch_size=32,
                       callbacks=[parada], verbose=0)
print(f"Entrenamiento terminado en {len(historial.history['loss'])} épocas")

# ---------------------------------------------------------------- 4. Evaluación con datos de prueba
pred = np.argmax(modelo.predict(X_pru, verbose=0), axis=1)
matriz = np.zeros((len(CLASES), len(CLASES)), dtype=int)   # filas = clase real, columnas = clase predicha
for real, p in zip(y_pru, pred):
    matriz[real][p] += 1

exactitud = float(np.mean(pred == y_pru))
por_clase = {}
for i, nombre in enumerate(CLASES):
    tp = matriz[i][i]
    precision = tp / matriz[:, i].sum() if matriz[:, i].sum() else 0.0
    recall = tp / matriz[i].sum() if matriz[i].sum() else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    por_clase[nombre] = {"precision": round(float(precision), 4), "recall": round(float(recall), 4),
                         "f1": round(float(f1), 4), "muestras": int(matriz[i].sum())}

clase_mayoritaria = int(np.argmax(np.bincount(y_ent)))
linea_base = float(np.mean(y_pru == clase_mayoritaria))

print(f"\nExactitud en prueba: {exactitud:.3f}   (línea base, siempre '{CLASES[clase_mayoritaria]}': {linea_base:.3f})")
print("Matriz de confusión (filas = real, columnas = predicho):", CLASES)
print(matriz)
for nombre, m in por_clase.items():
    print(f"  {nombre:6s} precisión {m['precision']:.3f}  recall {m['recall']:.3f}  F1 {m['f1']:.3f}  ({m['muestras']} muestras)")

# ---------------------------------------------------------------- 5. Guardar modelo y ficha
modelo.save(os.path.join(RUTA, "modelo_prioridad.keras"))
info = {
    "version": VERSION_MODELO,
    "entrenado_el": datetime.datetime.now().isoformat(timespec="seconds"),
    "tensorflow": tf.__version__,
    "clases": CLASES,
    "entradas": ["dias_para_vencer", "valor"],
    "datos": {"tipo": "sintéticos", "muestras": N_MUESTRAS, "semilla": SEMILLA,
              "division": {"entrenamiento": len(i_ent), "validacion": len(i_val), "prueba": len(i_pru)}},
    "metricas_prueba": {"exactitud": round(exactitud, 4), "linea_base_clase_mayoritaria": round(linea_base, 4),
                        "por_clase": por_clase, "matriz_confusion": matriz.tolist()},
    "limitaciones": "Entrenado con datos sintéticos etiquetados con una regla didáctica; no refleja el comportamiento "
                    "real de los usuarios. La sugerencia es orientativa y la decisión final es de la persona.",
}
with open(os.path.join(RUTA, "modelo_prioridad_info.json"), "w", encoding="utf-8") as f:
    json.dump(info, f, ensure_ascii=False, indent=2)
print("\nModelo guardado en modelo_prioridad.keras y ficha en modelo_prioridad_info.json")
