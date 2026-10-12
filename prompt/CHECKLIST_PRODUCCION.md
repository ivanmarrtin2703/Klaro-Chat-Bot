# Checklist producción / go-live piloto

## Landing (Recebot)
- [ ] Deploy Pages OK
- [ ] CTA `wa.me` con número real (`landing/public/config.js`)
- [ ] Formulario lead guarda (D1/KV o email)
- [ ] Móvil OK

## Bot
- [ ] `npm run dev` + migraciones D1 (`0001` + `0002`)
- [ ] Demo chat `fisio-demo` responde precios/horarios/cita
- [ ] Admin agency: lista locales, cobro, pausa
- [ ] Panel `/hoy/` con PIN local
- [ ] Deploy Pages + D1 remoto
- [ ] Secrets: `VERIFY_TOKEN`, `WHATSAPP_TOKEN`, `PHONE_NUMBER_ID`, `ADMIN_PIN`, `SESSION_SECRET`, `OPENAI_API_KEY` (o Gemini), `DEFAULT_SALON_SLUG=fisio-demo`

## Meta
- [ ] App Meta + WhatsApp producto
- [ ] Número verificado (no usado en WA app personal)
- [ ] Webhook URL + verify challenge OK
- [ ] Mensaje test recibido y respondido
- [ ] Templates: confirmación cita, recordatorio 24h (aprobados)
- [ ] Probar pausa bot desde admin

## Piloto
- [ ] Carta precios cargada (cerebro)
- [ ] Staff + horarios
- [ ] Contrato / cobro setup
- [ ] Dueño sabe handoff + panel Hoy
- [ ] Revisar conversaciones 48h
- [ ] Fisio: bot sin pedir datos de salud

## Difusión
- [ ] Repo GitHub
- [ ] Card en Mi Página Web
