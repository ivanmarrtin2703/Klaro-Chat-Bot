import { verifyLocalSession } from '../../../cloudflare/auth.js';
import { getSalonBySlug } from '../../../cloudflare/salon.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestGet(context) {
  const local = await verifyLocalSession(context.env, context.request.headers.get('Cookie') || '');
  if (!local) return json({ error: 'unauthorized' }, 401);
  const salon = await getSalonBySlug(context.env.DB, local.slug);
  if (!salon) return json({ error: 'unauthorized' }, 401);
  return json({ slug: salon.slug, name: salon.name });
}
