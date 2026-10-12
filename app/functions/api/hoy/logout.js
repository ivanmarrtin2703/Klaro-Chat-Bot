import { clearLocalCookie } from '../../../cloudflare/auth.js';

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  });
}

export async function onRequestPost(context) {
  return json({ ok: true }, 200, { 'Set-Cookie': clearLocalCookie() });
}
