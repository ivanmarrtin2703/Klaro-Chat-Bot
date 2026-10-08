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

function parseSlotToIso(slotText) {
  // Demo: store raw slot as starts_at text; ends_at +1h placeholder
  const now = new Date();
  const starts = now.toISOString();
  const ends = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  return { starts_at: `${starts}|${slotText || ''}`, ends_at: ends };
}

export async function handleUserMessage(env, { slug = 'atelier-luna', waFrom, text }) {
  const salon = await getSalonBySlug(env.DB, slug);
  if (!salon) throw new Error('salon not found');

  const conv = await getOrCreateConversation(env.DB, salon.id, waFrom);
  const state = JSON.parse(conv.state_json || '{}');
  await appendMessage(env.DB, conv.id, 'user', text);
  const history = await recentMessages(env.DB, conv.id);
  const result = await llmReply(env, salon, history, text, state);

  if (result.book && result.state?.slot) {
    const { starts_at, ends_at } = parseSlotToIso(result.state.slot);
    await env.DB.prepare(
      `INSERT INTO appointments (salon_id, client_phone, client_name, service_id, starts_at, ends_at, status)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`
    )
      .bind(
        salon.id,
        waFrom,
        result.state.client_name || null,
        result.state.service_id || null,
        starts_at,
        ends_at
      )
      .run();
  }

  await env.DB.prepare(`UPDATE conversations SET state_json = ? WHERE id = ?`)
    .bind(JSON.stringify(result.state || {}), conv.id)
    .run();
  await appendMessage(env.DB, conv.id, 'assistant', result.reply);

  return { reply: result.reply, state: result.state, salon, conversationId: conv.id };
}
