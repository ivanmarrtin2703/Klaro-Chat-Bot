import { brainText, formatHours, formatServices, isOpenNow } from './salon.js';
import { openDays, serviceListRows, slotsForDay } from './slots.js';

function matchService(salon, text) {
  const t = text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  const services = salon.services || [];

  const dur = t.match(/\b(\d{2,3})\s*(?:min|mins|minutos)?\b/);
  if (dur) {
    const mins = Number(dur[1]);
    const byDur = services.find((s) => Number(s.duration_min) === mins);
    if (byDur) return byDur;
  }

  const byName = services.find((s) => {
    const name = String(s.name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '');
    if (!name) return false;
    if (t.includes(name) || name.includes(t.trim())) return true;
    const tokens = name.split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    return tokens.some((w) => t.includes(w)) && !/^\d+$/.test(t.trim());
  });
  if (byName) return byName;

  if (/primera|valoraci[oó]n|evaluaci[oó]n/.test(t)) {
    return services.find((s) => /primera|valoraci/i.test(s.name));
  }
  return null;
}

function mainMenu(body) {
  return {
    type: 'list',
    body: body || '¿Qué necesitas?',
    button: 'Ver opciones',
    sections: [
      {
        title: 'Menú',
        rows: [
          { id: 'menu_prices', title: 'Ver precios', description: 'Servicios y tarifas' },
          { id: 'menu_book', title: 'Pedir cita', description: 'Reservar un hueco' },
          { id: 'menu_hours', title: 'Horario', description: 'Cuándo abrimos' },
          { id: 'menu_human', title: 'Hablar con humano', description: 'Te pasamos con el equipo' }
        ]
      }
    ]
  };
}

function serviceListInteractive(salon, body) {
  return {
    type: 'list',
    body: body || 'Elige un servicio:',
    button: 'Servicios',
    sections: [{ title: 'Servicios', rows: serviceListRows(salon.services) }]
  };
}

function dayListInteractive(salon, durationMin) {
  const days = openDays(salon.hours, 7, new Date(), durationMin || 30);
  if (!days.length) {
    return {
      type: 'list',
      body: 'No hay días con huecos ahora mismo.',
      button: 'Menú',
      sections: [
        {
          title: 'Menú',
          rows: [{ id: 'menu_book', title: 'Reintentar cita', description: 'Volver a intentar' }]
        }
      ]
    };
  }
  return {
    type: 'list',
    body: 'Elige un día:',
    button: 'Días',
    sections: [
      {
        title: 'Próximos días',
        rows: days.map((d) => ({ id: d.id, title: d.label.slice(0, 24), description: d.date }))
      }
    ]
  };
}

function timeListInteractive(salon, dateYmd, durationMin) {
  const slots = slotsForDay(salon.hours, dateYmd, durationMin);
  if (!slots.length) return null;
  return {
    type: 'list',
    body: `Huecos el ${dateYmd}:`,
    button: 'Horas',
    sections: [
      {
        title: 'Horas',
        rows: slots.map((s) => ({ id: s.id, title: s.label, description: 'Disponible' }))
      }
    ]
  };
}

function confirmButtons() {
  return {
    type: 'buttons',
    body: '¿Confirmamos la cita?',
    buttons: [
      { id: 'confirm_yes', title: 'Sí' },
      { id: 'confirm_no', title: 'No' },
      { id: 'confirm_change', title: 'Cambiar hora' }
    ]
  };
}

function withMenu(reply, state = {}) {
  return { reply, state, interactive: mainMenu(reply) };
}

function findService(salon, serviceId) {
  if (serviceId == null || serviceId === '') return null;
  const sid = Number(serviceId);
  return (salon.services || []).find((s) => Number(s.id) === sid) || null;
}

