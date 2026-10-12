# Conectar WhatsApp Cloud API (Meta)

## Requisitos

1. Cuenta Meta Business / Meta for Developers  
2. App tipo Business con producto **WhatsApp**  
3. Número de teléfono **dedicado** (no puede estar en la app WhatsApp personal)  
4. Deploy de `app/` en Cloudflare Pages con HTTPS  
5. Migraciones D1 aplicadas (`0001_init` + `0002_agency_fields`)

## Secrets en Cloudflare Pages (`citaclara-app`)

| Secret | Descripción |
|--------|-------------|
| `VERIFY_TOKEN` | Token que inventas (ej. `citaclara-verify`) |
| `WHATSAPP_TOKEN` | Token permanente (System User) |
| `PHONE_NUMBER_ID` | ID del número en WhatsApp Manager |
| `ADMIN_PIN` | PIN panel agency `/admin/` |
| `SESSION_SECRET` | Secreto cookie |
| `OPENAI_API_KEY` | Opcional (si no, reglas) |
| `DEFAULT_SALON_SLUG` | Piloto: `fisio-demo` (o slug del local real) |
| `CRON_SECRET` | Para `/api/remind` |

## Webhook

1. URL: `https://TU_DOMINIO_PAGES/api/webhook`  
2. Verify token = mismo `VERIFY_TOKEN`  
3. Suscribir campo `messages`  
4. Meta hace GET → debe devolver `hub.challenge`  

## Prueba sin Meta

1. `cd app && npx wrangler pages dev --d1=DB` (o script del README)  
2. Abrir `/demo/` → slug `fisio-demo`  
3. Pedir precios / cita  
4. Ver cita en `/admin/` y `/hoy/` (PIN `4321`)

## Prueba con Meta

1. Envía un WhatsApp al número del bot.  
2. Debe responder con precios/horarios/citas (cerebro del local).  
3. Desde `/admin/`: pausar bot → debe devolver `paused_message`.  
4. Si no responde: logs Pages + token + Phone Number ID.  

## Templates (después del chat básico)

Crear en WhatsApp Manager (categoría **utility**):

- Confirmación de cita  
- Recordatorio 24h  

No uses templates **marketing** en v1.

## Checklist

Ver [`prompt/CHECKLIST_PRODUCCION.md`](../prompt/CHECKLIST_PRODUCCION.md).
