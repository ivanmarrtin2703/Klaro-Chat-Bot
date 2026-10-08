import { handleUserMessage } from '../../cloudflare/conversation.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }
  const text = String(body.text || '').trim();
  const slug = String(body.slug || env.DEFAULT_SALON_SLUG || 'atelier-luna');
  const waFrom = String(body.from || 'demo-user').replace(/\s/g, '');
  if (!text) return json({ error: 'text requerido' }, 400);
  if (!env.DB) return json({ error: 'DB no configurada' }, 500);

  try {
    const result = await handleUserMessage(env, { slug, waFrom, text });
    return json({ reply: result.reply, state: result.state });
  } catch (err) {
    return json({ error: String(err.message || err) }, 500);
  }
}
