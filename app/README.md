# CitaClara — app (bot)

Bot WhatsApp + IA + agenda D1 para peluquerías.

## Local

```powershell
cd "C:\Users\FA506\OneDrive\Desktop\Proyectos propios\IA WhatsApp\app"
npm install
npm run db:migrate:local
npm run dev
```

- Demo: `http://127.0.0.1:8788/demo/`
- Admin: `http://127.0.0.1:8788/admin/` (PIN `1234` por defecto)
- Webhook Meta: `https://TU_DOMINIO/api/webhook`

Copia `.env.example` → `.dev.vars` y rellena tokens cuando conectes Meta.

## Flujos demo (sin Meta)

Escribe en el chat: `precios`, `horario`, `quiero cita`, `balayage`, `me llamo Ana`, `viernes 17:30`, `sí`.
