# Klaro — Chat Bot

Recepcionista con IA por WhatsApp para negocios con cita. Producto propio en desarrollo: responde precios y horarios, agenda citas y recuerda al cliente, sin que el local pierda mensajes fuera de horario.

**Landing:** [klaroapp.pages.dev](https://klaroapp.pages.dev) · **Demo:** [klaroapp.pages.dev/demo](https://klaroapp.pages.dev/demo/) · **Repo:** [Klaro-Chat-Bot](https://github.com/ivanmarrtin2703/Klaro-Chat-Bot)

## Qué hay en el repo

| Pieza | Carpeta | Rol |
|-------|---------|-----|
| Captación | [`landing/`](landing/) | Landing B2B Klaro (leads por email + demo) |
| Bot | [`app/`](app/) | WhatsApp + IA + citas + admin agency + panel Hoy |
| Agency | [`gestion/`](gestion/) | Material por cliente (privado; no entregar al local) |
| Prompts | [`prompt/`](prompt/) | Alta, arquitectura, ventas, checklist |
| Memoria | [`memory/`](memory/) | Decisiones y estado del producto |

Stack: Cloudflare Pages, Functions, D1, JavaScript, WhatsApp Cloud API. Modelo agency managed (configuro yo cada local; no self-serve en v1).

## Arranque rápido

```powershell
# Landing
cd landing
npm install
npm run dev

# Bot
cd ..\app
npm install
npm run db:migrate:local
npm run dev
# Demo · /admin/ · /hoy/
```

## Documentación

- [`AGENTS.md`](AGENTS.md) — reglas para trabajar en el repo  
- [`docs/PLAN_PRODUCCION.md`](docs/PLAN_PRODUCCION.md) — mapa de fases  
- [`docs/DEPLOY_LANDING.md`](docs/DEPLOY_LANDING.md) — deploy y avisos de contacto  
- [`prompt/ALTA_CLIENTE.md`](prompt/ALTA_CLIENTE.md) — alta de un nuevo local  
