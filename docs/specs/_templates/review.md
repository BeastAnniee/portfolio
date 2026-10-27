---
type: review
spec: "[[specs/NNN-slug/spec]]"
verdict:
range:
---
<!-- verdict: APPROVE | CHANGES-REQUESTED (cualquier BLOCKER o MAJOR abierto ⇒ CHANGES-REQUESTED). Solo en el frontmatter: lo lee el gate. range: <base>...HEAD -->
# Review · NNN-slug

## Resumen
<!-- 3 líneas: qué hace el cambio y tu impresión de riesgo. -->

## Hallazgos
<!-- Ordenados por severidad. BLOCKER = rompe requisito/seguridad/datos. MAJOR = bug probable o hueco de test importante. MINOR = mantenibilidad. NIT = estilo. -->
| # | Sev | Ubicación | Problema y escenario de fallo | Corrección sugerida | Estado |
|---|---|---|---|---|---|
| 1 | | `archivo:línea` | | | abierto |

## Cobertura de la revisión
- [ ] Conformidad con spec (cada requisito implementado y probado)
- [ ] Manejo de errores y modos de falla · Concurrencia/temporización
- [ ] Seguridad · Integridad de datos/migraciones · Compatibilidad de contratos
- [ ] Calidad de los tests (¿fallarían si el código estuviera mal?)
- [ ] Radio de impacto (grafo: `node scripts/tc-graph.mjs impact <símbolo>`) *(si hay grafo)*
- [ ] Checklist R3 (estado seguro, límites, watchdog, comunicación perdida, enclavamientos) *(si aplica)*
