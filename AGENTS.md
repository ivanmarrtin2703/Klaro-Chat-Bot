# AGENTS.md — CitaClara / IA WhatsApp

Instrucciones para agentes de IA. Responder al usuario en **español**, directo y corto.

---

## Principio nº 1 — NO inventar

Este repo es el producto **CitaClara** (recepcionista WhatsApp + IA para peluquerías).

**Regla de oro:**
- No inventes flujos, pagos, Booksy, marketing masivo ni SaaS self-serve en v1.
- Solo cambia lo que el usuario pida.
- Reutiliza patrones de este repo (landing / app / prompt / gestion).
- Si dudas → pregunta o lee `memory/` y `prompt/ARQUITECTURA.md`.

---

## Organización (obligatoria)

```
IA WhatsApp/
  landing/     ← captación (Pages)
  app/         ← ÚNICO código del bot (Pages + Functions + D1)
  gestion/     ← agency: nunca entregar al salón
  prompt/      ← alta, arquitectura, ventas, checklist
  memory/      ← producto, nicho, decisiones, stack, estado
  docs/        ← setup, deploy, Meta, Calendar, portfolio
  .cursor/skills/
```

- Código deployable del bot: **solo** `app/`.
- Captación: **solo** `landing/`.
- Material por peluquería: `gestion/clientes/{nombre}/`.

---

## Stack (ya elegido — no sustituir)

- Cloudflare Pages + Functions + D1
- WhatsApp Cloud API (Meta)
- IA: OpenAI/Gemini (con fallback por reglas)
- Agenda v1: D1; Google Calendar en fase posterior
- Frontend: HTML/CSS/JS vanilla
- Auth agency: PIN + cookie (patrón portfolio / QR Bares)

No migrar a Next.js / React salvo petición explícita.

---

## Producto v1

**IN:** precios, horarios, pedir/cambiar/cancelar cita, recordatorio 24h, handoff humano, config por salón.  
**OUT:** pagos, Booksy profundo, campañas marketing WA, app nativa, self-serve.

Pack: **549 € setup + 129 €/mes**. Nicho: peluquerías 2–6 sillas en Almería.

---

## Trigger: «tengo un nuevo cliente»

Seguir [`prompt/ALTA_CLIENTE.md`](prompt/ALTA_CLIENTE.md). No picar código a ciegas.

---

## Seguridad

- No commitear `.dev.vars`, tokens Meta, ni PINs reales.
- `gestion/` es privado (agency).
- RGPD: no pedir DNI ni datos de salud; retención de chats acotada.
