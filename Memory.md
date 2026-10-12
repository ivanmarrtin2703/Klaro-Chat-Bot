# Memory — Recebot / CitaClara

Última actualización: 2026-10-12

## Cómo planeamos

Plan → apruebas → Agent implementa. Detalle: [`docs/PLAN_PRODUCCION.md`](docs/PLAN_PRODUCCION.md).  
Cliente final = **WhatsApp** (opciones). Web = demo + admin + panel Hoy.

## Hecho

- [x] Estructura AI + skills
- [x] Landing Recebot (B2B peluquerías)
- [x] App multi-local (cerebro, admin cobros/pausa, panel Hoy)
- [x] Bot por opciones (demo + código Cloud API)
- [x] Piloto demo `fisio-demo`
- [x] Docs Meta / checklist / plan producción
- [x] GitHub + card portfolio

## Decisiones clave

- Marca pública: **Recebot** (repo CitaClara; antes Mostrador)
- Pack: 549 € + 129 €/mes, agency managed
- Motor multi-tipo; nicho ventas = peluquerías Almería
- Siguiente: go-live Meta (tokens) + número WA real en landing

## Pendiente usuario

- Número WhatsApp + tokens Meta
- `wa.me` real en landing (`config.js`)

## Ops

```powershell
cd app
npm run db:migrate:local
npm run dev
# Si 8788 ocupado: --port 8790
```

- Admin PIN `1234` · Hoy `fisio-demo` PIN `4321`
- Estado fino: [`memory/ESTADO.md`](memory/ESTADO.md)
