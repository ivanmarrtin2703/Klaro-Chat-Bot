import { getSalonBySlug, ensureDemoSalon } from '../../cloudflare/salon.js';
import { corsPreflight, withCors } from '../../cloudflare/cors.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestOptions(context) {
  return corsPreflight(context.request);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') || env.DEFAULT_SALON_SLUG || 'fisio-demo';
  if (!env.DB) return withCors(request, json({ error: 'DB no configurada' }, 500));
  await ensureDemoSalon(env.DB);
  const salon = await getSalonBySlug(env.DB, slug);
  if (!salon) return withCors(request, json({ error: 'not found' }, 404));
  return withCors(request, json({ salon }));
}
