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

/** interactive: { type:'list'|'buttons', body, button?, sections?, buttons?, header? } */
export async function sendWhatsAppInteractive(env, to, interactive) {
  const token = env.WHATSAPP_TOKEN;
  const phoneId = env.PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    return { ok: false, skipped: true, reason: 'missing WHATSAPP_TOKEN or PHONE_NUMBER_ID' };
  }
  if (!interactive?.type) return sendWhatsAppText(env, to, interactive?.body || '');

  let payload;
  if (interactive.type === 'buttons') {
    payload = {
      messaging_product: 'whatsapp',
      to: String(to).replace(/\D/g, ''),
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: String(interactive.body || 'Elige:').slice(0, 1024) },
        action: {
          buttons: (interactive.buttons || []).slice(0, 3).map((b) => ({
            type: 'reply',
            reply: { id: String(b.id).slice(0, 256), title: String(b.title).slice(0, 20) }
          }))
        }
      }
    };
  } else {
    payload = {
      messaging_product: 'whatsapp',
      to: String(to).replace(/\D/g, ''),
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: String(interactive.body || 'Elige:').slice(0, 1024) },
        action: {
          button: String(interactive.button || 'Ver opciones').slice(0, 20),
          sections: (interactive.sections || []).map((sec) => ({
            title: String(sec.title || 'Opciones').slice(0, 24),
            rows: (sec.rows || []).slice(0, 10).map((r) => ({
              id: String(r.id).slice(0, 200),
              title: String(r.title).slice(0, 24),
              description: r.description ? String(r.description).slice(0, 72) : undefined
            }))
          }))
        }
      }
    };
    if (interactive.header) {
      payload.interactive.header = { type: 'text', text: String(interactive.header).slice(0, 60) };
    }
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
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

  const listId = msg.interactive?.list_reply?.id;
  const listTitle = msg.interactive?.list_reply?.title;
  const btnId = msg.interactive?.button_reply?.id;
  const btnTitle = msg.interactive?.button_reply?.title;
  const legacyBtn = msg.button?.text;

  const interactiveId = listId || btnId || null;
  const text =
    msg.text?.body ||
    listTitle ||
    btnTitle ||
    legacyBtn ||
    interactiveId ||
    '';

  return {
    from: msg.from,
    id: msg.id,
    timestamp: msg.timestamp,
    text,
    interactiveId,
    phoneNumberId: value?.metadata?.phone_number_id
  };
}
