-- =============================================================================
-- FIRME STUDIO — PILATES REFORMER & BOUTIQUE
-- SUPABASE DATABASE SCHEMA (POSTGRESQL + REALTIME)
-- Sede: Jr. Akapana 1261, Lima - San Juan de Lurigancho (SJL), Perú
-- Aforo: 8 Reformer Allegro 2 Balanced Body por sesión
-- =============================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 2. TABLA: classes (Horarios y Sesiones Semanales)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL CHECK (day IN ('lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom')),
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  instructor TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Principiante', 'Intermedio', 'Avanzado')),
  class_type TEXT NOT NULL CHECK (class_type IN ('Reformer', 'Mat', 'Suspensión')),
  duration TEXT NOT NULL DEFAULT '50 min',
  total_spots INTEGER NOT NULL DEFAULT 8,
  occupied_spots INTEGER NOT NULL DEFAULT 0,
  focus TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. TABLA: clients (Perfiles de Alumnas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY DEFAULT ('cli-' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT),
  name TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  current_plan TEXT DEFAULT 'Pack 8 Sesiones',
  plan_type TEXT DEFAULT 'pack' CHECK (plan_type IN ('ilimitado', 'pack', 'clase_suelta', 'prueba')),
  credits_left INTEGER NOT NULL DEFAULT 8,
  total_attended INTEGER NOT NULL DEFAULT 0,
  exp_points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'en_riesgo', 'inactivo')),
  emergency_contact TEXT,
  medical_notes TEXT,
  join_date TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. TABLA: bookings (Reservas y Auto Check-in en Tótem SJL)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY DEFAULT ('b-' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT),
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name TEXT NOT NULL,
  class_time TEXT NOT NULL,
  class_day TEXT NOT NULL,
  instructor TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_dni TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  status TEXT NOT NULL DEFAULT 'confirmada' CHECK (status IN ('confirmada', 'asistio', 'cancelada')),
  bed_number INTEGER CHECK (bed_number BETWEEN 1 AND 8),
  is_waitlist BOOLEAN DEFAULT FALSE,
  medical_alert TEXT,
  check_in_time TEXT,
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  whatsapp_reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. TABLA: cash_transactions (Caja Chica, Ingresos y POS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.cash_transactions (
  id TEXT PRIMARY KEY DEFAULT ('tx-' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT),
  type TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso')),
  concept TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('membresia', 'pack_clases', 'clase_suelta', 'tienda_calcetines', 'bebidas', 'otro')),
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('yape', 'plin', 'tarjeta_pos', 'efectivo', 'transferencia_bcp', 'transferencia_bbva')),
  date TIMESTAMPTZ DEFAULT NOW(),
  client_name TEXT,
  receipt_type TEXT CHECK (receipt_type IN ('boleta', 'factura', 'ninguno')),
  receipt_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. TABLA: expenses (Gastos del Estudio)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY DEFAULT ('exp-' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT),
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('alquiler', 'servicios', 'honorarios_profesores', 'mantenimiento_camas', 'marketing', 'limpieza_insumos', 'otro')),
  amount NUMERIC(10, 2) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pagado', 'pendiente', 'vencido')),
  proof_file TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. TABLA: leads (Prospectos de WhatsApp y Clase de Prueba)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY DEFAULT ('lead-' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('nuevo', 'contactado', 'prueba_agendada', 'convertido', 'descartado')),
  origin TEXT NOT NULL CHECK (origin IN ('instagram_ad', 'tiktok', 'google_maps', 'recomendacion_boca_a_boca', 'visita_presencial_sjl', 'whatsapp_directo')),
  interest_level TEXT CHECK (interest_level IN ('alta', 'media', 'baja')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  trial_class_booked_at TIMESTAMPTZ
);

-- =============================================================================
-- 8. TABLA: boutique_orders (Canjes y Compras de la Boutique)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.boutique_orders (
  id TEXT PRIMARY KEY DEFAULT ('ord-' || FLOOR(EXTRACT(EPOCH FROM NOW()) * 1000)::TEXT),
  product_name TEXT NOT NULL,
  variant TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('efectivo', 'exp')),
  cost_text TEXT NOT NULL,
  voucher_code TEXT UNIQUE NOT NULL,
  client_dni TEXT,
  date_formatted TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente_retiro' CHECK (status IN ('pendiente_retiro', 'entregado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. ÍNDICES DE ALTO RENDIMIENTO
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_classes_day ON public.classes(day);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON public.bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_dni ON public.bookings(client_dni);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_clients_dni ON public.clients(dni);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.cash_transactions(date);

