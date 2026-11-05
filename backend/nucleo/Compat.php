<?php
// BACKEND · núcleo
// Respaldo por si la extensión mbstring de PHP no está activa (en XAMPP viene activa).

if (!function_exists('mb_strlen')) {
    function mb_strlen(string $texto): int
    {
        return (int) preg_match_all('/./us', $texto);
    }
}
if (!function_exists('mb_strtolower')) {
    function mb_strtolower(string $texto): string
    {
        return strtolower($texto); // suficiente para correos
    }
}
