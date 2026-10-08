import { demoBrain } from '../data/atelier-luna.js';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export async function ensureDemoSalon(db) {
  const existing = await db.prepare(`SELECT id FROM salons WHERE slug = ?`).bind(demoBrain.slug).first();
  if (existing) return existing.id;

  const hours_json = JSON.stringify(demoBrain.hours);
  const insert = await db
    .prepare(
      `INSERT INTO salons (slug, name, neighborhood, timezone, tone, greeting, handoff_phone, cancel_policy_hours, hours_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      demoBrain.slug,
      demoBrain.name,
      demoBrain.neighborhood,
      demoBrain.timezone,
      demoBrain.tone,
      demoBrain.greeting,
      demoBrain.handoff_phone || null,
      demoBrain.cancel_policy_hours,
      hours_json
    )
    .run();

  const salonId = insert.meta.last_row_id;
  for (const s of demoBrain.services) {
    await db
      .prepare(
        `INSERT INTO services (salon_id, name, price_eur, duration_min, category) VALUES (?, ?, ?, ?, ?)`
      )
      .bind(salonId, s.name, s.price_eur, s.duration_min, s.category || null)
      .run();
  }
  for (const st of demoBrain.staff) {
    await db
      .prepare(`INSERT INTO staff (salon_id, name, services_csv, days_csv) VALUES (?, ?, ?, ?)`)
      .bind(salonId, st.name, (st.services || []).join(','), (st.days || []).join(','))
      .run();
  }
  return salonId;
}

export async function getSalonBySlug(db, slug) {
  await ensureDemoSalon(db);
  const salon = await db.prepare(`SELECT * FROM salons WHERE slug = ?`).bind(slug).first();
  if (!salon) return null;
  const services = (
    await db.prepare(`SELECT * FROM services WHERE salon_id = ? AND active = 1 ORDER BY id`).bind(salon.id).all()
  ).results;
  const staff = (
    await db.prepare(`SELECT * FROM staff WHERE salon_id = ? AND active = 1 ORDER BY id`).bind(salon.id).all()
  ).results;
  return {
    ...salon,
    hours: JSON.parse(salon.hours_json || '{}'),
    services,
    staff
  };
}

export function formatHours(hours) {
  const labels = {
    mon: 'Lunes',
    tue: 'Martes',
    wed: 'Miércoles',
    thu: 'Jueves',
    fri: 'Viernes',
    sat: 'Sábado',
    sun: 'Domingo'
  };
  return Object.keys(labels)
    .map((k) => {
      const slots = hours[k] || [];
      return `${labels[k]}: ${slots.length ? slots.join(', ') : 'cerrado'}`;
    })
    .join('\n');
}

export function formatServices(services) {
  return services.map((s) => `• ${s.name}: ${Number(s.price_eur).toFixed(0)} € (~${s.duration_min} min)`).join('\n');
}

export function isOpenNow(hours, date = new Date()) {
  const key = DAY_KEYS[date.getDay()];
  const slots = hours[key] || [];
  if (!slots.length) return false;
  const mins = date.getHours() * 60 + date.getMinutes();
  return slots.some((slot) => {
    const [a, b] = slot.split('-');
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);
    return mins >= ah * 60 + am && mins <= bh * 60 + bm;
  });
}

export function brainText(salon) {
  return [
    `Salón: ${salon.name} (${salon.neighborhood || ''})`,
    `Tono: ${salon.tone}`,
    `Política cancelación: gratis si avisas con más de ${salon.cancel_policy_hours}h`,
    'Horario:',
    formatHours(salon.hours),
    'Servicios (NO inventes precios fuera de esta lista):',
    formatServices(salon.services),
    'Profesionales: ' + salon.staff.map((s) => s.name).join(', ')
  ].join('\n');
}
