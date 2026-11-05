<?php
// BACKEND · núcleo
// Lee backend/config.php (credenciales). Si no existe, explica cómo crearlo.

class Config
{
    private static ?array $datos = null;

    public static function obtener(): array
    {
        if (self::$datos === null) {
            $ruta = __DIR__ . '/../config.php';
            if (!is_file($ruta)) {
                error_log('FinanTask: falta backend/config.php (copia config.example.php).');
                throw new ErrorApi(500, 'El servidor no está configurado. Falta el archivo backend/config.php.');
            }
            self::$datos = require $ruta;
        }
        return self::$datos;
    }
}
