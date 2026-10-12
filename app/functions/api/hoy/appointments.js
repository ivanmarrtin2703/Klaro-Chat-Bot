import { verifyLocalSession } from '../../../cloudflare/auth.js';
import { getSalonBySlug } from '../../../cloudflare/salon.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

async function salonFromLocal(context) {
  const local = await verifyLocalSession(context.env, context.request.headers.get('Cookie') || '');
  if (!local) return null;
  return getSalonBySlug(context.env.DB, local.slug);
}

export async function onRequestGet(context) {
  const salon = await salonFromLocal(context);
  if (!salon) return json({ error: 'unauthorized' }, 401);

  const { results } = await context.env.DB.prepare(
    `SELECT a.id, a.client_phone, a.client_name, a.starts_at, a.ends_at, a.status, s.name AS service_name
     FROM appointments a
     LEFT JOIN services s ON s.id = a.service_id
     WHERE a.salon_id = ? AND a.status IN ('confirmed', 'done')
     ORDER BY a.id DESC LIMIT 80`
  )
    .bind(salon.id)
    .all();

  return json({ appointments: results || [], salon: { name: salon.name, slug: salon.slug } });
}

export async function onRequestPatch(context) {
  const salon = await salonFromLocal(context);
  if (!salon) return json({ error: 'unauthorized' }, 401);

  const body = await context.request.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return json({ error: 'id requerido' }, 400);

  const row = await context.env.DB.prepare(
    `SELECT id FROM appointments WHERE id = ? AND salon_id = ?`
  )
    .bind(id, salon.id)
    .first();
  if (!row) return json({ error: 'not found' }, 404);

  await context.env.DB.prepare(`UPDATE appointments SET status = 'done' WHERE id = ?`)
    .bind(id)
    .run();
  return json({ ok: true });
}
