# Deploy landing — Klaro (proyecto Pages `klaroapp`)

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

1. Proyecto Pages: `klaroapp` (URL: `https://klaroapp.pages.dev`).  
   `klaro.pages.dev` está ocupado por un producto ajeno.
2. D1 de leads: `recebot-landing-db` (binding en `wrangler.toml`).
3. `npm run db:migrate:remote`
4. `npm run deploy`

### Dominio propio (cuando lo compres)

1. Cloudflare Dashboard → Pages → `klaroapp` → Custom domains → Add.
2. Añade el dominio (ej. `klaro.es`) y sigue DNS (CNAME a `klaroapp.pages.dev` o nameservers CF).
3. Actualiza enlaces en `docs/GO_LIVE_AHORA.md` y `memory/ESTADO.md`.
