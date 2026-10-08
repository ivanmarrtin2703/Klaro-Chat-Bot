import { brainText, formatHours, formatServices, isOpenNow } from './salon.js';

function matchService(salon, text) {
  const t = text.toLowerCase();
  return salon.services.find((s) => t.includes(s.name.toLowerCase()) || t.includes(s.name.split(' ')[0].toLowerCase()));
}

/** Fallback sin API key: reglas simples en español */
export function ruleReply(salon, userText, state = {}) {
  const t = (userText || '').toLowerCase().trim();
  const open = isOpenNow(salon.hours);

  if (!t || /hola|buenas|hey/.test(t)) {
    const closed = open ? '' : '\n(Ahora estamos fuera de horario, pero te dejo la cita lista.)';
    return { reply: `${salon.greeting || 'Hola'}${closed}`, state };
  }

  if (/humano|persona|encargad|dueñ|hablar con/.test(t)) {
    return {
      reply: `Te paso con el salón. Te escriben en cuanto puedan${salon.handoff_phone ? ` (${salon.handoff_phone})` : ''}.`,
      state: { ...state, handoff: true }
    };
  }

  if (/horario|abr[ií]|cerrad|sábado|sabado|domingo/.test(t)) {
    return { reply: `Nuestro horario:\n${formatHours(salon.hours)}`, state };
  }

  if (/precio|cu[aá]nto|cuesta|lista|servicios|carta/.test(t)) {
    const svc = matchService(salon, t);
    if (svc) {
      return {
        reply: `${svc.name}: ${Number(svc.price_eur).toFixed(0)} € (aprox. ${svc.duration_min} min). ¿Quieres que te reserve?`,
        state: { ...state, service_id: svc.id }
      };
    }
    return { reply: `Estos son nuestros precios:\n${formatServices(salon.services)}\n¿Cuál te interesa?`, state };
  }

  if (/cancel|anul/.test(t)) {
    return {
      reply: `Puedes cancelar gratis si avisas con más de ${salon.cancel_policy_hours}h. Dime el día/hora de tu cita y tu nombre.`,
      state: { ...state, intent: 'cancel' }
    };
  }

  if (/cita|reserv|hueco|agenda|quiero/.test(t) || state.intent === 'book') {
    const svc = matchService(salon, t) || (state.service_id && salon.services.find((s) => s.id === state.service_id));
    if (!svc && !state.service_id) {
      return {
        reply: `¿Qué servicio quieres? Por ejemplo:\n${formatServices(salon.services.slice(0, 5))}`,
        state: { ...state, intent: 'book' }
      };
    }
    if (!state.client_name && !/me llamo|soy /.test(t)) {
      return {
        reply: `Perfecto${svc ? ` (${svc.name})` : ''}. ¿Cómo te llamas?`,
        state: { ...state, intent: 'book', service_id: svc?.id || state.service_id }
      };
    }
    const nameMatch = t.match(/(?:me llamo|soy)\s+([a-záéíóúñ ]{2,40})/i);
    const clientName = nameMatch ? nameMatch[1].trim() : state.client_name;
    if (!clientName) {
      return { reply: '¿Cómo te llamas?', state: { ...state, intent: 'book', service_id: svc?.id || state.service_id } };
    }
    if (!state.slot) {
      return {
        reply: `Gracias, ${clientName}. ¿Qué día y hora te va bien? (ej. viernes 17:30)`,
        state: { ...state, intent: 'book', service_id: svc?.id || state.service_id, client_name: clientName }
      };
    }
  }

  const dayHint = t.match(
    /(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|[0-3]?\d[\/\-][0-1]?\d)\s*(?:a\s*las\s*)?([0-2]?\d[:.][0-5]\d)?/i
  );
  if (dayHint || state.intent === 'book') {
    const svc = salon.services.find((s) => s.id === state.service_id) || matchService(salon, t);
    const when = dayHint ? dayHint[0] : null;
    if (when && (svc || state.service_id)) {
      return {
        reply: `Anoto: ${svc ? svc.name : 'servicio'} — ${when}${state.client_name ? ` a nombre de ${state.client_name}` : ''}. ¿Lo confirmo? (sí/no)`,
        state: { ...state, intent: 'book', service_id: svc?.id || state.service_id, slot: when, pending_confirm: true }
      };
    }
  }

  if (state.pending_confirm && /^(s[ií]|ok|vale|confirmo)/i.test(t)) {
    return {
      reply: `Cita confirmada: ${state.slot}${state.client_name ? ` — ${state.client_name}` : ''}. ¡Te esperamos en ${salon.name}!`,
      state: { ...state, pending_confirm: false, booked: true },
      book: true
    };
  }

  return {
    reply:
      'Puedo ayudarte con precios, horarios o reservar una cita. ¿Qué necesitas? Si prefieres, escribe «humano» y te paso con el salón.',
    state
  };
}

export async function llmReply(env, salon, history, userText, state) {
  const key = env.OPENAI_API_KEY || env.GEMINI_API_KEY;
  if (!key) return ruleReply(salon, userText, state);

  if (env.OPENAI_API_KEY) {
    const system = `Eres la recepcionista WhatsApp de una peluquería. Responde en español, mensajes cortos (máx 3 frases).
NO inventes precios ni servicios fuera de esta base:
${brainText(salon)}
Si no sabes algo, dilo y ofrece pasar con el salón (handoff).
Si el cliente quiere cita, pide servicio, nombre y día/hora.
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
    if (!res.ok) return ruleReply(salon, userText, state);
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return ruleReply(salon, userText, state);
    return { reply, state };
  }

  return ruleReply(salon, userText, state);
}
