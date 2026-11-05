<?php
// BACKEND · capa de lógica de negocio (servicio)
// Reglas de FinanTask: validación de datos, estados (RF09), eliminación (RF06),
// y registro de pagos como transacción (RF08). Corresponde a ObligacionService del diagrama de clases.

class ObligacionServicio
{
    private const PRIORIDADES = ['ALTA', 'MEDIA', 'BAJA'];
    private const VALOR_MAXIMO = 999999999999.99; // límite de DECIMAL(14,2)

    private ObligacionRepositorio $obligaciones;
    private PagoRepositorio $pagos;
    private CategoriaRepositorio $categorias;

    public function __construct()
    {
        $this->obligaciones = new ObligacionRepositorio();
        $this->pagos = new PagoRepositorio();
        $this->categorias = new CategoriaRepositorio();
    }

    // ---------- Validaciones ----------
    private function texto($v): string
    {
        return is_scalar($v) ? trim((string) $v) : '';
    }

    private function limpiarObligacion(array $d): array
    {
        $errores = [];
        $nombre = $this->texto($d['nombre'] ?? '');
        $descripcion = $this->texto($d['descripcion'] ?? '');
        $idCategoria = $this->texto($d['idCategoria'] ?? '');
        $valorTxt = $this->texto($d['valor'] ?? '');
        $fecha = $this->texto($d['fechaLimite'] ?? '');
        $prioridad = $this->texto($d['prioridad'] ?? '');

        if ($nombre === '') $errores[] = 'El nombre es obligatorio.';
        elseif (mb_strlen($nombre) > 100) $errores[] = 'El nombre no puede tener más de 100 caracteres.';
        if (mb_strlen($descripcion) > 150) $errores[] = 'La descripción no puede tener más de 150 caracteres.';

        if (!ctype_digit($idCategoria) || !$this->categorias->existe((int) $idCategoria)) {
            $errores[] = 'Selecciona una categoría.';
        }
        if (!is_numeric($valorTxt) || (float) $valorTxt <= 0) $errores[] = 'El valor debe ser mayor que 0.';
        elseif ((float) $valorTxt > self::VALOR_MAXIMO) $errores[] = 'El valor es demasiado grande.';

        if ($fecha === '') $errores[] = 'La fecha límite es obligatoria.';
        elseif (!Fechas::valida($fecha)) $errores[] = 'La fecha límite no es válida.';
        if (!in_array($prioridad, self::PRIORIDADES, true)) $errores[] = 'Selecciona una prioridad válida.';

        if ($errores) throw ErrorApi::validacion($errores);

        return [
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'idCategoria' => (int) $idCategoria,
            'valor' => round((float) $valorTxt, 2),
            'fechaLimite' => $fecha,
            'prioridad' => $prioridad,
            'origen' => ($d['origen'] ?? '') === 'ASISTENTE_IA' ? 'ASISTENTE_IA' : 'MANUAL',
        ];
    }

    private function obtenerPropia(int $id, int $idUsuario, bool $bloquear = false): array
    {
        $o = $this->obligaciones->buscar($id, $idUsuario, $bloquear);
        if (!$o) throw new ErrorApi(404, 'La obligación no existe.');
        return $o;
    }

    // ---------- Consultas (RF04) ----------
    public function listar(): array
    {
        $idUsuario = Sesion::requerirId();
        $this->obligaciones->marcarVencidas($idUsuario, Fechas::hoy());
        return $this->obligaciones->porUsuario($idUsuario);
    }

    public function obtener(int $id): array
    {
        $idUsuario = Sesion::requerirId();
        $this->obligaciones->marcarVencidas($idUsuario, Fechas::hoy());
        return $this->obtenerPropia($id, $idUsuario);
    }

    public function categorias(): array
    {
        Sesion::requerirId();
        return $this->categorias->todas();
    }

