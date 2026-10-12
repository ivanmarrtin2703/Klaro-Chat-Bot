import { verifySession } from '../../../cloudflare/auth.js';
import { ensureDemoSalon, getSalonBySlug } from '../../../cloudflare/salon.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestGet(context) {
  if (!(await verifySession(context.env, context.request.headers.get('Cookie') || ''))) {
    return json({ error: 'unauthorized' }, 401);
  }
  const slug = new URL(context.request.url).searchParams.get('slug') || 'fisio-demo';
  await ensureDemoSalon(context.env.DB);
  const salon = await getSalonBySlug(context.env.DB, slug);
  if (!salon) return json({ error: 'salon not found' }, 404);
  const { results } = await context.env.DB.prepare(
    `SELECT a.*, s.name AS service_name FROM appointments a
     LEFT JOIN services s ON s.id = a.service_id
     WHERE a.salon_id = ? ORDER BY a.id DESC LIMIT 100`
  )
    .bind(salon.id)
    .all();
  return json({ appointments: results || [] });
}

export async function onRequestPatch(context) {
  if (!(await verifySession(context.env, context.request.headers.get('Cookie') || ''))) {
    return json({ error: 'unauthorized' }, 401);
  }
  const body = await context.request.json().catch(() => ({}));
  const id = Number(body.id);
  const status = String(body.status || '').trim();
  if (!id || !status) return json({ error: 'id y status requeridos' }, 400);
  await context.env.DB.prepare(`UPDATE appointments SET status = ? WHERE id = ?`)
    .bind(status, id)
    .run();
  return json({ ok: true });
}
