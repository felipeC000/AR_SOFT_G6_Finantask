<?php
// BACKEND · capa de datos (repositorio)

class CategoriaRepositorio
{
    public function todas(): array
    {
        $filas = Conexion::pdo()->query('SELECT id, nombre, descripcion FROM categorias ORDER BY id')->fetchAll();
        return array_map(function ($f) { $f['id'] = (int) $f['id']; return $f; }, $filas);
    }

    public function existe(int $id): bool
    {
        $st = Conexion::pdo()->prepare('SELECT 1 FROM categorias WHERE id = ?');
        $st->execute([$id]);
        return (bool) $st->fetchColumn();
    }
}
