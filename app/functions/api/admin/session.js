import { verifySession } from '../../../cloudflare/auth.js';

export async function onRequestGet(context) {
  const ok = await verifySession(context.env, context.request.headers.get('Cookie') || '');
  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 401,
    headers: { 'Content-Type': 'application/json' }
  });
}