function resolveService(salon, state, interactiveId, text) {
  if (interactiveId?.startsWith('svc_')) {
    return findService(salon, interactiveId.slice(4));
  }
  if (state.service_id != null && state.service_id !== '') {
    return findService(salon, state.service_id);
  }
  return matchService(salon, text);
}

/**
 * Motor por opciones. interactiveId tiene prioridad (botón/lista WA o demo).
 */
export function ruleReply(salon, userText, state = {}, interactiveId = null) {
  const t = (userText || '').toLowerCase().trim();
  const id = interactiveId || '';
  const open = isOpenNow(salon.hours);
  let next = { ...state };

  // --- IDs de menú / confirmación ---
  if (id === 'menu_human' || /humano|persona|encargad|dueñ|hablar con/.test(t)) {
    return {
      reply: `Te paso con el equipo. Te escriben en cuanto puedan${salon.handoff_phone ? ` (${salon.handoff_phone})` : ''}.`,
      state: { ...next, handoff: true, intent: null }
    };
  }

  if (id === 'menu_hours' || (/horario|abr[ií]|cerrad/.test(t) && !id.startsWith('svc_'))) {
    const reply = `Nuestro horario:\n${formatHours(salon.hours)}`;
    return { reply, state: next, interactive: mainMenu('¿Algo más?') };
  }

  if (
    id === 'menu_prices' ||
    ((/precio|cu[aá]nto|cuesta|lista|servicios|carta|ver precios/.test(t) || t === 'precios') &&
      !next.awaiting_name &&
      !next.awaiting_day &&
      !next.awaiting_slot &&
      !next.pending_confirm)
  ) {
    const list = formatServices(salon.services);
    const reply = list
      ? `Nuestros precios:\n\n${list}\n\nToca un servicio para reservar, o vuelve al menú.`
      : 'Ahora mismo no hay servicios en la carta.';
    const rows = serviceListRows(salon.services);
    return {
      reply,
      state: {
        ...next,
        intent: null,
        awaiting_name: false,
        awaiting_day: false,
        awaiting_slot: false,
        pending_confirm: false
      },
      interactive: rows.length
        ? {
            type: 'list',
            body: 'Elige un servicio o vuelve al menú:',
            button: 'Servicios',
            sections: [
              {
                title: 'Servicios',
                rows: [
                  ...rows,
                  { id: 'menu_book', title: 'Pedir cita', description: 'Reservar con guía' },
                  { id: 'menu_hours', title: 'Ver horario', description: 'Cuándo abrimos' }
                ].slice(0, 10)
              }
            ]
          }
        : mainMenu(reply)
    };
  }

  if (id === 'menu_book' || (id === '' && (/cita|reserv|hueco|agenda/.test(t) || t === 'quiero cita'))) {
    const reply = '¿Qué servicio quieres?';
    return {
      reply,
      state: { ...next, intent: 'book', awaiting_name: false, day: null, slot: null, pending_confirm: false },
      interactive: serviceListInteractive(salon, reply)
    };
  }

  // Servicio elegido
  if (id.startsWith('svc_') || (!next.service_id && matchService(salon, t) && (/^\s*\d{2,3}/.test(t) || /sesi[oó]n|primera/.test(t)))) {
    const svc = resolveService(salon, next, id, t);
    if (svc) {
      const reply = `${svc.name}: ${Number(svc.price_eur).toFixed(0)} € (~${svc.duration_min} min). ¿Cómo te llamas? (escribe tu nombre)`;
      return {
        reply,
        state: {
          ...next,
          intent: 'book',
          service_id: svc.id,
          awaiting_name: true,
          awaiting_day: false,
          awaiting_slot: false,
          day: null,
          slot: null,
          pending_confirm: false
        }
      };
    }
  }

  // Nombre (texto libre)
  if (next.awaiting_name || (next.intent === 'book' && next.service_id && !next.client_name && !id.startsWith('day_') && !id.startsWith('slot_'))) {
    const nameMatch = t.match(/(?:me llamo|soy)\s+(.+)/i);
    let clientName = nameMatch ? nameMatch[1].trim() : null;
    if (!clientName && t && !id && t.length >= 2 && t.length <= 40 && !/precio|horario|cita|menu|menú/.test(t)) {
      clientName = (userText || '').trim();
    }
    if (!clientName) {
      return {
        reply: '¿Cómo te llamas? Escribe solo tu nombre.',
        state: { ...next, intent: 'book', awaiting_name: true }
      };
    }
    const svc = findService(salon, next.service_id);
    const reply = `Gracias, ${clientName}. Elige un día:`;
    return {
      reply,
      state: {
        ...next,
        intent: 'book',
        client_name: clientName,
        awaiting_name: false,
        awaiting_day: true,
        awaiting_slot: false
      },
      interactive: dayListInteractive(salon, svc?.duration_min)
    };
  }

  // Día
  if (id.startsWith('day_') || next.awaiting_day) {
    let dateYmd = id.startsWith('day_') ? id.slice(4) : null;
    const svc = findService(salon, next.service_id);
    if (!dateYmd) {
      const days = openDays(salon.hours, 7, new Date(), svc?.duration_min || 30);
      const hit = days.find((d) => t.includes(d.label.toLowerCase()) || t.includes(d.date));
      dateYmd = hit?.date || null;
    }
    if (!dateYmd) {
      return {
        reply: 'Elige un día de la lista:',
        state: { ...next, awaiting_day: true },
        interactive: dayListInteractive(salon, svc?.duration_min)
      };
    }
    const interactive = timeListInteractive(salon, dateYmd, svc?.duration_min || 30);
    if (!interactive) {
      return {
        reply: 'Ese día no hay huecos. Elige otro:',
        state: { ...next, day: null, awaiting_day: true, awaiting_slot: false },
        interactive: dayListInteractive(salon, svc?.duration_min)
      };
    }
    return {
      reply: `Día ${dateYmd}. Elige una hora:`,
      state: {
        ...next,
        day: dateYmd,
        slot: null,
        pending_confirm: false,
        awaiting_day: false,
        awaiting_slot: true
      },
      interactive
    };
  }

  // Hora
  if (id.startsWith('slot_') || next.awaiting_slot) {
    let time = null;
    let dateYmd = next.day;
    if (id.startsWith('slot_')) {
      // slot_YYYY-MM-DD_HH:MM
      const rest = id.slice(5);
      const m = rest.match(/^(\d{4}-\d{2}-\d{2})_(\d{2}:\d{2})$/);
      if (m) {
        dateYmd = m[1];
        time = m[2];
      }
    }
    if (!time) {
      const hm = t.match(/\b([0-2]?\d[:.][0-5]\d)\b/);
      time = hm ? hm[1].replace('.', ':') : null;
    }
    if (!time || !dateYmd) {
      const svc = findService(salon, next.service_id);
      const interactive = timeListInteractive(salon, dateYmd || next.day, svc?.duration_min || 30);
      return {
        reply: 'Elige una hora de la lista:',
        state: { ...next, awaiting_slot: true },
        interactive: interactive || dayListInteractive(salon, svc?.duration_min)
      };
    }
    const svc = findService(salon, next.service_id);
    const slotLabel = `${dateYmd} ${time}`;
    const reply = `Anoto: ${svc ? svc.name : 'servicio'} — ${slotLabel}${next.client_name ? ` (${next.client_name})` : ''}.`;
    return {
      reply,
      state: {
        ...next,
        day: dateYmd,
        slot: slotLabel,
        pending_confirm: true,
        awaiting_slot: false,
        awaiting_day: false
      },
      interactive: { ...confirmButtons(), body: `${reply}\n¿Confirmamos?` }
    };
  }

  // Confirmar
  if (next.pending_confirm || id.startsWith('confirm_')) {
    if (id === 'confirm_yes' || /^(s[ií]|ok|vale|confirmo)/i.test(t)) {
      return {
        reply: `Cita confirmada: ${next.slot}${next.client_name ? ` — ${next.client_name}` : ''}. ¡Te esperamos en ${salon.name}!`,
        state: {
          intent: null,
          service_id: null,
          client_name: null,
          day: null,
          slot: null,
          pending_confirm: false,
          booked: true,
          last_slot: next.slot,
          last_service_id: next.service_id,
          last_client_name: next.client_name
        },
        book: true,
        interactive: mainMenu('¿Necesitas algo más?')
      };
    }
    if (id === 'confirm_change') {
      const svc = findService(salon, next.service_id);
      const interactive = timeListInteractive(salon, next.day, svc?.duration_min || 30);
      return {
        reply: 'Elige otra hora:',
        state: { ...next, slot: null, pending_confirm: false, awaiting_slot: true },
        interactive: interactive || dayListInteractive(salon, svc?.duration_min)
      };
    }
    if (id === 'confirm_no' || /^no/.test(t)) {
      return withMenu('De acuerdo, no la confirmo. ¿Qué necesitas?', {
        intent: null,
        service_id: null,
        client_name: null,
        day: null,
        slot: null,
        pending_confirm: false,
        awaiting_name: false,
        awaiting_day: false,
        awaiting_slot: false
      });
    }
    return {
      reply: `¿Confirmamos ${next.slot}?`,
      state: next,
      interactive: confirmButtons()
    };
  }

  // Saludo / menú explícito (no tragarse textos con sentido solo por no llevar interactiveId)
  if ((!t && !id) || /^(hola|buenas|hey|menu|menú|inicio)\b/i.test(t)) {
    const closed = open ? '' : '\n(Fuera de horario, pero puedes dejar la cita.)';
    const reply = `${salon.greeting || 'Hola'}${closed}\nElige una opción:`;
    return withMenu(reply, { intent: null });
  }

  // Cancelación
  if (/cancel|anul/.test(t)) {
    return withMenu(
      `Puedes cancelar gratis si avisas con más de ${salon.cancel_policy_hours}h. Escribe «humano» si quieres que lo gestionemos.`,
      next
    );
  }

  return withMenu('Elige una opción del menú:', next);
}

