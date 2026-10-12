import { llmReply } from './ai.js';
import { getSalonBySlug } from './salon.js';

export async function getOrCreateConversation(db, salonId, waFrom) {
  let row = await db
    .prepare(`SELECT * FROM conversations WHERE salon_id = ? AND wa_from = ?`)
    .bind(salonId, waFrom)
    .first();
  if (!row) {
    await db
      .prepare(`INSERT INTO conversations (salon_id, wa_from, state_json) VALUES (?, ?, ?)`)
      .bind(salonId, waFrom, '{}')
      .run();
    row = await db
      .prepare(`SELECT * FROM conversations WHERE salon_id = ? AND wa_from = ?`)
      .bind(salonId, waFrom)
      .first();
  }
  return row;
}

export async function appendMessage(db, conversationId, role, body) {
  await db
    .prepare(`INSERT INTO messages (conversation_id, role, body) VALUES (?, ?, ?)`)
    .bind(conversationId, role, body)
    .run();
  await db
    .prepare(`UPDATE conversations SET updated_at = datetime('now') WHERE id = ?`)
    .bind(conversationId)
    .run();
}

export async function recentMessages(db, conversationId, limit = 12) {
  const { results } = await db
    .prepare(
      `SELECT role, body FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?`
    )
    .bind(conversationId, limit)
    .all();
  return (results || []).reverse();
}

function parseSlotToIso(slotText, durationMin = 60) {
  const label = String(slotText || '');
  const m = label.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
  if (m) {
    const starts = new Date(`${m[1]}T${m[2]}:00`);
    const ends = new Date(starts.getTime() + (Number(durationMin) || 60) * 60 * 1000);
    return { starts_at: `${starts.toISOString()}|${label}`, ends_at: ends.toISOString() };
  }
  const now = new Date();
  const ends = new Date(now.getTime() + 60 * 60 * 1000);
  return { starts_at: `${now.toISOString()}|${label}`, ends_at: ends.toISOString() };
}

export async function handleUserMessage(env, { slug = 'fisio-demo', waFrom, text, interactiveId = null }) {
  const salon = await getSalonBySlug(env.DB, slug);
  if (!salon) throw new Error('salon not found');

  const conv = await getOrCreateConversation(env.DB, salon.id, waFrom);
  const state = JSON.parse(conv.state_json || '{}');
  const logText = interactiveId ? `[${interactiveId}] ${text || ''}`.trim() : text;
  await appendMessage(env.DB, conv.id, 'user', logText || interactiveId || '');

  if (salon.bot_paused) {
    const reply =
      salon.paused_message ||
      'Ahora mismo no podemos atender por WhatsApp. Llamanos o inténtalo más tarde.';
    await appendMessage(env.DB, conv.id, 'assistant', reply);
    return { reply, state, salon, conversationId: conv.id, interactive: null };
  }

  const history = await recentMessages(env.DB, conv.id);
  const result = await llmReply(env, salon, history, text || '', state, interactiveId);

  if (result.book) {
    const slot = result.state?.last_slot || result.state?.slot;
    const serviceId = result.state?.last_service_id || result.state?.service_id;
    const clientName = result.state?.last_client_name || result.state?.client_name;
    const svc = salon.services.find((s) => s.id === serviceId);
    if (slot) {
      const { starts_at, ends_at } = parseSlotToIso(slot, svc?.duration_min);
      await env.DB.prepare(
        `INSERT INTO appointments (salon_id, client_phone, client_name, service_id, starts_at, ends_at, status)
         VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`
      )
        .bind(salon.id, waFrom, clientName || null, serviceId || null, starts_at, ends_at)
        .run();
    }
  }

  await env.DB.prepare(`UPDATE conversations SET state_json = ? WHERE id = ?`)
    .bind(JSON.stringify(result.state || {}), conv.id)
    .run();
  await appendMessage(env.DB, conv.id, 'assistant', result.reply);

  return {
    reply: result.reply,
    state: result.state,
    salon,
    conversationId: conv.id,
    interactive: result.interactive || null
  };
}
