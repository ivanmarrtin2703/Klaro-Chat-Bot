import { checkPin, createSession, sessionCookie } from '../../../cloudflare/auth.js';

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
}

export async function onRequestPost(context) {
  const body = await context.request.json().catch(() => ({}));
  if (!checkPin(context.env, body.pin)) {
    return json({ error: 'PIN incorrecto' }, 401);
  }
  const token = await createSession(context.env);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token) });
}
