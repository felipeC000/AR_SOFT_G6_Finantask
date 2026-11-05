<?php
// Copia este archivo como config.php y ajusta los valores a tu entorno.
// config.php NO se sube a GitHub (está en .gitignore): ahí van las credenciales reales.
return [
    'db' => [
        'host'     => 'localhost',
        'port'     => 3306,
        'nombre'   => 'finantask',
        'usuario'  => 'root',   // XAMPP: root
        'clave'    => '',       // XAMPP: vacía por defecto
    ],
    // Servicio inteligente (Python + TensorFlow + FastAPI). Se inicia con: uvicorn api:app
    'ia' => [
        'url'     => 'http://127.0.0.1:8000',
        'timeout' => 10,  // segundos de espera antes de avisar que el servicio no responde
    ],
    'zona_horaria' => 'America/Bogota',
];
