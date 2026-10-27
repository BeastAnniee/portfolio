---
type: method
---
# Método TC (Spec + PIV con gates de riesgo)

Híbrido de **Spec-Driven Development** (constitución + spec + plan) y del **ciclo PIV** (Plan → Implement → Validate con contexto limpio entre fases), con una capa para software industrial: **clases de riesgo** que fijan el rigor, **tipos de proyecto** (industrial, quick, venture) que dosifican la ceremonia y un **gate único** (`tc-verify`) que también comprueba la coherencia de las propias specs.

```
        ┌──────────── humano aprueba ───────────┐
Prime → Spec ──► Plan ──► Implement ──► Validate ──► Review ──► Ship ──► Retro
 /tc-prime /tc-spec /tc-plan /tc-implement /tc-validate /tc-review /tc-ship /tc-retro
                       ▲                     │            │
                       └──── falla / hallazgos ◄──────────┘
```

Transversales: `/tc` (consultor: clasifica y enruta) · `/tc-debug` (causa raíz) · `/tc-adr` (decisiones) · `tc-standards` (estándares por disciplina) · `/tc-evolve` (promover el tipo o subir de etapa).

## Clases de riesgo (por cambio)

| Clase | Qué es | Ruta | Aprobaciones |
|---|---|---|---|
| **R0** Trivial | Docs, comentarios, renombres sin cambio de comportamiento, config no productiva | Cambio directo + `tc-verify --fast` → `/tc-ship` | Revisión normal del PR |
| **R1** Estándar | Feature o bug acotado, reversible, sin tocar contratos ni datos críticos | Spec-lite → plan → implement → validate → ship | Humano aprueba spec-lite y plan · 1 revisor en PR |
| **R2** Sensible | Contrato/API pública, migraciones, auth/permisos, integridad de datos, reportes contractuales, despliegue/CI, rendimiento | Spec completa → plan → implement → validate → **review (subagente)** → ship | Spec y plan aprobados · 1 revisor humano · integración verde |
| **R3** Crítico | Control de proceso/PLC, consignas y actuadores, escritura a equipos o producción, seguridad, SLA con penalización, datos irreversibles | Spec completa **con modos de falla y estado seguro** → plan con simulación, puesta en marcha y rollback → … | 2 revisores humanos (uno del proceso) · gates manuales · **nunca autónomo** |

**Ante la duda, sube una clase.** Si durante `Implement` descubres que el cambio es de clase superior: **para**, actualiza `risk:` en `spec.md` y vuelve a la fase que corresponda.

## Tipo de proyecto — la primera decisión

El riesgo dice cuánto rigor lleva *un cambio*; el **tipo** dice qué clase de proyecto es y, con él, qué ruta sigue `/tc`, qué se genera y cuánto cuesta el contexto. Se fija al crear el proyecto (`.tc/config.json: track`). Solo se **promueve** (`quick → venture → industrial`, con `/tc-evolve`); relajar el rigor está prohibido.

| Tipo | Es… | Ruta de `/tc` | Rigor |
|---|---|---|---|
| **industrial** | Trabajo: producción desde el día 1, robusto y sin errores | A · ruta fija, sin atajos ni escalera | spec aprobada desde R1, **review independiente desde R1**, gate estricto, `security`+`ops` desde el inicio, lista «listo para producción» |
| **quick** | Script, tarea, algo esporádico | B · directo: implementar, **ejecutar y enseñar la salida** | sin specs/docs/CI; solo vigila secretos; 2 skills |
| **venture** | Idea propia, portafolio → startup | C · según la etapa | crece con la etapa (tabla siguiente) |

### Etapas (solo `venture`)
| Etapa | Para qué | Packs | Rigor |
|---|---|---|---|
| **portfolio** | Algo presentable, sin dependientes | — | R1 = intención + test + verify; CI |
| **app** | Usuarios reales o equipo pequeño | `vault` | ciclo completo; `specLint` avisa |
| **product** | Varios componentes, clientes con expectativas | + `security` `ops` | `specLint` bloquea; el gate no pasa en falso |
| **startup** | Busca mercado y debe escalar | + `product` `graph` | + descubrimiento, hoja de ruta, release y operación |

