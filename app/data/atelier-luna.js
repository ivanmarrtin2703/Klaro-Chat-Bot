export const demoBrain = {
  slug: 'atelier-luna',
  name: 'Atelier Luna',
  neighborhood: 'Zapillo, Almería',
  timezone: 'Europe/Madrid',
  tone: 'cercano',
  greeting: 'Hola, soy la recepcionista de Atelier Luna. ¿En qué te ayudo?',
  handoff_phone: '',
  cancel_policy_hours: 12,
  hours: {
    mon: ['10:00-14:00', '17:00-20:00'],
    tue: ['10:00-14:00', '17:00-20:00'],
    wed: ['10:00-14:00', '17:00-20:00'],
    thu: ['10:00-14:00', '17:00-20:00'],
    fri: ['10:00-14:00', '17:00-20:30'],
    sat: ['10:00-14:00'],
    sun: []
  },
  services: [
    { name: 'Corte señora', price_eur: 22, duration_min: 45, category: 'corte' },
    { name: 'Corte caballero', price_eur: 15, duration_min: 30, category: 'corte' },
    { name: 'Tinte', price_eur: 45, duration_min: 90, category: 'color' },
    { name: 'Balayage', price_eur: 75, duration_min: 120, category: 'color' },
    { name: 'Mechas', price_eur: 55, duration_min: 100, category: 'color' },
    { name: 'Peinado', price_eur: 25, duration_min: 40, category: 'styling' },
    { name: 'Manicura', price_eur: 18, duration_min: 40, category: 'estetica' }
  ],
  staff: [
    { name: 'María', services: ['color', 'corte', 'styling'], days: ['tue', 'wed', 'thu', 'fri', 'sat'] },
    { name: 'Laura', services: ['corte', 'styling', 'estetica'], days: ['mon', 'tue', 'wed', 'thu', 'fri'] }
  ]
};
