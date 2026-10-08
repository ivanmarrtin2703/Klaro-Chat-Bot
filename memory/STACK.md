# Stack

## Landing (`landing/`)
- Cloudflare Pages (estático + Function mínima para leads)
- HTML/CSS/JS vanilla
- Config: `public/config.js` (wa.me, email opcional)

## Bot (`app/`)
- Cloudflare Pages + Functions
- D1: salons, services, staff, appointments, conversations, messages
- WhatsApp Cloud API (webhook)
- IA: `OPENAI_API_KEY` o `GEMINI_API_KEY` (opcional; fallback reglas)
- Secrets: `.dev.vars` local / Pages secrets remoto

## No usar en v1
Next.js, React, Stripe, Twilio (salvo que Meta Cloud API directa falle).
