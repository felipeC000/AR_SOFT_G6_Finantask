<?php
// BACKEND · capa de comunicación (controladores)
// Reciben la petición HTTP, llaman al servicio y devuelven JSON.
// No tienen reglas de negocio: solo traducen entre HTTP y los servicios.

class AuthControlador
{
    public function registro(array $p, array $cuerpo): void
    {
        Respuesta::json(['usuario' => (new AuthServicio())->registrar($cuerpo)], 201);
    }

    public function login(array $p, array $cuerpo): void
    {
        Respuesta::json(['usuario' => (new AuthServicio())->iniciarSesion($cuerpo)]);
    }

    public function logout(array $p, array $cuerpo): void
    {
        (new AuthServicio())->cerrarSesion();
        Respuesta::vacia();
    }

    public function yo(array $p, array $cuerpo): void
    {
        Respuesta::json(['usuario' => (new AuthServicio())->usuarioActual()]);
    }
}

class CategoriaControlador
{
    public function listar(array $p, array $cuerpo): void
    {
        Respuesta::json((new ObligacionServicio())->categorias());
    }
}

class ObligacionControlador
{
    public function listar(array $p, array $cuerpo): void
    {
        Respuesta::json((new ObligacionServicio())->listar());
    }

    public function obtener(array $p, array $cuerpo): void
    {
        Respuesta::json((new ObligacionServicio())->obtener((int) $p['id']));
    }

    public function crear(array $p, array $cuerpo): void
    {
        Respuesta::json(['obligacion' => (new ObligacionServicio())->crear($cuerpo)], 201);
    }

    public function actualizar(array $p, array $cuerpo): void
    {
        Respuesta::json(['obligacion' => (new ObligacionServicio())->actualizar((int) $p['id'], $cuerpo)]);
    }

    public function eliminar(array $p, array $cuerpo): void
    {
        (new ObligacionServicio())->eliminar((int) $p['id']);
        Respuesta::vacia();
    }

    public function registrarPago(array $p, array $cuerpo): void
    {
        Respuesta::json((new ObligacionServicio())->registrarPago((int) $p['id'], $cuerpo), 201);
    }
}

class PagoControlador
{
    public function listar(array $p, array $cuerpo): void
    {
        $filtro = isset($_GET['idObligacion']) && ctype_digit((string) $_GET['idObligacion']) ? (int) $_GET['idObligacion'] : null;
        Respuesta::json((new ObligacionServicio())->historialPagos($filtro));
    }
}

class IAControlador
{
    public function prioridad(array $p, array $cuerpo): void
    {
        Respuesta::json((new IAServicio())->sugerirPrioridad($cuerpo));
    }

    public function estado(array $p, array $cuerpo): void
    {
        Respuesta::json((new IAServicio())->estado());
    }
}
