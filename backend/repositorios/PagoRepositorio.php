<?php
// BACKEND · capa de datos (repositorio)
// Tabla historial_pagos.

class PagoRepositorio
{
    public function porUsuario(int $idUsuario, ?int $idObligacion = null): array
    {
        $sql = 'SELECT p.id, p.id_obligacion AS idObligacion, p.fecha_pago AS fechaPago, p.valor_pagado AS valorPagado,
                       o.nombre AS obligacionNombre, c.nombre AS obligacionCategoria
                  FROM historial_pagos p
                  JOIN obligaciones o ON o.id = p.id_obligacion
                  JOIN categorias c ON c.id = o.id_categoria
                 WHERE o.id_usuario = ?';
        $params = [$idUsuario];
        if ($idObligacion !== null) {
            $sql .= ' AND p.id_obligacion = ?';
            $params[] = $idObligacion;
        }
        $sql .= ' ORDER BY p.fecha_pago DESC, p.id DESC';
        $st = Conexion::pdo()->prepare($sql);
        $st->execute($params);

        return array_map(function ($f) {
            return [
                'id' => (int) $f['id'],
                'idObligacion' => (int) $f['idObligacion'],
                'fechaPago' => $f['fechaPago'],
                'valorPagado' => (float) $f['valorPagado'],
                'obligacion' => ['nombre' => $f['obligacionNombre'], 'categoria' => $f['obligacionCategoria']],
            ];
        }, $st->fetchAll());
    }

    public function insertar(int $idObligacion, string $fechaPago, float $valor): int
    {
        $st = Conexion::pdo()->prepare('INSERT INTO historial_pagos (id_obligacion, fecha_pago, valor_pagado) VALUES (?, ?, ?)');
        $st->execute([$idObligacion, $fechaPago, $valor]);
        return (int) Conexion::pdo()->lastInsertId();
    }
}
