# IA WhatsApp — Recebot (repo CitaClara)

Recepcionista con IA por WhatsApp para negocios con cita (nicho público: **peluquerías** Almería; motor también fisio/otro).  
Modelo **agency managed**: tú configuras cada local; no self-serve SaaS en v1.

| Pieza | Carpeta | Rol |
|-------|---------|-----|
| Captación | [`landing/`](landing/) | Landing **Recebot** (B2B) |
| Bot | [`app/`](app/) | WhatsApp + IA + citas + admin + panel Hoy |
| Agency | [`gestion/`](gestion/) | Notas y material por cliente (nunca al local) |
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

# Bot
cd ..\app
npm install
npm run db:migrate:local
npm run dev
# Demo /admin/ PIN 1234 · /hoy/ fisio-demo PIN 4321
```

## Orden de fases

Ver mapa actualizado en [`docs/PLAN_PRODUCCION.md`](docs/PLAN_PRODUCCION.md).

1. Motor + admin + demo (hecho)  
2. Chat por opciones (hecho en demo)  
3. Meta + deploy `app/` (siguiente)  
4. Landing con `wa.me` real  
5. Después: analytics / Excel / Calendar  

