-- ====================================================================
-- ESQUEMA DE BASE DE DATOS POSTGRESQL / SUPABASE
-- Sistema Web de Venta de Boletos de Transporte Interparroquial E35
-- Corredor Tulcán - Ibarra (125 km)
-- ====================================================================

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula VARCHAR(13) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    is_preferential BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT', -- 'CLIENT', 'CONTROLLER', 'ADMIN'
    cooperative_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_cedula ON users(cedula);

-- 2. TABLA DE PARADAS DEL CORREDOR E35 (Tulcán a Ibarra)
CREATE TABLE IF NOT EXISTS stops (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    province VARCHAR(50) NOT NULL, -- 'Carchi' o 'Imbabura'
    stop_order INTEGER NOT NULL UNIQUE, -- 1: Tulcán ... 8: Ibarra
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    km_from_start DOUBLE PRECISION NOT NULL,
    image_url VARCHAR(255),
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_stop_order ON stops(stop_order);

-- 3. TABLA DE HORARIOS / FRECUENCIAS DE AUTOBÚS (Capacidad fija 40 asientos)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_number VARCHAR(100) NOT NULL,
    cooperative_name VARCHAR(100) NOT NULL,
    plate VARCHAR(20) NOT NULL,
    departure_time TIME NOT NULL,
    estimated_arrival_time TIME NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 40,
    driver_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schedule_departure ON schedules(departure_time);

-- 4. TABLA DE BOLETOS DIGITALES (TICKETS)
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    seat_number INTEGER NOT NULL CHECK (seat_number >= 1 AND seat_number <= 40),
    origin_stop_id BIGINT NOT NULL REFERENCES stops(id),
    destination_stop_id BIGINT NOT NULL REFERENCES stops(id),
    origin_order INTEGER NOT NULL,
    dest_order INTEGER NOT NULL,
    passenger_name VARCHAR(150) NOT NULL,
    passenger_cedula VARCHAR(13) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL,
    discount_applied NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    final_price NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- 'ONLINE_CARD', 'DEUNA_QR', 'CASH_CONTROLLER'
    status VARCHAR(30) NOT NULL,         -- 'PENDING_CASH', 'PAID', 'BOARDED', 'EXPIRED'
    qr_code_hash VARCHAR(100) NOT NULL UNIQUE,
    boarded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_schedule ON tickets(schedule_id);
CREATE INDEX IF NOT EXISTS idx_ticket_qr ON tickets(qr_code_hash);
CREATE INDEX IF NOT EXISTS idx_ticket_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_seat_schedule ON tickets(schedule_id, seat_number);
