# Arquitectura — recepcionista WA multi-local

## Modelo

Un deploy `app/` multi-local (agency). Cada negocio = fila en D1 + cerebro (servicios/staff/horarios + tipo + cobro/pausa).  
Landing separada en `landing/` (marca **Recebot**) para captación B2B.

## Flujo mensajes

```
Cliente WA → Meta Cloud API → webhook Functions
  → cargar local + historial
  → si bot_paused → mensaje fijo
  → IA (anclada al cerebro) o reglas
  → agenda D1
  → respuesta WA (+ handoff si aplica)
```

## Cerebro por local (JSON / tablas)

- identidad (nombre, tipo, tono, saludo)
- servicios (precio, duración)
- profesionales
- horarios + excepciones
- políticas cancelación
- handoff + owner_phone
- agency: monthly_fee, billing_status, bot_paused, local_pin

## Paneles

- `/admin/` — agency (PIN `ADMIN_PIN`): locales, cobros, pausa, notas, cerebro
- `/hoy/` — local (PIN `local_pin`): citas del día, marcar atendido
- `/demo/` — chat de prueba (slug por defecto `fisio-demo`)

## Reglas duras

- La IA **no inventa precios**: solo datos del cerebro.  
- Fisio: no pedir datos de salud.  
- Si duda 2 veces → handoff.  
- Ventana 24h Meta: texto libre; fuera → solo templates.  
- Recordatorios = template **utility**.  
- No marketing templates en v1.
