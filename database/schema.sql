-- =====================================================================
-- FinanTask · Fase 4 · Estructura de la base de datos (MySQL / MariaDB)
-- Motor: InnoDB (necesario para claves foráneas y transacciones)
-- Ejecutar completo en phpMyAdmin (pestaña SQL) o con: mysql -u root < schema.sql
-- =====================================================================

SET NAMES utf8mb4;
DROP DATABASE IF EXISTS finantask;
CREATE DATABASE finantask CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finantask;

-- Usuarios del sistema (RF01, RF02). La contraseña se guarda cifrada (hash), nunca en texto plano.
CREATE TABLE usuarios (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(100) NOT NULL,
  correo           VARCHAR(150) NOT NULL,
  contrasena_hash  VARCHAR(255) NOT NULL,
  fecha_registro   DATE         NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_correo (correo)
) ENGINE=InnoDB;

-- Categorías para clasificar las obligaciones (RF07)
CREATE TABLE categorias (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(80)  NOT NULL,
  descripcion  VARCHAR(200) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categorias_nombre (nombre)
) ENGINE=InnoDB;

-- Obligaciones financieras de cada usuario (RF03 a RF07, RF09)
CREATE TABLE obligaciones (
  id                   INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_usuario           INT UNSIGNED  NOT NULL,
  id_categoria         INT UNSIGNED  NOT NULL,
  nombre               VARCHAR(100)  NOT NULL,
  descripcion          VARCHAR(150)  NOT NULL DEFAULT '',
  valor                DECIMAL(14,2) NOT NULL,
  fecha_limite         DATE          NOT NULL,
  prioridad            ENUM('ALTA','MEDIA','BAJA')           NOT NULL DEFAULT 'MEDIA',
  estado               ENUM('PENDIENTE','PAGADA','VENCIDA')  NOT NULL DEFAULT 'PENDIENTE',
  origen               ENUM('MANUAL','ASISTENTE_IA')         NOT NULL DEFAULT 'MANUAL',
  fecha_creacion       DATE          NOT NULL,
  fecha_actualizacion  DATE          NOT NULL,
  PRIMARY KEY (id),
  KEY idx_obligaciones_usuario_fecha (id_usuario, fecha_limite),
  CONSTRAINT fk_obligaciones_usuario   FOREIGN KEY (id_usuario)   REFERENCES usuarios (id),
  CONSTRAINT fk_obligaciones_categoria FOREIGN KEY (id_categoria) REFERENCES categorias (id),
  CONSTRAINT ck_obligaciones_valor CHECK (valor > 0)
) ENGINE=InnoDB;

-- Historial de pagos (RF08, RF10). Un pago pertenece a una obligación.
CREATE TABLE historial_pagos (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  id_obligacion  INT UNSIGNED  NOT NULL,
  fecha_pago     DATE          NOT NULL,
  valor_pagado   DECIMAL(14,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_pagos_obligacion (id_obligacion),
  CONSTRAINT fk_pagos_obligacion FOREIGN KEY (id_obligacion) REFERENCES obligaciones (id),
  CONSTRAINT ck_pagos_valor CHECK (valor_pagado > 0)
) ENGINE=InnoDB;