**Packs**: `vault` (docs/ como vault de Obsidian + tableros) · `graph` (grafo de código local para ahorrar tokens) · `security` (modelo de amenazas) · `ops` (SLOs, runbooks, release) · `product` (descubrimiento y roadmap) · `design` (diseño de interfaz: `/tc-design` con `docs/design/DESIGN.md`, `design.md` antes de implementar UI y `design-review.md` antes de `/tc-review`; `node scripts/tc-design.mjs check|lint|context|provenance`). `evolve --check` (desde el toolkit) lista lo que falta: en industrial, para producción; en venture, para la siguiente etapa.

## Fases, artefactos y puertas

| Fase | Skill | Artefacto | Puerta para pasar a la siguiente |
|---|---|---|---|
| Prime | `/tc-prime` | brief en chat (no escribe) | — |
| Spec | `/tc-spec` | `docs/specs/NNN-slug/spec.md` | **Humano** aprueba → `status: approved` + `approved_by`; sin `[NEEDS CLARIFICATION]` |
| Plan | `/tc-plan` | `plan.md` (tareas, tests, validación, rollback) | **Humano** aprueba → `status: planned` + `approved_by` en el plan |
| Implement | `/tc-implement` | código + tests + checkboxes de `plan.md` | `tc-verify` completo en verde → `status: implementing` |
| Validate | `/tc-validate` | `validation.md` (`verdict:` en frontmatter) | `verdict: PASS` → `status: validated` |
| Review | `/tc-review` | `review.md` (`verdict:`; hallazgos BLOCKER/MAJOR/MINOR/NIT) | `verdict: APPROVE` (R2/R3) |
| Ship | `/tc-ship` | commits + PR con evidencia | **Humano** hace merge → `status: in-review` → `done` |
| Retro | `/tc-retro` | `docs/lessons.md` + propuestas de proceso | — |

`status` (frontmatter de `spec.md`): `draft → approved → planned → implementing → validated → in-review → done` (+ `blocked`). `node scripts/tc-status.mjs` los resume; `node scripts/tc-spec-lint.mjs` comprueba que cada estado cumple sus puertas (aprobación, trazabilidad `REQ → AC → T`, veredictos) y el gate lo ejecuta.

## Reglas de higiene

1. **Una fase por sesión; `/clear` entre fases.** El artefacto es el traspaso: por eso el plan debe ser autosuficiente.
2. **Evidencia antes que afirmaciones.** «Funciona» = comando + salida vista en esta sesión (`.tc/last-verify.json`).
3. **El gate no se negocia.** Si falla, se arregla la causa; no se desactiva el test ni se usa `--no-verify`.
4. **El humano posee los extremos** (qué construir y si se acepta); el agente posee el centro (cómo construirlo).
5. **Lo determinista se impone con código, no con instrucciones.** Si una regla importa, debe haber un hook o un check que la haga cumplir.
   Agentes: Claude usa hooks (`.claude/hooks`), OpenCode el plugin `.opencode/plugins/tc-guard.js` (mismas reglas; lo «confirmar» se bloquea) y Gemini solo `pre-commit` + CI.
6. **Los errores del proceso también se corrigen** (`/tc-retro`): cada defecto escapado se convierte en un test, un gate o una regla; las fricciones del propio toolkit se etiquetan `#toolkit` en `docs/lessons.md`.
7. **Contexto barato**: orientarse con `tc-status`, `tc-spec-lint --trace` y (si hay grafo) `tc-graph brief/impact` antes de leer archivos enteros; `node scripts/tc-status.mjs --budget` vigila el contexto permanente.


## Sin rastro de IA y traspaso
Commits, ramas y PR van sin `Co-Authored-By` ni firmas de IA (lo imponen `settings.json`, `guard-bash` y el hook `commit-msg`). La maquinaria de TC no se versiona (`.git/info/exclude`); `docs/` sí. Al cerrar o cambiar de máquina: `/tc-handoff` → `docs/HANDOFF.md`.
