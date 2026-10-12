import { demoBrain } from '../data/atelier-luna.js';
import { fisioDemoBrain } from '../data/fisio-demo.js';

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const DEMO_BRAINS = [demoBrain, fisioDemoBrain];

async function insertSalonFromBrain(db, brain) {
  const hours_json = JSON.stringify(brain.hours);
  const insert = await db
    .prepare(
      `INSERT INTO salons (
        slug, name, neighborhood, timezone, tone, greeting, handoff_phone, cancel_policy_hours, hours_json,
        business_type, bot_paused, paused_message, monthly_fee, next_payment_at, billing_status,
        owner_phone, agency_notes, local_pin
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, NULL, ?, ?, NULL, ?)`
    )
    .bind(
      brain.slug,
      brain.name,
      brain.neighborhood || null,
      brain.timezone || 'Europe/Madrid',
      brain.tone || 'cercano',
      brain.greeting || null,
      brain.handoff_phone || null,
      brain.cancel_policy_hours ?? 12,
      hours_json,
      brain.business_type || 'otro',
      brain.paused_message || null,
      brain.monthly_fee ?? 129,
      brain.billing_status || 'ok',
      brain.owner_phone || null,
      brain.local_pin || null
    )
    .run();

  const salonId = insert.meta.last_row_id;
  for (const s of brain.services || []) {
    await db
      .prepare(
        `INSERT INTO services (salon_id, name, price_eur, duration_min, category) VALUES (?, ?, ?, ?, ?)`
      )
      .bind(salonId, s.name, s.price_eur, s.duration_min, s.category || null)
      .run();
  }
  for (const st of brain.staff || []) {
    await db
      .prepare(`INSERT INTO staff (salon_id, name, services_csv, days_csv) VALUES (?, ?, ?, ?)`)
      .bind(salonId, st.name, (st.services || []).join(','), (st.days || []).join(','))
      .run();
  }
  return salonId;
}

async function ensureDemoAgencyDefaults(db, brain) {
  try {
    const row = await db.prepare(`SELECT id, local_pin, business_type FROM salons WHERE slug = ?`).bind(brain.slug).first();
    if (!row) return;
    if (!row.local_pin || !row.business_type) {
      await db
        .prepare(
          `UPDATE salons SET local_pin = COALESCE(NULLIF(local_pin, ''), ?),
           business_type = COALESCE(NULLIF(business_type, ''), ?),
           paused_message = COALESCE(paused_message, ?),
           monthly_fee = COALESCE(monthly_fee, ?)
           WHERE id = ?`
        )
        .bind(
          brain.local_pin || '4321',
          brain.business_type || 'otro',
          brain.paused_message || null,
          brain.monthly_fee ?? 129,
          row.id
        )
        .run();
    }
  } catch {
    /* columnas aún no migradas */
  }
}