-- =============================================================================
-- 10. SEGURIDAD Y POLÍTICAS RLS (Row Level Security)
-- =============================================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boutique_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de clases" ON public.classes;
CREATE POLICY "Permitir lectura publica de clases" ON public.classes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir lectura de reservas por DNI o ID" ON public.bookings;
CREATE POLICY "Permitir lectura de reservas por DNI o ID" ON public.bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion de reservas" ON public.bookings;
CREATE POLICY "Permitir insercion de reservas" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir check-in de reservas en Totem" ON public.bookings;
CREATE POLICY "Permitir check-in de reservas en Totem" ON public.bookings FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura de clientes" ON public.clients;
CREATE POLICY "Permitir lectura de clientes" ON public.clients FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir actualizacion de clientes" ON public.clients;
CREATE POLICY "Permitir actualizacion de clientes" ON public.clients FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir transacciones de caja" ON public.cash_transactions;
CREATE POLICY "Permitir transacciones de caja" ON public.cash_transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir gestion de leads" ON public.leads;
CREATE POLICY "Permitir gestion de leads" ON public.leads FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir gestion de pedidos boutique" ON public.boutique_orders;
CREATE POLICY "Permitir gestion de pedidos boutique" ON public.boutique_orders FOR ALL USING (true);

-- =============================================================================
-- 11. TABLA: staff_profiles (Roles RBAC: OWNER DEV, ADMIN y CLIENTES)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner_dev', 'admin', 'client')),
  role_title TEXT NOT NULL,
  phone TEXT,
  dni TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura de perfiles de staff" ON public.staff_profiles;
CREATE POLICY "Permitir lectura de perfiles de staff" ON public.staff_profiles FOR SELECT USING (true);

-- Seed de los miembros autorizados del Staff de FIRME STUDIO:
INSERT INTO public.staff_profiles (id, name, email, role, role_title, phone, dni)
VALUES
  ('staff-valentino', 'Valentino', 'valentino@firmestudio.pe', 'owner_dev', 'Owner / Lead Developer', '+51 987 654 321', '70112233'),
  ('staff-soni', 'Soni', 'soni@firmestudio.pe', 'admin', 'Administración Sede SJL', '+51 991 223 344', '71223344'),
  ('staff-keyla', 'Keyla', 'keyla@firmestudio.pe', 'admin', 'Administración & Operaciones', '+51 982 334 455', '72334455')
ON CONFLICT (email) DO UPDATE 
SET role = EXCLUDED.role, 
    role_title = EXCLUDED.role_title;

