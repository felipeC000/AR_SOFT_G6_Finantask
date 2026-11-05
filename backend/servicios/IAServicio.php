<?php
// BACKEND · capa de lógica de negocio (servicio)
// Conexión con el servicio inteligente (Python + TensorFlow + FastAPI, carpeta servicio_inteligente/).
// El navegador NUNCA llama directamente al servicio de IA: pide la sugerencia a esta API,
// que exige sesión iniciada, valida los datos, limita las consultas y traduce los errores.

class IAServicio
{
    private const LIMITE_POR_MINUTO = 30;
    private const VALOR_MAXIMO = 999999999999.99;

    private function config(): array
    {
        $c = Config::obtener()['ia'] ?? [];
        return [
            'url' => rtrim($c['url'] ?? 'http://127.0.0.1:8000', '/'),
            'timeout' => (float) ($c['timeout'] ?? 10),
        ];
    }

    // Evita que una sesión sature el servicio de IA con consultas repetidas
    private function limitarConsultas(): void
    {
        Sesion::iniciar();
        $ahora = time();
        $v = $_SESSION['ia_ventana'] ?? ['desde' => $ahora, 'n' => 0];
        if ($ahora - $v['desde'] >= 60) $v = ['desde' => $ahora, 'n' => 0];
        if ($v['n'] >= self::LIMITE_POR_MINUTO) {
            throw new ErrorApi(429, 'Hiciste demasiadas consultas seguidas al asistente. Espera un minuto e inténtalo de nuevo.');
        }
        $v['n']++;
        $_SESSION['ia_ventana'] = $v;
    }

    // RF13 (servicio de IA): sugiere la prioridad de una obligación según su valor y los días que faltan
    public function sugerirPrioridad(array $d): array
    {
        Sesion::requerirId();
        $valorTxt = is_scalar($d['valor'] ?? null) ? trim((string) $d['valor']) : '';
        $fecha = is_scalar($d['fechaLimite'] ?? null) ? trim((string) $d['fechaLimite']) : '';

        $errores = [];
        if (!is_numeric($valorTxt) || (float) $valorTxt <= 0) $errores[] = 'El valor debe ser mayor que 0.';
        elseif ((float) $valorTxt > self::VALOR_MAXIMO) $errores[] = 'El valor es demasiado grande.';
        if (!Fechas::valida($fecha)) $errores[] = 'La fecha límite no es válida.';
        if ($errores) throw ErrorApi::validacion($errores);

        $this->limitarConsultas();

        $diff = (new DateTime(Fechas::hoy()))->diff(new DateTime($fecha));
        $dias = max(-365, min(365, $diff->invert ? -$diff->days : $diff->days));

        $r = $this->llamar('POST', '/predecir', ['dias_para_vencer' => $dias, 'valor' => (float) $valorTxt]);

        return [
            'prioridad' => $r['prioridad_sugerida'] ?? null,
            'confianza' => $r['confianza'] ?? null,
            'probabilidades' => $r['probabilidades'] ?? [],
            'requiereRevision' => (bool) ($r['requiere_revision'] ?? true),
            'versionModelo' => $r['version_modelo'] ?? 'desconocida',
            'diasParaVencer' => $dias,
            'nota' => $r['nota'] ?? '',
        ];
    }

    // Estado del servicio y ficha del modelo (versión, métricas, limitaciones)
    public function estado(): array
    {
        Sesion::requerirId();
        return ['disponible' => true, 'modelo' => $this->llamar('GET', '/modelo')];
    }

    private function llamar(string $metodo, string $ruta, ?array $cuerpo = null): array
    {
        if (!ini_get('allow_url_fopen')) {
            error_log('FinanTask: allow_url_fopen está desactivado en php.ini');
            throw new ErrorApi(500, 'El servidor no puede comunicarse con el servicio de IA (activa allow_url_fopen en php.ini).');
        }
        $c = $this->config();
        $contexto = stream_context_create(['http' => [
            'method' => $metodo,
            'header' => "Content-Type: application/json\r\nAccept: application/json\r\n",
            'content' => $cuerpo !== null ? json_encode($cuerpo) : '',
            'timeout' => $c['timeout'],
            'ignore_errors' => true, // para poder leer el cuerpo de las respuestas 4xx y 5xx
        ]]);

        $respuesta = @file_get_contents($c['url'] . $ruta, false, $contexto);
        if ($respuesta === false) {
            error_log('FinanTask: el servicio de IA no respondió en ' . $c['url']);
            throw new ErrorApi(503, 'El servicio de inteligencia artificial no está disponible. Inicia el servicio (uvicorn api:app) e inténtalo de nuevo.');
        }

        $estado = 0;
        foreach ($http_response_header ?? [] as $linea) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $linea, $m)) $estado = (int) $m[1];
        }
        if ($estado === 422) {
            throw new ErrorApi(400, 'Los datos enviados al servicio de IA no son válidos.');
        }
        $datos = json_decode($respuesta, true);
        if ($estado !== 200 || !is_array($datos)) {
            error_log("FinanTask: el servicio de IA respondió HTTP $estado");
            throw new ErrorApi(502, 'El servicio de inteligencia artificial respondió con un error. Inténtalo más tarde.');
        }
        return $datos;
    }
}
