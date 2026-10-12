import { verifySession } from '../../../cloudflare/auth.js';
import { createSalonFromPayload, ensureDemoSalon, listSalons, patchSalon } from '../../../cloudflare/salon.js';
import { sendWhatsAppText } from '../../../cloudflare/whatsapp.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

async function requireAuth(context) {
  return verifySession(context.env, context.request.headers.get('Cookie') || '');
}

export async function onRequestGet(context) {
  if (!(await requireAuth(context))) return json({ error: 'unauthorized' }, 401);
  await ensureDemoSalon(context.env.DB);
  const salons = await listSalons(context.env.DB);
  return json({ salons });
}

export async function onRequestPost(context) {
  if (!(await requireAuth(context))) return json({ error: 'unauthorized' }, 401);
  const body = await context.request.json().catch(() => ({}));
  try {
    const salon = await createSalonFromPayload(context.env.DB, body);
    return json({ salon }, 201);
  } catch (err) {
    return json({ error: String(err.message || err) }, 400);
  }
}

export async function onRequestPatch(context) {
  if (!(await requireAuth(context))) return json({ error: 'unauthorized' }, 401);
  const body = await context.request.json().catch(() => ({}));
  const slug = body.slug || new URL(context.request.url).searchParams.get('slug');
  if (!slug) return json({ error: 'slug requerido' }, 400);

  const salon = await patchSalon(context.env.DB, slug, body);
  if (!salon) return json({ error: 'not found' }, 404);

  let notify = null;
  if (body.notify_owner && salon.owner_phone) {
    const text =
      body.notify_text ||
      salon.agency_notes ||
      `Aviso de Recebot / CitaClara para ${salon.name}.`;
    notify = await sendWhatsAppText(context.env, salon.owner_phone, text);
  }

  return json({ salon, notify });
}
