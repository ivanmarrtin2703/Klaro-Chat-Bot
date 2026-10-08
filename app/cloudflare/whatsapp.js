export async function sendWhatsAppText(env, to, body) {
  const token = env.WHATSAPP_TOKEN;
  const phoneId = env.PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    return { ok: false, skipped: true, reason: 'missing WHATSAPP_TOKEN or PHONE_NUMBER_ID' };
  }
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: String(to).replace(/\D/g, ''),
      type: 'text',
      text: { body: String(body).slice(0, 4000) }
    })
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function parseIncoming(body) {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const msg = value?.messages?.[0];
  if (!msg) return null;
  return {
    from: msg.from,
    id: msg.id,
    timestamp: msg.timestamp,
    text: msg.text?.body || msg.button?.text || msg.interactive?.button_reply?.title || '',
    phoneNumberId: value?.metadata?.phone_number_id
  };
}
