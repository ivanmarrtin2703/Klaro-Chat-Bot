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
  const slug = new URL(context.request.url).searchParams.get('slug') || 'atelier-luna';
  await ensureDemoSalon(context.env.DB);
  const salon = await getSalonBySlug(context.env.DB, slug);
  const { results } = await context.env.DB.prepare(
    `SELECT * FROM appointments WHERE salon_id = ? ORDER BY id DESC LIMIT 100`
  )
    .bind(salon.id)
    .all();
  return json({ appointments: results || [] });
}
