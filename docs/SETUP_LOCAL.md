# Setup local

## Landing

```powershell
cd "C:\Users\FA506\OneDrive\Desktop\Proyectos propios\IA WhatsApp\landing"
npm install
npm run db:migrate:local
npm run dev
```

Edita `landing/public/config.js` → `whatsappNumber`.

## App (bot)

```powershell
cd "C:\Users\FA506\OneDrive\Desktop\Proyectos propios\IA WhatsApp\app"
npm install
npm run db:migrate:local
npm run dev
```

Si el puerto 8788 está ocupado:

```powershell
npx wrangler pages dev public --persist-to=.wrangler/state --port 8790
```

- Demo (chat por opciones): `/demo/`  
- Admin agency: `/admin/` (PIN `1234` en `.dev.vars`)  
- Panel local: `/hoy/` (ej. slug `fisio-demo`, PIN `4321`)  

Plan / estado: [`PLAN_PRODUCCION.md`](PLAN_PRODUCCION.md), [`memory/ESTADO.md`](../memory/ESTADO.md).  

