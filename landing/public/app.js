(function () {
  const cfg = window.CITACLARA || {};
  const number = String(cfg.whatsappNumber || '').replace(/\D/g, '');
  const prefill = cfg.whatsappPrefill || 'Hola, quiero info de CitaClara.';

  function waUrl(extra) {
    const text = extra ? `${prefill}\n\n${extra}` : prefill;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  const setupEl = document.getElementById('priceSetup');
  const monthlyEl = document.getElementById('priceMonthly');
  if (setupEl && cfg.setupPrice) setupEl.textContent = cfg.setupPrice;
  if (monthlyEl && cfg.monthlyPrice) monthlyEl.textContent = cfg.monthlyPrice;

  ['ctaHero', 'ctaTop'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('href', waUrl());
  });

  const lines = [
    { who: 'them', text: 'Hola, ¿cuánto cuesta un balayage?' },
    { who: 'us', text: 'Balayage desde 75 € (aprox. 2h). ¿Quieres que te reserve?' },
    { who: 'them', text: 'Sí, el viernes por la tarde' },
    { who: 'us', text: 'Tengo viernes 17:30 con María. ¿Te lo dejo?' }
  ];

  const chat = document.getElementById('mockChat');
  if (chat) {
    lines.forEach((line, i) => {
      const b = document.createElement('div');
      b.className = `bubble ${line.who}`;
      b.textContent = line.text;
      chat.appendChild(b);
      setTimeout(() => b.classList.add('show'), 400 + i * 550);
    });
  }

  const form = document.getElementById('leadForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    status.hidden = false;
    status.textContent = 'Enviando…';

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('fail');
      status.textContent = 'Recibido. Abriendo WhatsApp…';
    } catch {
      status.textContent = 'No se pudo guardar online; abriendo WhatsApp…';
    }

    const extra = [
      `Salón: ${data.salon_name || ''}`,
      data.neighborhood ? `Zona: ${data.neighborhood}` : '',
      `Tel: ${data.phone || ''}`,
      data.note ? `Nota: ${data.note}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    window.location.href = waUrl(extra);
  });
})();
