"""
Prueba rápida del servicio (Paso 7 de la guía). Con el servicio iniciado (uvicorn api:app), ejecuta:

    python probar_api.py

Envía solicitudes válidas e inválidas y muestra la respuesta de cada una (sirve como evidencia).
"""
import json
import urllib.error
import urllib.request

URL = "http://127.0.0.1:8000"


def llamar(metodo, ruta, cuerpo=None):
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(URL + ruta, data=datos, method=metodo, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())
    except urllib.error.URLError as e:
        return None, {"error": f"No se pudo conectar con el servicio: {e.reason}. ¿Está iniciado uvicorn?"}


CASOS = [
    ("Vence en 2 días, $90.000", {"dias_para_vencer": 2, "valor": 90000}),
    ("Ya venció hace 5 días, $245.000", {"dias_para_vencer": -5, "valor": 245000}),
    ("Vence en 25 días, $950.000", {"dias_para_vencer": 25, "valor": 950000}),
    ("Vence en 45 días, $19.000", {"dias_para_vencer": 45, "valor": 19000}),
    ("INVÁLIDO: valor negativo", {"dias_para_vencer": 5, "valor": -100}),
    ("INVÁLIDO: faltan datos", {"valor": 100}),
]

estado, cuerpo = llamar("GET", "/")
print(f"GET /  ->  {estado}  {cuerpo}\n")
for nombre, datos in CASOS:
    estado, cuerpo = llamar("POST", "/predecir", datos)
    print(f"{nombre}\n  enviado:   {datos}\n  respuesta: HTTP {estado}")
    if estado == 200:
        print(f"  prioridad {cuerpo['prioridad_sugerida']}  confianza {cuerpo['confianza']}  probabilidades {cuerpo['probabilidades']}")
    else:
        print(f"  {json.dumps(cuerpo, ensure_ascii=False)[:200]}")
    print()
