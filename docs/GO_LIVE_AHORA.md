# Go-live ahora — WhatsApp / Meta

Marca pública: **Klaro** (repo interno CitaClara; URL Pages `klaroapp.pages.dev`)

> Nota: `klaro.pages.dev` ya está ocupado por otro producto ajeno. Usamos **klaroapp.pages.dev**.

| Pieza | URL |
|-------|-----|
| Landing | **https://klaroapp.pages.dev** |
| Demo de prueba | **https://klaroapp.pages.dev/demo/** |
| App / bot | **https://citaclara-app.pages.dev** |
| Webhook | **https://citaclara-app.pages.dev/api/webhook** |

Verify token: `citaclara-verify`  
Piloto: `DEFAULT_SALON_SLUG=fisio-demo`

## Hecho por el agente

- [x] Auth Cloudflare OK (`wrangler whoami`)
- [x] D1 remota app `citaclara-db` + migraciones `0001`/`0002`
- [x] Proyecto Pages `citaclara-app` → https://citaclara-app.pages.dev
- [x] Secrets Pages app: `VERIFY_TOKEN`, `ADMIN_PIN`, `SESSION_SECRET`, `DEFAULT_SALON_SLUG`
- [x] Landing **Klaro**: proyecto Pages `klaroapp` → https://klaroapp.pages.dev
- [x] Demo en landing: https://klaroapp.pages.dev/demo/ (API en citaclara-app + CORS)
- [x] Probado app: `/demo/`, `/api/salon?slug=fisio-demo`, webhook GET verify → challenge OK
- [x] Landing: **sin** número inventado (`whatsappNumber` sigue placeholder `34600000000`)
- [ ] Secrets Meta (`WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`) — **no estaban** en Pages (comprobado)

## Pendiente (solo tú — UI Meta)

Máximo 5 pasos:

1. [ ] **Meta for Developers** → App Business → producto **WhatsApp** → API Setup. Anota **Phone number ID** y genera **token permanente** (System User).
2. [ ] Pega secrets en Cloudflare Pages (`citaclara-app` → Settings → Environment variables / Secrets) **production**:
   - `WHATSAPP_TOKEN` = token permanente
   - `PHONE_NUMBER_ID` = Phone number ID  
   O por CLI (desde `app/`):
   ```powershell
   npx wrangler pages secret put WHATSAPP_TOKEN --project-name=citaclara-app
   npx wrangler pages secret put PHONE_NUMBER_ID --project-name=citaclara-app
   ```
3. [ ] **WhatsApp → Configuration → Webhook**:
   - Callback URL: `https://citaclara-app.pages.dev/api/webhook`
   - Verify token: `citaclara-verify`
   - Suscribir campo **`messages`**
4. [ ] Envía un WhatsApp al número del bot → debe responder (precios / cita). Si falla: logs Pages + token + Phone Number ID.
5. [ ] Cuando tengas el número real: sustituye `whatsappNumber` en `landing/public/config.js` y redeploy landing (`npm run deploy` en `landing/`). **No uses el placeholder `34600000000` en producción.**

## Dominio propio (cuando lo compres)

1. Cloudflare Dashboard → Pages → `klaroapp` → **Custom domains** → Add.
2. Añade el dominio (ej. `klaro.es`) y configura DNS (CNAME a `klaroapp.pages.dev` o nameservers Cloudflare).
3. Actualiza esta doc y `memory/ESTADO.md` con la URL final.

## Local (ya listo)

```powershell
cd app
npm run db:migrate:local
npm run dev
```
