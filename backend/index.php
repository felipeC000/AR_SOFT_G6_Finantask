<?php
// BACKEND · punto de entrada de la API REST de FinanTask
// URL base:  http://localhost/finantask/backend/index.php
// Ejemplo:   GET  http://localhost/finantask/backend/index.php/obligaciones
//
// Flujo de una petición:  index.php (rutas) -> Controlador -> Servicio (reglas) -> Repositorio (SQL) -> MySQL

declare(strict_types=1);

// ---- Carga automática de clases (una carpeta por responsabilidad)
spl_autoload_register(function (string $clase): void {
    foreach (['nucleo', 'repositorios', 'servicios'] as $carpeta) {
        $ruta = __DIR__ . "/$carpeta/$clase.php";
        if (is_file($ruta)) { require $ruta; return; }
    }
});
require __DIR__ . '/nucleo/Compat.php';
require __DIR__ . '/controladores/Controladores.php';

// ---- Toda salida de errores se convierte en JSON (nunca HTML ni mensajes técnicos)
ini_set('display_errors', '0');
set_exception_handler(function (Throwable $e): void {
    if ($e instanceof ErrorApi) {
        Respuesta::error($e->estado, $e->getMessage(), $e->errores);
    }
    error_log('FinanTask: ' . $e);
    Respuesta::error(500, 'Ocurrió un error en el servidor. Intenta de nuevo.');
});

try {
    date_default_timezone_set(Config::obtener()['zona_horaria'] ?? 'America/Bogota');
} catch (ErrorApi $e) {
    Respuesta::error($e->estado, $e->getMessage());
}

// ---- Tabla de rutas: [método, patrón, controlador, acción, ¿requiere sesión?]
$rutas = [
    ['POST',   '/auth/registro',            'AuthControlador',       'registro',      false],
    ['POST',   '/auth/login',               'AuthControlador',       'login',         false],
    ['POST',   '/auth/logout',              'AuthControlador',       'logout',        false],
    ['GET',    '/auth/yo',                  'AuthControlador',       'yo',            false],
    ['GET',    '/categorias',               'CategoriaControlador',  'listar',        true],
    ['GET',    '/obligaciones',             'ObligacionControlador', 'listar',        true],
    ['POST',   '/obligaciones',             'ObligacionControlador', 'crear',         true],
    ['GET',    '/obligaciones/{id}',        'ObligacionControlador', 'obtener',       true],
    ['PUT',    '/obligaciones/{id}',        'ObligacionControlador', 'actualizar',    true],
    ['DELETE', '/obligaciones/{id}',        'ObligacionControlador', 'eliminar',      true],
    ['POST',   '/obligaciones/{id}/pagos',  'ObligacionControlador', 'registrarPago', true],
    ['GET',    '/pagos',                    'PagoControlador',       'listar',        true],
    ['POST',   '/ia/prioridad',             'IAControlador',         'prioridad',     true],
    ['GET',    '/ia/estado',                'IAControlador',         'estado',        true],

];

// ---- Ruta pedida (lo que va después de index.php)
$ruta = $_SERVER['PATH_INFO'] ?? '';
if ($ruta === '') {
    $ruta = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
    $pos = strpos($ruta, 'index.php');
    $ruta = $pos !== false ? substr($ruta, $pos + strlen('index.php')) : '/';
}
$ruta = '/' . trim($ruta, '/');
$metodo = $_SERVER['REQUEST_METHOD'];

// ---- Cuerpo JSON
$cuerpo = [];
$crudo = file_get_contents('php://input');
if ($crudo !== '' && $crudo !== false) {
    $cuerpo = json_decode($crudo, true);
    if (!is_array($cuerpo)) {
        Respuesta::error(400, 'El cuerpo de la petición no es un JSON válido.');
    }
}

// ---- Buscar la ruta
$rutaExiste = false;
foreach ($rutas as [$m, $patron, $clase, $accion, $protegida]) {
    $regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>\d+)', $patron) . '$#';
    if (!preg_match($regex, $ruta, $coincide)) continue;
    $rutaExiste = true;
    if ($m !== $metodo) continue;
    $params = array_filter($coincide, 'is_string', ARRAY_FILTER_USE_KEY);
    if ($protegida) Sesion::requerirId();
    (new $clase())->$accion($params, $cuerpo);
    exit;
}

if ($rutaExiste) Respuesta::error(405, 'Método no permitido.');
Respuesta::error(404, 'Ruta no encontrada.');
