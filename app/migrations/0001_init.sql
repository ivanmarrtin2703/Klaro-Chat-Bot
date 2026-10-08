CREATE TABLE IF NOT EXISTS salons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  neighborhood TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
  tone TEXT NOT NULL DEFAULT 'cercano',
  greeting TEXT,
  handoff_phone TEXT,
  cancel_policy_hours INTEGER NOT NULL DEFAULT 12,
  hours_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_eur REAL NOT NULL,
  duration_min INTEGER NOT NULL,
  category TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  services_csv TEXT,
  days_csv TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_phone TEXT NOT NULL,
  client_name TEXT,
  service_id INTEGER,
  staff_id INTEGER,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  wa_from TEXT NOT NULL,
  state_json TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(salon_id, wa_from)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_appointments_salon_starts ON appointments(salon_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_salon ON staff(salon_id);
