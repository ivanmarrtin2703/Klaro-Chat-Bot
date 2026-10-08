import { sendWhatsAppText } from '../../cloudflare/whatsapp.js';

/**
 * Endpoint para cron externo (Cloudflare Cron / servicio).
 * En v1 lista citas confirmed y envía recordatorio texto si hay token.
 * Header: Authorization: Bearer CRON_SECRET
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = request.headers.get('Authorization') || '';
  const secret = env.CRON_SECRET || '';
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response('unauthorized', { status: 401 });
  }

  const { results } = await env.DB.prepare(
    `SELECT * FROM appointments WHERE status = 'confirmed' ORDER BY id DESC LIMIT 20`
  ).all();

  let sent = 0;
  for (const ap of results || []) {
    const body = `Recordatorio CitaClara: tienes cita en ${ap.starts_at}. Si no puedes venir, avísanos por este chat.`;
    const r = await sendWhatsAppText(env, ap.client_phone, body);
    if (r.ok) sent++;
  }

  return new Response(JSON.stringify({ candidates: (results || []).length, sent }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
