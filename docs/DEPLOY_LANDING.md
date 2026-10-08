# Deploy landing — CitaClara

## Local

```powershell
cd "C:\Users\FA506\OneDrive\Desktop\Proyectos propios\IA WhatsApp\landing"
npm install
npm run db:migrate:local
npm run dev
```

Abre la URL que imprime Wrangler (normalmente `http://127.0.0.1:8788`).

## Configurar WhatsApp CTA

Edita [`landing/public/config.js`](../landing/public/config.js):

```js
whatsappNumber: '346XXXXXXXX', // tu número con prefijo 34
```

## Remoto (Cloudflare Pages)

1. Crea proyecto Pages `citaclara` (o el nombre que elijas).
2. Crea D1 `citaclara-landing-db` y pega el `database_id` en `wrangler.toml`.
3. `npm run db:migrate:remote`
4. `npm run deploy`

O conecta el repo GitHub y usa build: sin bundler (`public` como output).
