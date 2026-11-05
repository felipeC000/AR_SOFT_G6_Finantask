<?php
// BACKEND · núcleo
// Única puerta de entrada a MySQL. Usa PDO con consultas preparadas (evita inyección SQL).

class Conexion
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        if (self::$pdo === null) {
            $c = Config::obtener()['db'];
            $dsn = "mysql:host={$c['host']};port={$c['port']};dbname={$c['nombre']};charset=utf8mb4";
            try {
                self::$pdo = new PDO($dsn, $c['usuario'], $c['clave'], [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                error_log('FinanTask: no se pudo conectar a MySQL: ' . $e->getMessage());
                throw new ErrorApi(503, 'No hay conexión con la base de datos. Verifica que MySQL esté iniciado.');
            }
        }
        return self::$pdo;
    }
}