    // ---------- Registro (RF03) ----------
    public function crear(array $d): array
    {
        $idUsuario = Sesion::requerirId();
        $limpio = $this->limpiarObligacion($d);
        $hoy = Fechas::hoy();
        $id = $this->obligaciones->insertar($idUsuario, $limpio, $hoy);
        $this->obligaciones->marcarVencidas($idUsuario, $hoy); // si la fecha ya pasó, queda VENCIDA
        return $this->obtenerPropia($id, $idUsuario);
    }

    // ---------- Modificación (RF05) ----------
    public function actualizar(int $id, array $d): array
    {
        $idUsuario = Sesion::requerirId();
        $actual = $this->obtenerPropia($id, $idUsuario);
        if ($actual['estado'] === 'PAGADA') {
            throw new ErrorApi(409, 'Una obligación pagada no se puede editar.', ['Una obligación pagada no se puede editar.']);
        }
        $limpio = $this->limpiarObligacion($d);
        $hoy = Fechas::hoy();
        // Si estaba vencida y la nueva fecha es futura, vuelve a pendiente
        $estado = ($actual['estado'] === 'VENCIDA' && $limpio['fechaLimite'] >= $hoy) ? 'PENDIENTE' : $actual['estado'];
        $this->obligaciones->actualizar($id, $idUsuario, $limpio, $estado, $hoy);
        $this->obligaciones->marcarVencidas($idUsuario, $hoy);
        return $this->obtenerPropia($id, $idUsuario);
    }

    // ---------- Eliminación (RF06) ----------
    public function eliminar(int $id): void
    {
        $idUsuario = Sesion::requerirId();
        $this->obtenerPropia($id, $idUsuario);
        if ($this->obligaciones->tienePagos($id)) {
            $m = 'No se puede eliminar: la obligación ya tiene pagos registrados.';
            throw new ErrorApi(409, $m, [$m]);
        }
        $this->obligaciones->eliminar($id, $idUsuario);
    }

    // ---------- Pagos (RF08, RF10) ----------
    public function historialPagos(?int $idObligacion = null): array
    {
        $idUsuario = Sesion::requerirId();
        return $this->pagos->porUsuario($idUsuario, $idObligacion);
    }

    // RF08: guardar el pago y cambiar el estado a PAGADA en UNA transacción (todo o nada)
    public function registrarPago(int $idObligacion, array $d): array
    {
        $idUsuario = Sesion::requerirId();
        $valorTxt = $this->texto($d['valorPagado'] ?? '');
        $fecha = $this->texto($d['fechaPago'] ?? '');
        $hoy = Fechas::hoy();

        $errores = [];
        if (!is_numeric($valorTxt) || (float) $valorTxt <= 0) $errores[] = 'El valor pagado debe ser mayor que 0.';
        elseif ((float) $valorTxt > self::VALOR_MAXIMO) $errores[] = 'El valor pagado es demasiado grande.';
        if ($fecha === '') $errores[] = 'La fecha de pago es obligatoria.';
        elseif (!Fechas::valida($fecha)) $errores[] = 'La fecha de pago no es válida.';
        elseif ($fecha > $hoy) $errores[] = 'La fecha de pago no puede ser futura.';
        if ($errores) throw ErrorApi::validacion($errores);

        $pdo = Conexion::pdo();
        $pdo->beginTransaction();
        try {
            // Se bloquea la fila para que dos peticiones simultáneas no paguen dos veces
            $o = $this->obtenerPropia($idObligacion, $idUsuario, true);
            if ($o['estado'] === 'PAGADA') {
                throw new ErrorApi(409, 'Esta obligación ya está pagada.', ['Esta obligación ya está pagada.']);
            }
            $idPago = $this->pagos->insertar($idObligacion, $fecha, round((float) $valorTxt, 2));
            $this->obligaciones->marcarPagada($idObligacion, $hoy);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack(); // si algo falla no se guarda nada
            throw $e;
        }
        return ['pago' => ['id' => $idPago, 'idObligacion' => $idObligacion, 'fechaPago' => $fecha, 'valorPagado' => round((float) $valorTxt, 2)],
                'obligacion' => $this->obtenerPropia($idObligacion, $idUsuario)];
    }
}
