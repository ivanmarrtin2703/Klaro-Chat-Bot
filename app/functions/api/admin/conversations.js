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
    `SELECT c.id, c.wa_from, c.updated_at,
      (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_message
     FROM conversations c WHERE c.salon_id = ? ORDER BY c.updated_at DESC LIMIT 50`
  )
    .bind(salon.id)
    .all();
  return json({ conversations: results || [] });
}
