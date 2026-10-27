---
type: design-review
spec: "[[specs/NNN-slug/spec]]"
verdict:
inspection: static
---
<!-- design-review.md — auditoría de diseño (/tc-design auditoría), tras /tc-validate y antes de /tc-review. verdict: APPROVE | CHANGES-REQUESTED (cualquier BLOCKER o MAJOR abierto ⇒ CHANGES-REQUESTED); solo en el frontmatter. inspection: static | browser — di la verdad: sin navegador es `static`. `node scripts/tc-design.mjs lint <id>` comprueba esta forma. -->
# Auditoría de diseño · NNN-slug

## Resumen
<!-- 3 líneas: qué pantallas se auditaron, qué se pudo comprobar y qué no (p. ej. «inspección en navegador no realizada: sin Chrome / Node < 22»). -->

## Hallazgos
<!-- BLOCKER = cambia una superficie protegida, rompe un invariante (dato viejo pintado como actual, falta estado de error, objetivo táctil bajo el mínimo en acción primaria) o se sale del alcance. MAJOR = dificulta la tarea. MINOR = pulido. Máx. 15, por impacto en la persona. Estado: abierto | corregido | descartado. -->
| # | Sev | Ubicación | Problema y escenario (qué ve/hace la persona → por qué le cuesta) | Corrección sugerida | Estado |
|---|---|---|---|---|---|
| 1 | | `archivo:línea` | | | abierto |

## Hallazgos mecánicos
<!-- Salida de `node scripts/tc-design.mjs check --out .tc/design-check.json`. Cada indicio MAJOR/MINOR se clasifica: «confirmado → hallazgo #N» o «descartado: motivo». Lo que un script detecta no se queda a criterio del revisor. Sin indicios: «ninguno (check ejecutado el <fecha>)». Sin ejecutar: «no ejecutado» y por qué. -->

## Fase posterior (no se corrige ahora)
<!-- Defectos heredados y código muerto vistos durante la auditoría. `archivo:línea` y una línea. -->

## Conflictos con el proyecto
<!-- Reglas de skills de terceros que chocan con AGENTS.md / constitución / tc-standards / DESIGN.md §7, y cómo se resolvió (gana el proyecto). -->

## Reglas consultadas (obligatorio; solo lo que realmente se leyó)
<!-- Una regla que no figure aquí no cuenta como aplicada. Columna «Leída»: sí | no | no consultada | no hubo. -->
| Fuente (ruta) | Leída | Reglas o secciones aplicadas |
|---|---|---|
| `tc-design/vendor/web-design-guidelines/command.md` | | |
| `tc-design/vendor/anti-ui-slop/SKILL.md` + `reference/audit.md`, `operate.md`, `craft.md` | | |
| `tc-design/references/principios.md` | | |
| `docs/design/DESIGN.md` | | |
| Informes de `taste-skill` *(solo si se ejecutaron con aprobación humana)* | | |

## Cobertura
- [ ] Superficies protegidas intactas (DESIGN.md §5)
- [ ] Objetivos táctiles y carga de información (contrato §4)
- [ ] Estados cargando / vacío / error / éxito y dato viejo
- [ ] Movimiento: propiedades, `prefers-reduced-motion`, sin dependencias nuevas
- [ ] Accesibilidad: nombre accesible, foco visible y no tapado, contraste, teclado
