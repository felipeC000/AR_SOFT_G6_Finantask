<?php
// BACKEND · núcleo
// Fechas "AAAA-MM-DD" en la zona horaria configurada (así "hoy" es el mismo día que ve el usuario).

class Fechas
{
    public static function hoy(): string
    {
        return date('Y-m-d');
    }

    // Verifica formato y que la fecha exista de verdad (rechaza 2026-02-31)
    public static function valida($iso): bool
    {
        if (!is_string($iso) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $iso)) {
            return false;
        }
        [$a, $m, $d] = array_map('intval', explode('-', $iso));
        return checkdate($m, $d, $a);
    }
}
