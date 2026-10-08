# IA WhatsApp — CitaClara

Recepcionista con IA por WhatsApp para **peluquerías** (Almería).  
Modelo **agency managed**: tú configuras cada salón; no self-serve SaaS en v1.

| Pieza | Carpeta | Rol |
|-------|---------|-----|
| Captación | [`landing/`](landing/) | Web para captar clientes (Fase 1) |
| Bot | [`app/`](app/) | WhatsApp Cloud API + IA + citas (Fase 2) |
| Agency | [`gestion/`](gestion/) | Notas y material por cliente (nunca al salón) |
| Prompts IA | [`prompt/`](prompt/) | Alta, arquitectura, ventas, checklist |
| Memoria | [`memory/`](memory/) + [`Memory.md`](Memory.md) | Decisiones y estado |
| Skills Cursor | [`.cursor/skills/`](.cursor/skills/) | Dominios del producto |

## Pack ancla

- Setup: **549 €**
- Mensual: **129 €**

## Cómo trabajar con Cursor

1. Lee [`AGENTS.md`](AGENTS.md) y [`Memory.md`](Memory.md).
2. Skills en `.cursor/skills/` según la tarea.
3. Nuevo cliente → protocolo en [`prompt/ALTA_CLIENTE.md`](prompt/ALTA_CLIENTE.md).
4. Plan completo → [`docs/PLAN_PRODUCCION.md`](docs/PLAN_PRODUCCION.md).

## Arranque rápido

```powershell
# Landing
cd landing
npm install
npm run dev

# Bot (cuando exista scaffold)
cd ..\app
npm install
npm run db:migrate:local
npm run dev
```

## Orden de fases

1. Landing de captación  
2. Bot desde cero + número WhatsApp real  
3. GitHub  
4. Enlace en Mi Página Web  
