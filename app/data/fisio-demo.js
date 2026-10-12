/** Cerebro demo — clínica de fisioterapia (piloto silencioso). Sin datos de salud en el bot. */
export const fisioDemoBrain = {
  slug: 'fisio-demo',
  name: 'Fisio Costa',
  business_type: 'fisio',
  neighborhood: 'Centro, Almería',
  timezone: 'Europe/Madrid',
  tone: 'cercano y profesional',
  greeting:
    'Hola, soy la recepcionista de Fisio Costa. Puedo ayudarte con precios, horarios y citas. ¿En qué te ayudo?',
  handoff_phone: '',
  owner_phone: '',
  cancel_policy_hours: 12,
  monthly_fee: 129,
  billing_status: 'ok',
  local_pin: '4321',
  paused_message: 'Ahora mismo no podemos atender por WhatsApp. Llamanos o inténtalo más tarde.',
  hours: {
    mon: ['09:00-14:00', '16:00-20:00'],
    tue: ['09:00-14:00', '16:00-20:00'],
    wed: ['09:00-14:00', '16:00-20:00'],
    thu: ['09:00-14:00', '16:00-20:00'],
    fri: ['09:00-14:00', '16:00-19:00'],
    sat: ['09:00-13:00'],
    sun: []
  },
  services: [
    { name: 'Sesión 30 min', price_eur: 35, duration_min: 30, category: 'sesion' },
    { name: 'Sesión 45 min', price_eur: 45, duration_min: 45, category: 'sesion' },
    { name: 'Sesión 60 min', price_eur: 55, duration_min: 60, category: 'sesion' },
    { name: 'Primera visita', price_eur: 50, duration_min: 45, category: 'sesion' }
  ],
  staff: [
    { name: 'Ana', services: ['sesion'], days: ['mon', 'tue', 'wed', 'thu', 'fri'] },
    { name: 'Carlos', services: ['sesion'], days: ['tue', 'wed', 'thu', 'fri', 'sat'] }
  ]
};
