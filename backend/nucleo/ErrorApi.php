<?php
// BACKEND · núcleo
// Error controlado: lleva el código HTTP y los mensajes que se le mostrarán al usuario.

class ErrorApi extends Exception
{
    public int $estado;
    public array $errores;

    public function __construct(int $estado, string $mensaje, array $errores = [])
    {
        parent::__construct($mensaje);
        $this->estado = $estado;
        $this->errores = $errores;
    }

    public static function validacion(array $errores): self
    {
        return new self(400, $errores[0] ?? 'Datos inválidos.', $errores);
    }
}
