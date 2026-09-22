# FinanTask — Fase 2: Prototipo estructurado

## Descripcion del avance
Este prototipo evoluciona la propuesta de la Fase 1 hacia una estructura de software organizada segun la arquitectura en capas definida para el proyecto: Interfaz de usuario, Servicios, Logica de negocio y Gestion de datos.

## Que incluye esta fase
- Pantallas: Login, Resumen (Dashboard), Nueva actividad, Lista de actividades.
- Navegacion basica entre pantallas mediante rutas de hash (#/login, #/dashboard, #/nueva, #/lista).
- Separacion Modelo (js/data.js) - Vista (js/ui/*.js) - Controlador (js/app.js), como base de una estructura MVC.
- Reglas de negocio iniciales en js/logic.js (validacion de datos, calculo automatico de "Vencido").
- Datos en memoria (sin conexion a base de datos todavia; se agregara en una fase posterior).

## Estructura del proyecto
```
finantask/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── data.js            # Gestion de datos (Modelo)
    ├── logic.js           # Logica de negocio
    ├── services.js        # Servicios (intermediario UI - logica)
    ├── app.js             # Controlador principal / enrutador
    └── ui/
        ├── layout.js       # Shell visual (sidebar) y helpers de formato
        ├── login.js
        ├── dashboard.js
        ├── nuevaActividad.js
        └── listaActividades.js
```

## Como ejecutar
Abre `index.html` directamente en el navegador. No requiere servidor, backend ni instalacion de dependencias.

Datos de prueba: al iniciar sesion puedes usar cualquier correo y contrasena (la autenticacion es simulada en esta fase).

## Reglas de negocio implementadas
- El valor de una actividad debe ser mayor a 0.
- El nombre y la fecha limite son obligatorios.
- Si la fecha limite ya paso y la actividad sigue "Pendiente", su estado cambia automaticamente a "Vencido".

## Proximos pasos (fases posteriores)
- Conectar la Gestion de datos a una base de datos real.
- Implementar autenticacion real en el Servicio de usuarios.
- Completar validaciones y reglas de negocio adicionales.
