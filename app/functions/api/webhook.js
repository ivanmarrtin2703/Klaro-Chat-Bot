import { handleUserMessage } from '../../cloudflare/conversation.js';
import { parseIncoming, sendWhatsAppInteractive, sendWhatsAppText } from '../../cloudflare/whatsapp.js';

function text(body, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain' } });
}

/** Verificación Meta (GET) */
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const verify = context.env.VERIFY_TOKEN || 'citaclara-verify';
  if (mode === 'subscribe' && token === verify) {
    return text(challenge || '', 200);
  }
  return text('forbidden', 403);
}

/** Mensajes entrantes (POST) */
export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return text('bad json', 400);
  }

  const incoming = parseIncoming(body);
  if (!incoming || (!incoming.text && !incoming.interactiveId)) {
    return text('ok', 200);
  }

  const slug = env.DEFAULT_SALON_SLUG || 'fisio-demo';
  try {
    const { reply, interactive } = await handleUserMessage(env, {
      slug,
      waFrom: incoming.from,
      text: incoming.text,
      interactiveId: incoming.interactiveId
    });
    if (interactive) {
      const sent = await sendWhatsAppInteractive(env, incoming.from, interactive);
      if (!sent.ok && sent.skipped) {
        await sendWhatsAppText(env, incoming.from, reply);
      } else if (!sent.ok) {
        await sendWhatsAppText(env, incoming.from, reply);
      }
    } else {
      await sendWhatsAppText(env, incoming.from, reply);
    }
  } catch (err) {
    console.error('webhook error', err);
  }
  return text('ok', 200);
}
