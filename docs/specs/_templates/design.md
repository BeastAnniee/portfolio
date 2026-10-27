---
type: design
spec: "[[specs/NNN-slug/spec]]"
surface:
status: draft
---
<!-- design.md — contrato de diseño (/tc-design contrato). Se escribe ANTES de implementar la UI y la aprueba una persona (status: approved); el agente no se auto-aprueba.
Ninguna sección puede quedar vacía: si no aplica, di por qué. Tamaño: lo mínimo que decide el resultado (≈150 líneas; por pantalla, no por intención). Un contrato que nadie termina de leer no se cumple. -->
# Contrato de diseño · NNN-slug

## 0. Alcance y límites
- **Superficie(s):** <pantallas/rutas afectadas, según docs/design/DESIGN.md>
- **Superficies protegidas:** sin cambios (N = <cifra de DESIGN.md §5>). Una propuesta que añada, quite, renombre, fusione o mueva una superficie protegida es BLOCKER y no entra.
- **Fuera de alcance:** <lo que DESIGN.md §6 y la spec dejan fuera: reglas de negocio, API, validaciones, flujos de datos…>
- **Fase posterior** (defectos heredados o código muerto vistos, no se corrigen aquí): <`archivo:línea` + una línea, o «ninguno detectado»>

## 1. Dirección y jerarquía
<!-- Qué lee y hace primero la persona. UNA acción principal por pantalla; qué es secundario; orden de lectura.
Dirección: cómo aplica DESIGN.md §3 a esta pantalla (tono, tipografía, color) y qué la hace reconocible. Si la pantalla extiende un sistema existente: «sigue el sistema, sin dirección nueva». -->

## 2. Sistema a reutilizar
<!-- Rutas reales de tokens y componentes (DESIGN.md §4). Qué se crea nuevo y por qué no basta lo existente. Sin dependencias nuevas sin ADR. -->

## 3. Estados
| Estado | Qué ve la persona | Notas (texto además de color, acción de recuperación) |
|---|---|---|
| Cargando | | |
| Vacío | | |
| Error | | |
| Éxito | | |
| Dato viejo / sin conexión *(si hay datos en vivo: marca de tiempo y calidad)* | | |

## 4. Uso real
- **Entrada:** objetivos ≥ `min_target_px` de DESIGN.md (acciones primarias y campos con holgura), separación entre acciones destructivas y habituales, teclado/escáner/ratón, orden de foco.
- **Legibilidad:** contraste (texto ≥ 4,5:1; texto grande y controles ≥ 3:1), tamaño mínimo, no depender solo del color, texto largo y traducciones.
- **Carga de información:**

| Se muestra de inicio | Se difiere (a un toque / detalle) | Se elimina | Por qué lo necesita la persona |
|---|---|---|---|
| | | | |

## 5. Qué no se inventa
<!-- Métricas, controles, datos, textos o marcas que NO aparecen porque no existen en el producto. Los datos de ejemplo se marcan como ilustrativos. -->

## 6. Movimiento
<!-- Qué se anima y por qué (feedback de estado, no decoración), propiedades (solo `transform`/`opacity`), duración, `prefers-reduced-motion`, que no retrasa la acción, librería ya presente. Sin animación: «ninguna». -->

## 7. Conflictos con el proyecto
<!-- Reglas de skills de terceros que chocan con AGENTS.md, la constitución, tc-standards o DESIGN.md §7, y qué se decidió (gana el proyecto). «Ninguno» si no hay. -->

## 8. Criterio de terminado visual
<!-- Pantallas y anchos que se renderizarán (DESIGN.md §2), estados que se verán, y qué evidencia (capturas en `docs/specs/NNN-slug/`) se adjunta. «Inspección en navegador no realizada» no es evidencia: se anota como pendiente. -->
