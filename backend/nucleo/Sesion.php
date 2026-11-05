<?php
// BACKEND · núcleo
// Sesión del usuario con la sesión de PHP (cookie). El navegador nunca recibe la contraseña.

class Sesion
{
    public static function iniciar(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_name('FINANTASKSESSID');
            session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/']);
            session_start();
        }
    }

    public static function abrir(array $usuario): void
    {
        self::iniciar();
        session_regenerate_id(true); // evita fijación de sesión
        $_SESSION['usuario'] = $usuario;
    }

    public static function cerrar(): void
    {
        self::iniciar();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 3600, $p['path'], $p['domain'] ?? '', $p['secure'] ?? false, true);
        }
        session_destroy();
    }

    public static function usuario(): ?array
    {
        self::iniciar();
        return $_SESSION['usuario'] ?? null;
    }

    // Para los servicios: devuelve el id del usuario o responde 401
    public static function requerirId(): int
    {
        $u = self::usuario();
        if (!$u) {
            throw new ErrorApi(401, 'Tu sesión expiró. Inicia sesión de nuevo.');
        }
        return (int) $u['id'];
    }
}
