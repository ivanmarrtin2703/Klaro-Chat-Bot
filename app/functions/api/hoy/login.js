import { createLocalSession, localSessionCookie } from '../../../cloudflare/auth.js';
import { getSalonBySlug, ensureDemoSalon } from '../../../cloudflare/salon.js';

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
}

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  const slug = String(body.slug || '').trim();
  const pin = String(body.pin || '');
  if (!slug || !pin) return json({ error: 'slug y pin requeridos' }, 400);

  await ensureDemoSalon(context.env.DB);
  const salon = await getSalonBySlug(context.env.DB, slug);
  if (!salon || !salon.local_pin || String(salon.local_pin) !== pin) {
    return json({ error: 'PIN incorrecto' }, 401);
  }

  const token = await createLocalSession(context.env, slug);
  return json({ ok: true, slug, name: salon.name }, 200, {
    'Set-Cookie': localSessionCookie(token)
  });
}
