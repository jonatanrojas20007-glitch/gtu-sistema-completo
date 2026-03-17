-- Crear tablas
CREATE TABLE IF NOT EXISTS "Users" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('superadmin', 'admin', 'asesor')) DEFAULT 'asesor',
    email VARCHAR(255),
    "lastLogin" TIMESTAMP,
    status VARCHAR(50) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Students" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    "apellidoPaterno" VARCHAR(255) NOT NULL,
    "apellidoMaterno" VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    "nivelEducativo" VARCHAR(100) NOT NULL,
    escuela VARCHAR(255) NOT NULL,
    carrera VARCHAR(255) NOT NULL,
    municipio VARCHAR(255) NOT NULL,
    estado VARCHAR(100) DEFAULT 'Querétaro',
    latitud FLOAT,
    longitud FLOAT,
    "fechaRegistro" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "registradoPor" INTEGER REFERENCES "Users"(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Activities" (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(255),
    accion VARCHAR(255),
    modulo VARCHAR(255),
    ip VARCHAR(50),
    estado VARCHAR(50) CHECK (estado IN ('success', 'error', 'warning', 'info')) DEFAULT 'info',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_users_username ON "Users"(username);
CREATE INDEX idx_students_municipio ON "Students"(municipio);
CREATE INDEX idx_students_carrera ON "Students"(carrera);
CREATE INDEX idx_activities_fecha ON "Activities"(fecha);

-- Insertar usuarios iniciales
INSERT INTO "Users" (username, password, name, role) VALUES
('admin', 'admin123', 'Super Admin', 'superadmin'),
('directora', 'escuela123', 'Directora García', 'admin'),
('asesor', 'ver123', 'Asesor Pérez', 'asesor')
ON CONFLICT (username) DO NOTHING;
