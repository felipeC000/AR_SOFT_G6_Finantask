<?php
// BACKEND · capa de datos (repositorio)
// Solo habla con la tabla usuarios. No contiene reglas de negocio.

class UsuarioRepositorio
{
    public function buscarPorCorreo(string $correo): ?array
    {
        $st = Conexion::pdo()->prepare(
            'SELECT id, nombre, correo, contrasena_hash AS contrasenaHash FROM usuarios WHERE correo = ?'
        );
        $st->execute([$correo]);
        $f = $st->fetch();
        if (!$f) return null;
        $f['id'] = (int) $f['id'];
        return $f;
    }

    public function crear(string $nombre, string $correo, string $hash, string $fecha): int
    {
        $st = Conexion::pdo()->prepare(
            'INSERT INTO usuarios (nombre, correo, contrasena_hash, fecha_registro) VALUES (?, ?, ?, ?)'
        );
        $st->execute([$nombre, $correo, $hash, $fecha]);
        return (int) Conexion::pdo()->lastInsertId();
    }
}
