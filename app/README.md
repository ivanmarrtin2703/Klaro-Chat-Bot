# App bot (Recebot / CitaClara)

Bot WhatsApp + IA + agenda D1 multi-local (peluquería, fisio, otro).

## Local

```powershell
cd "C:\Users\FA506\OneDrive\Desktop\Proyectos propios\IA WhatsApp\app"
npm install
npm run db:migrate:local
npm run dev
```

- Demo: `http://127.0.0.1:8788/demo/` (default `fisio-demo`)
- Admin agency: `http://127.0.0.1:8788/admin/` (PIN `1234`)
- Panel Hoy: `http://127.0.0.1:8788/hoy/` (slug `fisio-demo`, PIN `4321`)
- Webhook Meta: `https://TU_DOMINIO/api/webhook`

Copia `.env.example` → `.dev.vars` y rellena tokens cuando conectes Meta.  
Piloto: `DEFAULT_SALON_SLUG=fisio-demo`.

## Flujos demo (sin Meta)

Escribe: `precios`, `horario`, `quiero cita`, `sesión 45`, `me llamo Ana`, `viernes 17:30`, `sí`.
