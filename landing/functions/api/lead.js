function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const salon_name = String(body.salon_name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const neighborhood = String(body.neighborhood || '').trim();
  const note = String(body.note || '').trim();

  if (!salon_name || !email) {
    return json({ error: 'Faltan salon_name o email' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Email no válido' }, 400);
  }

  if (!env.DB) {
    return json({ ok: true, stored: false });
  }

  try {
    // phone NOT NULL en schema v1 → guardar '' si no hay teléfono
    await env.DB.prepare(
      `INSERT INTO leads (salon_name, neighborhood, phone, note, email) VALUES (?, ?, ?, ?, ?)`
    )
      .bind(salon_name, neighborhood || null, phone || '', note || null, email)
      .run();
    return json({ ok: true, stored: true });
  } catch (err) {
    // Fallback si aún no está la columna email
    try {
      await env.DB.prepare(
        `INSERT INTO leads (salon_name, neighborhood, phone, note) VALUES (?, ?, ?, ?)`
      )
        .bind(salon_name, neighborhood || null, phone || email, note ? `${note} | email:${email}` : `email:${email}`)
        .run();
      return json({ ok: true, stored: true, legacy: true });
    } catch (err2) {
      return json({ error: 'No se pudo guardar', detail: String(err2) }, 500);
    }
  }
}
