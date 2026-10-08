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
  const phone = String(body.phone || '').trim();
  const neighborhood = String(body.neighborhood || '').trim();
  const note = String(body.note || '').trim();

  if (!salon_name || !phone) {
    return json({ error: 'Faltan salon_name o phone' }, 400);
  }

  if (!env.DB) {
    return json({ ok: true, stored: false });
  }

  try {
    await env.DB.prepare(
      `INSERT INTO leads (salon_name, neighborhood, phone, note) VALUES (?, ?, ?, ?)`
    )
      .bind(salon_name, neighborhood || null, phone, note || null)
      .run();
    return json({ ok: true, stored: true });
  } catch (err) {
    return json({ error: 'No se pudo guardar', detail: String(err) }, 500);
  }
}
