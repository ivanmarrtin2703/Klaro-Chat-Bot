# Estado del proyecto

| Pieza | Estado |
|-------|--------|
| Estructura AI | hecho |
| Landing Klaro | hecho — https://klaroapp.pages.dev (UI B2B mobile-first; pendiente nº WA real) |
| Bot multi-local + opciones | hecho (demo fisio/pelu, menú/listas) |
| Admin agency | hecho (locales, cobros, pausa, notas) |
| Panel Hoy | hecho (`/hoy/`, PIN local) |
| Meta docs | hecho |
| GitHub | hecho — https://github.com/ivanmarrtin2703/Klaro-Chat-Bot |
| Portfolio | hecho — «Klaro-Chat Bot» en https://ivanmartin.pages.dev (En desarrollo.) + demo `/demos/citaclara/` |
| Deploy Pages app | hecho — https://citaclara-app.pages.dev |
| Deploy Pages landing | hecho — https://klaroapp.pages.dev (proyecto `klaroapp`, D1 `recebot-landing-db`) |
| D1 remoto app | hecho — `citaclara-db` + migraciones `0001`/`0002` |
| Secrets Pages (no Meta) | hecho — `VERIFY_TOKEN`, `ADMIN_PIN`, `SESSION_SECRET`, `DEFAULT_SALON_SLUG=fisio-demo` |
| WhatsApp producción | pendiente (tokens Meta + número + webhook en UI) |

## Plan vigente

Ver [`docs/PLAN_PRODUCCION.md`](../docs/PLAN_PRODUCCION.md).  
Checklist accionable go-live: [`docs/GO_LIVE_AHORA.md`](../docs/GO_LIVE_AHORA.md).

## URLs producción

- Landing (marca Klaro): https://klaroapp.pages.dev
- **Demo de prueba (mismo dominio):** https://klaroapp.pages.dev/demo/
- App / bot: https://citaclara-app.pages.dev
- Webhook: https://citaclara-app.pages.dev/api/webhook

## Verificado remoto (2026-10-12)

- `https://citaclara-app.pages.dev/` y `/demo/` → 200
- `/api/salon?slug=fisio-demo` → 200 (cerebro sembrado)
- Webhook GET verify con `VERIFY_TOKEN=citaclara-verify` → challenge OK
- Landing `https://klaroapp.pages.dev` desplegada (marca Klaro)
- Demo embebida en landing: `https://klaroapp.pages.dev/demo/` → API `citaclara-app` (CORS)
- Secrets Meta: **ausentes** (`WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`)

## Verificado local

- Migración `0002_agency_fields` + demos `fisio-demo` / `atelier-luna`
- Flujo opciones: menú → servicio → nombre → día → hora → confirmar
- Admin multi-local + pausa bot
- Panel Hoy

## Bloqueos usuario (go-live)

- Crear app WhatsApp en Meta → copiar `PHONE_NUMBER_ID` + token permanente
- Pegar `WHATSAPP_TOKEN` y `PHONE_NUMBER_ID` en Pages secrets
- Configurar webhook Meta → `https://citaclara-app.pages.dev/api/webhook`
- Número WhatsApp real en `landing/public/config.js` (sigue placeholder)
- Templates utility (confirmación / recordatorio) — después del chat básico
- Dominio propio (opcional): Custom domains en Pages `klaro` cuando lo compres
