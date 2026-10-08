# Arquitectura — CitaClara

## Modelo

Un deploy `app/` multi-salón (agency). Cada peluquería = fila en D1 + cerebro (servicios/staff/horarios).  
Landing separada en `landing/` para captación B2B.

## Flujo mensajes

```
Cliente WA → Meta Cloud API → webhook Functions
  → cargar salón + historial
  → IA (anclada al cerebro) o reglas
  → agenda D1
  → respuesta WA (+ handoff si aplica)
```

## Cerebro por salón (JSON / tablas)

- identidad (nombre, tono, saludo)
- servicios (precio, duración)
- profesionales
- horarios + excepciones
- políticas cancelación
- handoff (teléfono dueña)

## Reglas duras

- La IA **no inventa precios**: solo datos del cerebro.  
- Si duda 2 veces → handoff.  
- Ventana 24h Meta: texto libre; fuera → solo templates.  
- Recordatorios = template **utility**.  
- No marketing templates en v1.
