---
name: citaclara-whatsapp
description: WhatsApp Cloud API, webhook, templates utility, ventana 24h — sin secretos en git.
---

# Skill — WhatsApp / Meta

- Webhook en `app/functions/api/webhook.js` (GET verify + POST).
- `DEFAULT_SALON_SLUG` (piloto: `fisio-demo`); si `bot_paused` → mensaje fijo.
- Secrets solo en `.dev.vars` / Pages secrets.
- Texto libre solo en ventana 24h; recordatorios = template utility.
- No usar templates marketing en v1.
- Guía: `docs/CONECTAR_META.md`.
