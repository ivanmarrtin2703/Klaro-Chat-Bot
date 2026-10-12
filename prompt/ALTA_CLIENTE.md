# Alta cliente — local (peluquería / fisio / otro)

Cuando el usuario diga «tengo un nuevo cliente» / «alta local» / «alta salón»:

## 1) Preguntar (un solo mensaje)

1. **Tipo:** `fisio` | `peluqueria` | `otro`  
2. Nombre comercial del local  
3. Barrio / ciudad  
4. Teléfono WhatsApp del negocio (o si usamos número bot dedicado)  
5. Teléfono del dueño (`owner_phone`, avisos agency)  
6. Carta de servicios: nombre, precio €, duración min  
7. Profesionales (nombres + qué hacen + días)  
8. Horario semanal (+ pausa comida)  
9. Política de cancelación (default: gratis si >12h)  
10. Tono (cercano / formal)  
11. PIN panel Hoy del local (o generar uno)  
12. PIN agency interno (si aplica)

Deriva `slug` (minúsculas-guiones) y confírmalo.

### RGPD / fisio

- No pedir DNI ni datos de salud.  
- Si tipo = `fisio`: el bot solo habla de **precios, horarios y citas** (sin síntomas ni historial clínico).

## 2) Ejecutar (tras confirmación)

1. Crear `gestion/clientes/{Nombre}/` con notas + copia de cerebro JSON (`business_type`, servicios, staff, hours, `local_pin`, cobro 129).  
2. Insertar local en D1 vía admin (`POST /api/admin/salons`) o seed en `app/`.  
3. Probar flujos en `/demo/?` o WhatsApp test con el `slug`.  
4. Entregar: enlace/QR al WhatsApp del bot + enlace `/hoy/?slug=...` + PIN local.  
5. Marcar checklist en `CHECKLIST_PRODUCCION.md`.

Nunca entregar `gestion/`, tokens Meta ni el PIN agency al local.
