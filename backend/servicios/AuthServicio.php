<?php
// BACKEND · capa de lógica de negocio (servicio)
// Registro e inicio de sesión (RF01, RF02). Las contraseñas se guardan con password_hash (bcrypt).

class AuthServicio
{
    private UsuarioRepositorio $usuarios;

    public function __construct()
    {
        $this->usuarios = new UsuarioRepositorio();
    }

    private function publico(array $u): array
    {
        return ['id' => (int) $u['id'], 'nombre' => $u['nombre'], 'correo' => $u['correo']];
    }

    public function registrar(array $d): array
    {
        $nombre = trim((string) ($d['nombre'] ?? ''));
        $correo = mb_strtolower(trim((string) ($d['correo'] ?? '')));
        $clave = (string) ($d['contrasena'] ?? '');
        $confirmar = (string) ($d['confirmar'] ?? '');

        $errores = [];
        if ($nombre === '') $errores[] = 'El nombre es obligatorio.';
        elseif (mb_strlen($nombre) > 100) $errores[] = 'El nombre no puede tener más de 100 caracteres.';
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || mb_strlen($correo) > 150) $errores[] = 'Escribe un correo válido.';
        if (mb_strlen($clave) < 8) $errores[] = 'La contraseña debe tener mínimo 8 caracteres.';
        elseif (strlen($clave) > 72) $errores[] = 'La contraseña no puede superar 72 caracteres.';
        if ($clave !== $confirmar) $errores[] = 'Las contraseñas no coinciden.';
        if ($errores) throw ErrorApi::validacion($errores);

        if ($this->usuarios->buscarPorCorreo($correo)) {
            throw new ErrorApi(409, 'Ya existe una cuenta con ese correo.', ['Ya existe una cuenta con ese correo.']);
        }

        $id = $this->usuarios->crear($nombre, $correo, password_hash($clave, PASSWORD_DEFAULT), Fechas::hoy());
        $usuario = ['id' => $id, 'nombre' => $nombre, 'correo' => $correo];
        Sesion::abrir($usuario);
        return $usuario;
    }

    public function iniciarSesion(array $d): array
    {
        $correo = mb_strtolower(trim((string) ($d['correo'] ?? '')));
        $clave = (string) ($d['contrasena'] ?? '');
        if ($correo === '' || $clave === '') {
            throw new ErrorApi(400, 'Escribe tu correo y tu contraseña.', ['Escribe tu correo y tu contraseña.']);
        }
        $u = $this->usuarios->buscarPorCorreo($correo);
        // Mismo mensaje para "no existe" y "clave incorrecta": no revela qué correos están registrados
        if (!$u || !password_verify($clave, $u['contrasenaHash'])) {
            throw new ErrorApi(401, 'Correo o contraseña incorrectos.');
        }
        $usuario = $this->publico($u);
        Sesion::abrir($usuario);
        return $usuario;
    }

    public function cerrarSesion(): void
    {
        Sesion::cerrar();
    }

    public function usuarioActual(): array
    {
        $u = Sesion::usuario();
        if (!$u) throw new ErrorApi(401, 'No has iniciado sesión.');
        return $u;
    }
}
