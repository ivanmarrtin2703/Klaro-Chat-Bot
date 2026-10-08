import { verifySession } from '../../../cloudflare/auth.js';
import { ensureDemoSalon, getSalonBySlug } from '../../../cloudflare/salon.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

async function requireAuth(context) {
  return verifySession(context.env, context.request.headers.get('Cookie') || '');
}

export async function onRequestGet(context) {
  if (!(await requireAuth(context))) return json({ error: 'unauthorized' }, 401);
  const slug = new URL(context.request.url).searchParams.get('slug') || 'atelier-luna';
  await ensureDemoSalon(context.env.DB);
  const salon = await getSalonBySlug(context.env.DB, slug);
  return json({ services: salon?.services || [] });
}

export async function onRequestPut(context) {
  if (!(await requireAuth(context))) return json({ error: 'unauthorized' }, 401);
  const body = await context.request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return json({ error: 'id requerido' }, 400);
  const price = body.price_eur != null ? Number(body.price_eur) : null;
  const name = body.name != null ? String(body.name).trim() : null;
  const duration = body.duration_min != null ? Number(body.duration_min) : null;
  const active = body.active != null ? (body.active ? 1 : 0) : null;

  const row = await context.env.DB.prepare(`SELECT * FROM services WHERE id = ?`).bind(id).first();
  if (!row) return json({ error: 'not found' }, 404);

  await context.env.DB.prepare(
    `UPDATE services SET name = ?, price_eur = ?, duration_min = ?, active = ? WHERE id = ?`
  )
    .bind(
      name ?? row.name,
      price ?? row.price_eur,
      duration ?? row.duration_min,
      active ?? row.active,
      id
    )
    .run();

  return json({ ok: true });
}

export async function onRequestPost(context) {
  if (!(await requireAuth(context))) return json({ error: 'unauthorized' }, 401);
  const body = await context.request.json().catch(() => ({}));
  const slug = String(body.slug || 'atelier-luna');
  await ensureDemoSalon(context.env.DB);
  const salon = await getSalonBySlug(context.env.DB, slug);
  if (!salon) return json({ error: 'salon not found' }, 404);
  const name = String(body.name || '').trim();
  const price_eur = Number(body.price_eur);
  const duration_min = Number(body.duration_min || 45);
  if (!name || Number.isNaN(price_eur)) return json({ error: 'name y price_eur requeridos' }, 400);
  await context.env.DB.prepare(
    `INSERT INTO services (salon_id, name, price_eur, duration_min, category) VALUES (?, ?, ?, ?, ?)`
  )
    .bind(salon.id, name, price_eur, duration_min, body.category || null)
    .run();
  return json({ ok: true });
}