/** Siembra demos (pelu + fisio) si no existen. */
export async function ensureDemoSalon(db) {
  let firstId = null;
  for (const brain of DEMO_BRAINS) {
    const existing = await db.prepare(`SELECT id FROM salons WHERE slug = ?`).bind(brain.slug).first();
    if (existing) {
      await ensureDemoAgencyDefaults(db, brain);
      if (!firstId) firstId = existing.id;
      continue;
    }
    try {
      const id = await insertSalonFromBrain(db, brain);
      if (!firstId) firstId = id;
    } catch (err) {
      // Migración 0002 aún no aplicada: fallback columnas v1
      if (brain.slug !== demoBrain.slug) continue;
      const hours_json = JSON.stringify(brain.hours);
      const insert = await db
        .prepare(
          `INSERT INTO salons (slug, name, neighborhood, timezone, tone, greeting, handoff_phone, cancel_policy_hours, hours_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          brain.slug,
          brain.name,
          brain.neighborhood,
          brain.timezone,
          brain.tone,
          brain.greeting,
          brain.handoff_phone || null,
          brain.cancel_policy_hours,
          hours_json
        )
        .run();
      firstId = insert.meta.last_row_id;
      for (const s of brain.services) {
        await db
          .prepare(
            `INSERT INTO services (salon_id, name, price_eur, duration_min, category) VALUES (?, ?, ?, ?, ?)`
          )
          .bind(firstId, s.name, s.price_eur, s.duration_min, s.category || null)
          .run();
      }
      for (const st of brain.staff) {
        await db
          .prepare(`INSERT INTO staff (salon_id, name, services_csv, days_csv) VALUES (?, ?, ?, ?)`)
          .bind(firstId, st.name, (st.services || []).join(','), (st.days || []).join(','))
          .run();
      }
    }
  }
  return firstId;
}

export async function listSalons(db) {
  await ensureDemoSalon(db);
  const { results } = await db
    .prepare(
      `SELECT id, slug, name, neighborhood, business_type, bot_paused, monthly_fee, next_payment_at,
              billing_status, owner_phone, agency_notes, local_pin, tone, cancel_policy_hours
       FROM salons ORDER BY name`
    )
    .all();
  return results || [];
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

export async function createSalonFromPayload(db, payload) {
  const brain = {
    slug: String(payload.slug || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, ''),
    name: String(payload.name || '').trim(),
    business_type: payload.business_type || 'otro',
    neighborhood: payload.neighborhood || '',
    timezone: payload.timezone || 'Europe/Madrid',
    tone: payload.tone || 'cercano',
    greeting: payload.greeting || `Hola, soy la recepcionista de ${payload.name}. ¿En qué te ayudo?`,
    handoff_phone: payload.handoff_phone || '',
    owner_phone: payload.owner_phone || '',
    cancel_policy_hours: Number(payload.cancel_policy_hours) || 12,
    monthly_fee: Number(payload.monthly_fee) || 129,
    billing_status: payload.billing_status || 'pending',
    local_pin: payload.local_pin || String(Math.floor(1000 + Math.random() * 9000)),
    paused_message:
      payload.paused_message ||
      'Ahora mismo no podemos atender por WhatsApp. Llamanos o inténtalo más tarde.',
    hours: payload.hours || {
      mon: ['10:00-14:00', '17:00-20:00'],
      tue: ['10:00-14:00', '17:00-20:00'],
      wed: ['10:00-14:00', '17:00-20:00'],
      thu: ['10:00-14:00', '17:00-20:00'],
      fri: ['10:00-14:00', '17:00-20:00'],
      sat: ['10:00-14:00'],
      sun: []
    },
    services: payload.services || [],
    staff: payload.staff || []
  };
  if (!brain.slug || !brain.name) throw new Error('slug y name requeridos');
  const id = await insertSalonFromBrain(db, brain);
  return getSalonBySlug(db, brain.slug);
}

export async function patchSalon(db, slug, patch) {
  const salon = await getSalonBySlug(db, slug);
  if (!salon) return null;

  const fields = [];
  const values = [];
  const map = {
    business_type: 'business_type',
    bot_paused: 'bot_paused',
    paused_message: 'paused_message',
    monthly_fee: 'monthly_fee',
    next_payment_at: 'next_payment_at',
    billing_status: 'billing_status',
    owner_phone: 'owner_phone',
    agency_notes: 'agency_notes',
    local_pin: 'local_pin',
    handoff_phone: 'handoff_phone',
    tone: 'tone',
    greeting: 'greeting',
    name: 'name',
    neighborhood: 'neighborhood'
  };

  for (const [key, col] of Object.entries(map)) {
    if (patch[key] === undefined) continue;
    fields.push(`${col} = ?`);
    if (key === 'bot_paused') values.push(patch[key] ? 1 : 0);
    else values.push(patch[key]);
  }

  if (fields.length) {
    values.push(salon.id);
    await db.prepare(`UPDATE salons SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  }
  return getSalonBySlug(db, slug);
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
  return (services || [])
    .map((s) => `• ${s.name}: ${Number(s.price_eur).toFixed(0)} € (~${s.duration_min} min)`)
    .join('\n');
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
  const type = salon.business_type || 'otro';
  const healthNote =
    type === 'fisio'
      ? 'NO pidas síntomas, historial clínico ni datos de salud. Solo precios, horarios y citas.'
      : '';
  return [
    `Local: ${salon.name} (${salon.neighborhood || ''})`,
    `Tipo: ${type}`,
    `Tono: ${salon.tone}`,
    `Política cancelación: gratis si avisas con más de ${salon.cancel_policy_hours}h`,
    healthNote,
    'Horario:',
    formatHours(salon.hours),
    'Servicios (NO inventes precios fuera de esta lista):',
    formatServices(salon.services),
    'Profesionales: ' + (salon.staff || []).map((s) => s.name).join(', ')
  ]
    .filter(Boolean)
    .join('\n');
}
