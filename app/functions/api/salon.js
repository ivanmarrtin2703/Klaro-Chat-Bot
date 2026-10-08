import { getSalonBySlug, ensureDemoSalon } from '../../cloudflare/salon.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const slug = url.searchParams.get('slug') || context.env.DEFAULT_SALON_SLUG || 'atelier-luna';
  if (!context.env.DB) return json({ error: 'DB no configurada' }, 500);
  await ensureDemoSalon(context.env.DB);
  const salon = await getSalonBySlug(context.env.DB, slug);
  if (!salon) return json({ error: 'not found' }, 404);
  return json({ salon });
}