-- =============================================================================
-- 12. DATOS INICIALES (SEED): HORARIOS DE CLASES DE LA SEMANA (LUNES A DOMINGO)
-- =============================================================================
INSERT INTO public.classes (id, day, time, name, instructor, level, class_type, duration, total_spots, occupied_spots, focus)
VALUES
  ('lun-1', 'lun', '07:30', 'Fundamentos Reformer', 'Valeria Soler', 'Principiante', 'Reformer', '50 min', 8, 5, 'Alineación, respiración y control motor básico'),
  ('lun-2', 'lun', '09:00', 'Reformer Flow Dinámico', 'Mateo Arismendi', 'Intermedio', 'Reformer', '50 min', 8, 8, 'Secuencias continuas y resistencia articular'),
  ('lun-3', 'lun', '18:00', 'Suspensión & Tower Core', 'Clara Domínguez', 'Avanzado', 'Suspensión', '55 min', 6, 4, 'Fuerza excéntrica y estabilidad de columna en muelles y arneses'),
  ('lun-4', 'lun', '19:30', 'Restorative Mat & Breathwork', 'Valeria Soler', 'Principiante', 'Mat', '50 min', 8, 7, 'Descompresión espinal, suelo consciente y movilidad articular'),
  ('mar-1', 'mar', '08:00', 'Contrology Clásico Reformer', 'Mateo Arismendi', 'Intermedio', 'Reformer', '50 min', 8, 6, 'Principios originales de Joseph Pilates en Reformer'),
  ('mar-2', 'mar', '10:00', 'Suspensión Aérea & Muelles', 'Clara Domínguez', 'Avanzado', 'Suspensión', '50 min', 8, 8, 'Inversiones guiadas, control de gravedad y fuerza del centro'),
  ('mar-3', 'mar', '17:30', 'Fundamentos Reformer', 'Valeria Soler', 'Principiante', 'Reformer', '50 min', 8, 3, 'Estructura postural y manejo de resortes'),
  ('mar-4', 'mar', '19:00', 'Mat Postural & Spine Flow', 'Clara Domínguez', 'Principiante', 'Mat', '50 min', 8, 8, 'Apertura de cadera, cintura escapular y alineación en suelo'),
  ('mie-1', 'mie', '07:30', 'Reformer Flow Dinámico', 'Mateo Arismendi', 'Intermedio', 'Reformer', '50 min', 8, 8, 'Ritmo sostenido, coordinación neuromuscular y resistencia'),
  ('mie-2', 'mie', '09:00', 'Tower Cadillac Suspensión', 'Valeria Soler', 'Avanzado', 'Suspensión', '55 min', 6, 4, 'Inversiones seguras, barras de empuje y elongación axial'),
  ('mie-3', 'mie', '18:00', 'Fundamentos Reformer', 'Clara Domínguez', 'Principiante', 'Reformer', '50 min', 8, 6, 'Centro fuerte y control de pelvis neutra'),
  ('mie-4', 'mie', '19:30', 'Deep Stretch & Mat Release', 'Valeria Soler', 'Principiante', 'Mat', '50 min', 8, 2, 'Liberación miofascial y flexibilidad profunda sobre esterilla'),
  ('jue-1', 'jue', '08:30', 'Contrology Clásico Reformer', 'Mateo Arismendi', 'Intermedio', 'Reformer', '50 min', 8, 5, 'Precisión técnica en aparatos tradicionales'),
  ('jue-2', 'jue', '11:00', 'Reformer Escultural', 'Clara Domínguez', 'Avanzado', 'Reformer', '50 min', 8, 8, 'Tono muscular largo y estabilización lumbar'),
  ('jue-3', 'jue', '18:30', 'Suspensión Power & Stability', 'Mateo Arismendi', 'Intermedio', 'Suspensión', '50 min', 8, 7, 'Trabajo con peso corporal suspendido y core tridimensional'),
  ('vie-1', 'vie', '07:30', 'Sunrise Reformer', 'Valeria Soler', 'Principiante', 'Reformer', '50 min', 8, 6, 'Despertar neuromuscular y movilidad matutina'),
  ('vie-2', 'vie', '09:30', 'Tower Suspensión Challenge', 'Clara Domínguez', 'Avanzado', 'Suspensión', '55 min', 6, 6, 'Control en barra de empuje y muelles pesados'),
  ('vie-3', 'vie', '18:00', 'Mat & Roller Miofascial', 'Mateo Arismendi', 'Intermedio', 'Mat', '50 min', 8, 4, 'Alivio de tensiones posturales con foam roller y trabajo en suelo'),
  ('sab-1', 'sab', '09:30', 'Masterclass Weekend Reformer', 'Valeria Soler', 'Avanzado', 'Reformer', '60 min', 8, 8, 'Secuencias integrales de repertorio completo'),
  ('sab-2', 'sab', '11:00', 'Fundamentos & Técnica Mat', 'Clara Domínguez', 'Principiante', 'Mat', '50 min', 8, 3, 'Taller práctico de postura, suelo clásico y biomecánica'),
  ('sab-3', 'sab', '12:30', 'Suspensión Flow de Tarde', 'Mateo Arismendi', 'Intermedio', 'Suspensión', '50 min', 8, 5, 'Equilibrio dinámico, coordinación y centro suspendido'),
  ('dom-1', 'dom', '10:00', 'Domingo Consciente: Mat Clásico', 'Clara Domínguez', 'Principiante', 'Mat', '60 min', 6, 4, 'Práctica pausada en colchoneta, propiocepción y flexibilidad'),
  ('dom-2', 'dom', '11:30', 'Reformer Posture Reset', 'Valeria Soler', 'Intermedio', 'Reformer', '50 min', 8, 7, 'Rebalance muscular en carro para iniciar la semana')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 13. HABILITAR SUPABASE REALTIME
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes, public.bookings, public.clients;
