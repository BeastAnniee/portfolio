---
type: plan
spec: "[[specs/NNN-slug/spec]]"
approved_by:
approved_at:
---
<!-- plan.md — debe ser AUTOSUFICIENTE: un agente sin contexto previo tiene que poder ejecutarlo. Las tareas usan el formato `- [ ] **T1** — título` y una línea `Cubre: REQ-1, AC-1` (lo leen tc-status y el lint). `approved_by` lo rellena el humano que aprueba el plan. -->
# Plan · NNN-slug

**Riesgo:** R? · **Rama:** `feat/NNN-slug`

## 1. Enfoque
<!-- Qué se va a hacer y por qué así. R2/R3: ≥2 alternativas consideradas y por qué se descartan. Si hay decisión arquitectónica → /tc-adr. Si existe grafo de código: impacto previsto con `node scripts/tc-graph.mjs impact <símbolo>`. -->

## 2. Contexto técnico que el implementador necesita
<!-- Archivos y patrones existentes a seguir/reutilizar (con rutas), convenciones, comandos para correr/probar, trampas conocidas. -->

## 3. Tareas
<!-- Atómicas (≈1 commit), en orden, cada una con: archivos, test primero, verificación y requisitos/criterios que cubre. -->
- [ ] **T1** — <título>
  - Archivos: `ruta/a.ts`, `ruta/a.test.ts`
  - Test primero: <qué test falla antes de implementar>
  - Cambio: <descripción concreta>
  - Verificación: `<comando>` → <resultado esperado>
  - Cubre: REQ-1, AC-1
- [ ] **T2** — …

## 4. Estrategia de validación
| Nivel | Qué | Comando / evidencia |
|---|---|---|
| L1 Estático | lint + typecheck | `node scripts/tc-verify.mjs --fast` |
| L2 Unitario | lógica y reglas | |
| L3 Integración / contrato | | |
| L4 E2E / simulación / FAT | *(R3 obligatorio)* | |
| L5 Manual / operativo | | |

## 5. Trazabilidad
<!-- Se genera y se comprueba con `node scripts/tc-spec-lint.mjs --trace NNN`. Aquí solo anota excepciones justificadas. -->

## 6. Despliegue y vuelta atrás
<!-- Flag, migración reversible (expand/contract), versión anterior, backup de proyecto PLC/configuración, ventana de cambio, quién ejecuta en planta (R3), criterio de rollback. -->

## 7. Riesgos del plan
<!-- Las 3 formas más probables de que este plan falle y su mitigación. -->
1.

## 8. Definición de terminado
- [ ] Todas las tareas marcadas y `node scripts/tc-verify.mjs` en verde (evidencia en `.tc/last-verify.json`)
- [ ] Cada criterio de aceptación tiene evidencia en `validation.md`
- [ ] Sin TODO/debug residuales; docs y ADR actualizados
- [ ] Gates manuales resueltos (si aplica)

## 9. Divergencias durante la implementación
<!-- El implementador anota aquí todo desvío respecto al plan (qué, por qué, quién lo aprobó). -->
