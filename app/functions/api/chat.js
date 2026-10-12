import { handleUserMessage } from '../../cloudflare/conversation.js';
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

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return withCors(request, json({ error: 'JSON inválido' }, 400));
  }
  const text = String(body.text || '').trim();
  const interactiveId = body.interactiveId ? String(body.interactiveId) : null;
  const slug = String(body.slug || env.DEFAULT_SALON_SLUG || 'fisio-demo');
  const waFrom = String(body.from || 'demo-user').replace(/\s/g, '');
  if (!text && !interactiveId) {
    return withCors(request, json({ error: 'text o interactiveId requerido' }, 400));
  }
  if (!env.DB) return withCors(request, json({ error: 'DB no configurada' }, 500));

  try {
    const result = await handleUserMessage(env, {
      slug,
      waFrom,
      text,
      interactiveId
    });
    return withCors(
      request,
      json({
        reply: result.reply,
        state: result.state,
        interactive: result.interactive || null
      })
    );
  } catch (err) {
    return withCors(request, json({ error: String(err.message || err) }, 500));
  }
}
