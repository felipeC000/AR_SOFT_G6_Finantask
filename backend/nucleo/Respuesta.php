<?php
// BACKEND · núcleo
// Respuestas JSON uniformes: éxito -> datos; fallo -> { "error": "...", "errores": [...] }.

class Respuesta
{
    public static function json($datos, int $estado = 200): void
    {
        http_response_code($estado);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function vacia(int $estado = 204): void
    {
        http_response_code($estado);
        exit;
    }

    public static function error(int $estado, string $mensaje, array $errores = []): void
    {
        self::json(['error' => $mensaje, 'errores' => $errores], $estado);
    }
}