export async function llmReply(env, salon, history, userText, state, interactiveId = null) {
  // Flujo por opciones: siempre reglas (menú / listas / botones)
  if (
    interactiveId ||
    state?.intent === 'book' ||
    state?.pending_confirm ||
    state?.awaiting_name ||
    state?.day ||
    !userText ||
    /hola|buenas|menu|menú|cita|precio|horario|humano/i.test(userText)
  ) {
    return ruleReply(salon, userText, state, interactiveId);
  }

  const key = env.OPENAI_API_KEY;
  if (!key) return ruleReply(salon, userText, state, interactiveId);

  const ruled = ruleReply(salon, userText, state, interactiveId);
  // Si las reglas ya armaron menú/interactive, úsalas
  if (ruled.interactive || ruled.book) return ruled;

  const system = `Eres la recepcionista WhatsApp de un negocio local. Responde en español, mensajes cortos (máx 3 frases).
NO inventes precios ni servicios fuera de esta base:
${brainText(salon)}
Si no sabes algo, dilo y ofrece pasar con un humano (handoff).
Para citas, indica que use el menú de opciones.
Estado actual JSON: ${JSON.stringify(state || {})}`;

  const messages = [
    { role: 'system', content: system },
    ...history.slice(-8).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.body })),
    { role: 'user', content: userText }
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      max_tokens: 220,
      temperature: 0.4
    })
  });
  if (!res.ok) return ruleReply(salon, userText, state, interactiveId);
  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content?.trim();
  if (!reply) return ruleReply(salon, userText, state, interactiveId);
  return { reply, state, interactive: mainMenu('¿Qué necesitas?') };
}
