-- Agency multi-local: tipo, pausa bot, cobros, PIN panel Hoy
ALTER TABLE salons ADD COLUMN business_type TEXT NOT NULL DEFAULT 'peluqueria';
ALTER TABLE salons ADD COLUMN bot_paused INTEGER NOT NULL DEFAULT 0;
ALTER TABLE salons ADD COLUMN paused_message TEXT;
ALTER TABLE salons ADD COLUMN monthly_fee REAL NOT NULL DEFAULT 129;
ALTER TABLE salons ADD COLUMN next_payment_at TEXT;
ALTER TABLE salons ADD COLUMN billing_status TEXT NOT NULL DEFAULT 'ok';
ALTER TABLE salons ADD COLUMN owner_phone TEXT;
ALTER TABLE salons ADD COLUMN agency_notes TEXT;
ALTER TABLE salons ADD COLUMN local_pin TEXT;
