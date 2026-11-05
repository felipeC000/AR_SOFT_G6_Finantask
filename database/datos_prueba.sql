-- =====================================================================
-- FinanTask · Fase 4 · Datos de prueba
-- Ejecutar DESPUÉS de schema.sql. Las fechas se calculan a partir de hoy
-- para que siempre haya obligaciones pendientes, próximas y vencidas.
-- Usuario de prueba:  demo@finantask.co  /  contraseña: demo1234
-- (la contraseña está guardada como hash bcrypt, no en texto plano)
-- =====================================================================

SET NAMES utf8mb4;
USE finantask;

INSERT INTO usuarios (id, nombre, correo, contrasena_hash, fecha_registro) VALUES
 (1, 'Usuario de prueba', 'demo@finantask.co',
  '$2y$10$bXEQqG.PiqYLwMb3wJuRJO33Qt.ABKaWgKFPtbcc.J3Bn4MtY8xvm',
  DATE_SUB(CURDATE(), INTERVAL 60 DAY));

INSERT INTO categorias (id, nombre, descripcion) VALUES
 (1, 'Servicios públicos',   'Agua, energía, gas, internet'),
 (2, 'Educación',            'Matrículas, cursos, materiales'),
 (3, 'Créditos y tarjetas',  'Cuotas de créditos y tarjetas de crédito'),
 (4, 'Suscripciones',        'Plataformas y servicios mensuales'),
 (5, 'Vivienda',             'Arriendo y administración'),
 (6, 'Otros',                'Pagos que no encajan en las demás');

INSERT INTO obligaciones
 (id, id_usuario, id_categoria, nombre, descripcion, valor, fecha_limite, prioridad, estado, origen, fecha_creacion, fecha_actualizacion) VALUES
 (1, 1, 1, 'Internet hogar',        'Factura mensual', 89900.00,   DATE_ADD(CURDATE(), INTERVAL 2 DAY),   'ALTA',  'PENDIENTE', 'MANUAL', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
 (2, 1, 4, 'Plataforma de música',  'Plan individual', 18900.00,   DATE_ADD(CURDATE(), INTERVAL 6 DAY),   'BAJA',  'PENDIENTE', 'MANUAL', DATE_SUB(CURDATE(), INTERVAL 20 DAY), DATE_SUB(CURDATE(), INTERVAL 20 DAY)),
 (3, 1, 2, 'Matrícula semestre',    'Segundo pago',    1250000.00, DATE_SUB(CURDATE(), INTERVAL 12 DAY),  'ALTA',  'PAGADA',    'MANUAL', DATE_SUB(CURDATE(), INTERVAL 40 DAY), DATE_SUB(CURDATE(), INTERVAL 14 DAY)),
 (4, 1, 3, 'Tarjeta de crédito',    'Pago mínimo',     245000.00,  DATE_SUB(CURDATE(), INTERVAL 3 DAY),   'ALTA',  'PENDIENTE', 'MANUAL', DATE_SUB(CURDATE(), INTERVAL 25 DAY), DATE_SUB(CURDATE(), INTERVAL 25 DAY)),
 (5, 1, 1, 'Energía',               'Factura del mes', 86450.00,   DATE_ADD(CURDATE(), INTERVAL 1 DAY),   'MEDIA', 'PENDIENTE', 'MANUAL', DATE_SUB(CURDATE(), INTERVAL 5 DAY),  DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
 (6, 1, 5, 'Arriendo',              'Apartamento',     950000.00,  DATE_ADD(CURDATE(), INTERVAL 15 DAY),  'ALTA',  'PENDIENTE', 'MANUAL', DATE_SUB(CURDATE(), INTERVAL 3 DAY),  DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
 (7, 1, 1, 'Plan de celular',       '',                55000.00,   DATE_SUB(CURDATE(), INTERVAL 20 DAY),  'MEDIA', 'PAGADA',    'MANUAL', DATE_SUB(CURDATE(), INTERVAL 45 DAY), DATE_SUB(CURDATE(), INTERVAL 21 DAY)),
 (8, 1, 4, 'Plataforma de video',   'Plan estándar',   26900.00,   DATE_ADD(CURDATE(), INTERVAL 24 DAY),  'BAJA',  'PENDIENTE', 'MANUAL', DATE_SUB(CURDATE(), INTERVAL 2 DAY),  DATE_SUB(CURDATE(), INTERVAL 2 DAY));

INSERT INTO historial_pagos (id, id_obligacion, fecha_pago, valor_pagado) VALUES
 (1, 3, DATE_SUB(CURDATE(), INTERVAL 14 DAY), 1250000.00),
 (2, 7, DATE_SUB(CURDATE(), INTERVAL 21 DAY), 55000.00);
