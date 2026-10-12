const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = {
  sun: 'Domingo',
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado'
};

function parseRange(slot) {
  const [a, b] = String(slot).split('-');
  if (!a || !b) return null;
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  return { start: ah * 60 + am, end: bh * 60 + bm };
}

function minsToHhmm(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Huecos de un día YYYY-MM-DD con paso = durationMin */
export function slotsForDay(hours, dateYmd, durationMin = 30) {
  const [y, m, d] = dateYmd.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const key = DAY_KEYS[date.getDay()];
  const ranges = hours?.[key] || [];
  const step = Math.max(15, Number(durationMin) || 30);
  const slots = [];
  const now = new Date();
  const isToday = ymd(now) === dateYmd;
  const nowMins = now.getHours() * 60 + now.getMinutes();

  for (const range of ranges) {
    const parsed = parseRange(range);
    if (!parsed) continue;
    for (let t = parsed.start; t + step <= parsed.end; t += step) {
      if (isToday && t <= nowMins) continue;
      const hhmm = minsToHhmm(t);
      slots.push({
        id: `slot_${dateYmd}_${hhmm}`,
        time: hhmm,
        label: hhmm,
        title: hhmm
      });
    }
  }
  return slots.slice(0, 10);
}

/** Próximos n días con al menos un hueco libre */
export function openDays(hours, n = 7, from = new Date(), durationMin = 30) {
  const out = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < 28 && out.length < n; i++) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() + i);
    const key = DAY_KEYS[d.getDay()];
    const ranges = hours?.[key] || [];
    if (!ranges.length) continue;
    const date = ymd(d);
    if (!slotsForDay(hours, date, durationMin).length) continue;
    out.push({
      id: `day_${date}`,
      date,
      key,
      label: `${DAY_LABELS[key]} ${d.getDate()}/${d.getMonth() + 1}`
    });
  }
  return out;
}

export function serviceListRows(services) {
  return (services || []).slice(0, 10).map((s) => ({
    id: `svc_${s.id}`,
    title: String(s.name).slice(0, 24),
    description: `${Number(s.price_eur).toFixed(0)} € · ${s.duration_min} min`.slice(0, 72)
  }));
}
