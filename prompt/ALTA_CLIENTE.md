# Alta cliente — peluquería

Cuando el usuario diga «tengo un nuevo cliente» / «alta salón»:

## 1) Preguntar (un solo mensaje)

1. Nombre comercial del salón  
2. Barrio / ciudad (Almería)  
3. Teléfono WhatsApp del salón (o si usamos número bot dedicado)  
4. Carta de servicios (lista o foto): nombre, precio, duración min  
5. Profesionales (nombres + qué hacen + días)  
6. Horario semanal (+ pausa comida)  
7. Política de cancelación (default: gratis si >12h)  
8. Tono (cercano / formal)  
9. PIN agency interno (si aplica)

Deriva `slug` (minúsculas-guiones) y confírmalo.

## 2) Ejecutar (tras confirmación)

1. Crear `gestion/clientes/{Nombre}/` con notas + copia de cerebro JSON.  
2. Insertar/actualizar salón en D1 (`app/`).  
3. Probar flujos en `/demo/` o WhatsApp test.  
4. Entregar: enlace/QR al WhatsApp del bot + PIN handoff.  
5. Marcar checklist en `CHECKLIST_PRODUCCION.md`.

Nunca entregar `gestion/` ni tokens Meta al salón.
