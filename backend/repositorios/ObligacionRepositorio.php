<?php
// BACKEND · capa de datos (repositorio)
// Consultas SQL de la tabla obligaciones. Todas las consultas filtran por id_usuario:
// un usuario nunca puede leer ni modificar las obligaciones de otro.

class ObligacionRepositorio
{
    private const SELECT = 'SELECT o.id, o.id_usuario AS idUsuario, o.id_categoria AS idCategoria,
            c.nombre AS categoria, o.nombre, o.descripcion, o.valor,
            o.fecha_limite AS fechaLimite, o.prioridad, o.estado, o.origen,
            o.fecha_creacion AS fechaCreacion, o.fecha_actualizacion AS fechaActualizacion
        FROM obligaciones o JOIN categorias c ON c.id = o.id_categoria';

    private function normalizar(array $f): array
    {
        $f['id'] = (int) $f['id'];
        $f['idUsuario'] = (int) $f['idUsuario'];
        $f['idCategoria'] = (int) $f['idCategoria'];
        $f['valor'] = (float) $f['valor'];
        return $f;
    }

    public function porUsuario(int $idUsuario): array
    {
        $st = Conexion::pdo()->prepare(self::SELECT . ' WHERE o.id_usuario = ? ORDER BY o.fecha_limite, o.id');
        $st->execute([$idUsuario]);
        return array_map([$this, 'normalizar'], $st->fetchAll());
    }

    // $bloquear = true usa FOR UPDATE: dentro de una transacción impide que otra petición
    // modifique la misma fila al mismo tiempo (por ejemplo, dos pagos simultáneos).
    public function buscar(int $id, int $idUsuario, bool $bloquear = false): ?array
    {
        $sql = self::SELECT . ' WHERE o.id = ? AND o.id_usuario = ?' . ($bloquear ? ' FOR UPDATE' : '');
        $st = Conexion::pdo()->prepare($sql);
        $st->execute([$id, $idUsuario]);
        $f = $st->fetch();
        return $f ? $this->normalizar($f) : null;
    }

    public function insertar(int $idUsuario, array $d, string $hoy): int
    {
        $st = Conexion::pdo()->prepare(
            'INSERT INTO obligaciones
               (id_usuario, id_categoria, nombre, descripcion, valor, fecha_limite, prioridad, estado, origen, fecha_creacion, fecha_actualizacion)
             VALUES (?, ?, ?, ?, ?, ?, ?, \'PENDIENTE\', ?, ?, ?)'
        );
        $st->execute([$idUsuario, $d['idCategoria'], $d['nombre'], $d['descripcion'], $d['valor'],
                      $d['fechaLimite'], $d['prioridad'], $d['origen'], $hoy, $hoy]);
        return (int) Conexion::pdo()->lastInsertId();
    }

    public function actualizar(int $id, int $idUsuario, array $d, string $estado, string $hoy): void
    {
        $st = Conexion::pdo()->prepare(
            'UPDATE obligaciones
                SET id_categoria = ?, nombre = ?, descripcion = ?, valor = ?, fecha_limite = ?,
                    prioridad = ?, estado = ?, fecha_actualizacion = ?
              WHERE id = ? AND id_usuario = ?'
        );
        $st->execute([$d['idCategoria'], $d['nombre'], $d['descripcion'], $d['valor'], $d['fechaLimite'],
                      $d['prioridad'], $estado, $hoy, $id, $idUsuario]);
    }

    public function marcarPagada(int $id, string $hoy): void
    {
        $st = Conexion::pdo()->prepare('UPDATE obligaciones SET estado = \'PAGADA\', fecha_actualizacion = ? WHERE id = ?');
        $st->execute([$hoy, $id]);
    }

    public function eliminar(int $id, int $idUsuario): void
    {
        $st = Conexion::pdo()->prepare('DELETE FROM obligaciones WHERE id = ? AND id_usuario = ?');
        $st->execute([$id, $idUsuario]);
    }

    public function tienePagos(int $id): bool
    {
        $st = Conexion::pdo()->prepare('SELECT 1 FROM historial_pagos WHERE id_obligacion = ? LIMIT 1');
        $st->execute([$id]);
        return (bool) $st->fetchColumn();
    }

    // RF09: las pendientes cuya fecha límite ya pasó cambian a VENCIDA
    public function marcarVencidas(int $idUsuario, string $hoy): void
    {
        $st = Conexion::pdo()->prepare(
            'UPDATE obligaciones SET estado = \'VENCIDA\', fecha_actualizacion = ?
              WHERE id_usuario = ? AND estado = \'PENDIENTE\' AND fecha_limite < ?'
        );
        $st->execute([$hoy, $idUsuario, $hoy]);
    }
}
