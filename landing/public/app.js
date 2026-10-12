(function () {
  const cfg = window.KLARO || window.RECEBOT || window.MOSTRADOR || window.CITACLARA || {};
  const number = String(cfg.whatsappNumber || '').replace(/\D/g, '');
  const prefill = cfg.whatsappPrefill || 'Hola, quiero info de Klaro.';

  function waUrl(extra) {
    const text = extra ? `${prefill}\n\n${extra}` : prefill;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  const setupEl = document.getElementById('priceSetup');
  const monthlyEl = document.getElementById('priceMonthly');
  if (setupEl && cfg.setupPrice) setupEl.textContent = cfg.setupPrice;
  if (monthlyEl && cfg.monthlyPrice) monthlyEl.textContent = cfg.monthlyPrice;

  document.querySelectorAll('.logo, .brand-mark').forEach((el) => {
    if (cfg.brand) el.textContent = cfg.brand;
  });

  // CTAs superiores: WhatsApp si hay número real; si no, ancla al formulario
  const placeholder = !number || number === '34600000000';
  ['ctaHero', 'ctaTop'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (placeholder) {
      el.setAttribute('href', '#contacto');
      if (id === 'ctaHero') el.textContent = 'Pedir información';
      if (id === 'ctaTop') el.textContent = 'Contacto';
    } else {
      el.setAttribute('href', waUrl());
    }
  });

  const lines = [
    { who: 'them', text: 'Hola, ¿cuánto cuesta la consulta?' },
    { who: 'us', text: 'Consulta desde 45 € (aprox. 45 min). ¿Te reservo?' },
    { who: 'them', text: 'Sí, el viernes por la tarde' },
    { who: 'us', text: 'Viernes 17:30. ¿Lo confirmo?' }
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

    const btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || 'fail');
      status.textContent = 'Solicitud recibida. Te escribimos por email en menos de 24 h.';
      form.reset();
    } catch {
      status.textContent =
        'No se pudo enviar ahora. Escríbenos a ' + (cfg.contactEmail || 'hola@klaroapp.pages.dev');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
})();
