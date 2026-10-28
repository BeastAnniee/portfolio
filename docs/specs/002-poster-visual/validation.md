---
type: validation
spec: "[[specs/002-poster-visual/spec]]"
verdict: PASS-PENDIENTES
commit: 1339898 (árbol de trabajo con cambios sin commit)
date: 2026-10-28
---
<!-- verdict: PASS | FAIL | PASS-PENDIENTES (PASS con pendientes humanos). Solo en el frontmatter: lo lee el gate. -->
# Validación · 002-poster-visual

Cuarta validación, sobre el árbol tras las cuatro pasadas de fixes de `review.md` (pausa unificada de sello y cinta vía `html[data-motion-paused]`, `marquee.pause/play` renombrados, `copy-feedback.ts`, enmienda de spec §2). Reemplaza a la validación anterior (101 pruebas), cuya evidencia de AC-9/AC-11 era anterior a esos cambios (review #1).

## Gate automático
Salida de `node scripts/tc-verify.mjs --all` (ejecutada en esta validación, en el repo):
```
✔ web          lint         pass (8.1s)
✔ web          typecheck    pass (4.2s)
✔ web          test         pass (1.3s)
✔ web          build        pass (25.2s)
⚠ web          integration  not-configured
✔ *            specs        pass (2 spec(s), modo warn)
✔ *            secrets      pass

VEREDICTO: PASS · working tree con cambios sin commit
```
- `npm test`: `ℹ tests 104 / ℹ pass 104 / ℹ fail 0` (línea base del plan: 59).
- `integration` no está configurada: no es regresión.
- `npm run build`: `/[lang]` **13,4 kB** de ruta / **116 kB** First Load JS (línea base `master`: 49,6 kB / 152 kB); `/_not-found` 198 B / 106 kB; compartido 103 kB.
- Arnés L4 (`scripts/visual-check.mjs`, CDP sobre Chrome) contra `next start -p 3400` del build recién hecho en el repo: `--check=all --langs=en,es --widths=320,360,390,1024,1280` → **`142 resultados · 0 FAIL`** (140 PASS, 2 INFO). Incluye ya la aserción nueva del check `marquee`: «Tab+Enter pausa y reanuda» (lee `html[data-motion-paused]` y `animation-play-state` de `.badge-spin`). Sin `--shots`: no se regeneraron capturas.
- `js-bytes` en `/en`: 121 303 B (118,5 kB) en 7 scripts frente a la línea base 161 895 B. CLS: en 390 0,0155, en 1280 0,0704; es 390 0,0083, es 1280 0,0724 (≤ 0,1).
- Rutas con `curl` sobre `next start`: `/en` 200, `/es` 200, `/EN` 200, `/zz` 404, `/fr` 404, `/es/x` 404, `/en/` 308.
- Servidor 3400 propio detenido al terminar. Los puertos 3000 y 3100 son de procesos ajenos y no se tocaron (nota: `tc-verify` reconstruye `.next/` que ellos comparten).

## Trazabilidad
`node scripts/tc-spec-lint.mjs --trace 002`: REQ-1 a REQ-22 con al menos un AC y todas sus tareas en ✔, sin ⚠ ni ✖. `node scripts/tc-spec-lint.mjs 002` → «✔ 1 spec(s) coherentes.» (repetido tras escribir este documento).

## Criterios de aceptación
| ID | Resultado | Evidencia (comando + salida resumida / archivo) |
|---|---|---|
| AC-1 | ✔ | `grep -rli bento src README.md .claude/skills/portfolio docs/architecture.md` solo da `src/lib/design-guards.test.ts` (la guarda). `design-css.test.ts` exige los tokens de `@theme`; `npm test` 104/104. |
| AC-2 | ✔ | `design-css.test.ts` (tabla `TEXT_PAIRS`, sin accent sobre bone). Arnés `contrast` PASS en todos los alcances. Limitación (review #7 antiguo): la tabla es manual; el arnés mide el DOM real. |
| AC-3 | ✔ | Un único `--color-accent` (prueba). Estados de Contact con icono + texto: verificados en la validación anterior con `next dev` y claves ficticias (24/0 FAIL); **no repetidos en esta ejecución** (`Contact.tsx` solo cambió de forma menor desde entonces; ver «Observaciones»). |
| AC-4 | ✔ | Arnés `font-sizes` y `fonts` PASS EN/ES: sin texto < 12 px, cuerpo ≥ 16 px, tres fuentes cargadas. |
| AC-5 | ✔ (+ ☐ humano) | Arnés `hero` y `overflow` a 320, 360, 390, 1024 y 1280 EN/ES: PASS. Revisión de capturas por la persona: pendiente. |
| AC-6 | ✔ | `grep -rlE "shadow\|gradient\|transition-all\|transition: all\|ring-\|backdrop-" src` solo da `design-css.test.ts` y `design-guards.test.ts` (guardas). Arnés `inverted` PASS. |
| AC-7 | ✔ (+ ☐ otros motores) | Arnés `lab` PASS (capas a color con hover y foco, grano 0,18 permanece, duotono permanente sin `hover:hover`) y `hero`. |
| AC-8 | ✔ (+ ☐ humano) | Arnés `badge` PASS (sin `textPath`/`textLength`, glifos dentro del `viewBox`, caja ≈ 84/101 px). Safari y Firefox: pendiente. |
| AC-9 | ✔ | Arnés `badge`: con reduced-motion animación `none`; sin ello `badge-spin`. Pausa del sello: `marquee` verifica `animation-play-state: paused/running` de `.badge-spin` tras Tab+Enter. |
| AC-10 | ✔ | Sin `transition-all`/`transition: all` en `src` (salvo guardas); `design-css.test.ts` exige `@keyframes` solo con `transform`/`opacity`. Revisión de código: pertenece a `/tc-review`. |
| AC-11 | ✔ | Arnés `marquee` PASS a 5 anchos × EN/ES: grupo con nombre, botón con Tab, pausa y reanuda, copia `aria-hidden`, 36,9 px/s; sin JS animación `none`. |
| AC-12 | ✔ | Arnés `reduced-motion`: «sin animaciones de movimiento; sello y marquee detenidos» (EN y ES). |
| AC-13 | ✔ | Arnés `js-off`: «9 secciones y titulares visibles con opacity 1» (EN y ES). |
| AC-14 | ✔ | Arnés `landmarks`: `main=1 contentinfo=1 footerDentroDeMain=false` (EN y ES). |
| AC-15 | ✔ (+ ☐ humano) | Arnés `focus`, `targets` (≥ 44×44) y `overflow` PASS en `all`. Recorrido humano con teclado: pendiente. |
| AC-16 | ✔ | Arnés `forced-colors`: «marcos con borde solid, capas ocultas, módulos con borde» PASS EN/ES (asevera foco, Spotlight y controles rellenos). |
| AC-17 | ✔ | Arnés `blocked` (6 PASS): sin desborde, `.duo` conserva tamaño y `alt`; `cls` ≤ 0,1. |
| AC-18 | ✔ | `ls src/components/Particles.tsx public/404.png public/story.pdf` → «No such file» ×3; `grep -c ogl package.json package-lock.json` → 0 y 0; referencias a `404.png` solo en guardas y `project-view.ts`/pruebas. |
| AC-19 | ✔ | `grep -i bento` en `README.md`, `.claude/skills/portfolio` y `docs/architecture.md` → sin resultados; `About.tsx` no aparece en `README.md` ni en la skill. |
| AC-20 | ✔ | `git diff master -- '*.test.ts' \| grep -E '^-[^-]'` da una sola línea: el `import` de `contact.test.ts` (añade `statusAfterEdit`; sin aserciones eliminadas). `git diff master -- src/content/{en,es}.ts` solo toca `hero.badge`, `ficha` y `marquee` (6 inserciones, 2 borrados = las dos líneas de `hero.badge`). 104/104. |
| AC-21 | ✔ | `next build`: 13,4 kB / 116 kB vs 49,6 kB / 152 kB; `js-bytes` 121 303 B vs 161 895 B; CLS máx. 0,0724. |
| AC-22 | ✔ | `git diff master -- package.json`: solo se elimina `"ogl": "^1.0.11"`. |

## Modos de falla (R2/R3)
| Falla | ¿Probada? | Evidencia |
|---|---|---|
| JS no se ejecuta o la hidratación falla | Sí | Arnés `js-off`. |
| `prefers-reduced-motion: reduce` | Sí | Arnés `reduced-motion`, `badge`, `marquee`. |
| Texto ES más largo desborda hero o sello | Sí | Arnés `overflow`, `hero`, `badge` EN/ES de 320 a 1280. |
| El navegador ignora `textLength` | Sí | El sello no usa `textLength` ni `textPath` (arnés `badge`). |
| Fuente web no carga | Sí | Arnés `blocked` y `cls`. Limitación: respaldo en Android/Linux no medido en dispositivo. |
| Imagen no carga | Sí | Arnés `blocked`. |
| Modo de alto contraste (`forced-colors`) | Sí | Arnés `forced-colors`. |
| Contraste insuficiente en un par nuevo | Sí | `design-css.test.ts` + arnés `contrast`. |
| Accent sobre bone | Parcial | La prueba prohíbe el par en la tabla manual; no escanea el uso real (limitación conocida). |
| Marquee imposible de pausar | Sí | Arnés `marquee` (Tab + Enter, pausa y reanuda) y `noscript` (animación `none`). |
| Se pierde o altera contenido | Sí | Pruebas de contenido de la 001 intactas; diff de tests sin aserciones eliminadas. |

## Verificaciones de alcance
- [x] Archivos modificados ⊆ archivos del plan, más las divergencias D1–D7 y fixes anotados en `plan.md` §9 (fuera del plan original: `next.config.ts`, `global-not-found.tsx` —D4, aprobado—, `statusAfterEdit` en `lib/contact.ts`, `lib/copy-feedback.ts`).
- [x] Sin dependencias nuevas (solo sale `ogl`) · sin secretos (gate) · sin TODO/FIXME/`debugger` en `src/`; los `console.log` hallados están solo en `scripts/tc-design.mjs` (CLI de la herramienta, no producto).
- [x] Docs al día: README, `docs/architecture.md`, skill `portfolio`, DESIGN.md sin sistema bento ni `About.tsx`; spec §2 enmendada con `hero.badge` y `marquee.pause/play`.
- Observación: todo el trabajo sigue sin commit (HEAD `1339898`); se commitea en `/tc-ship`. `scripts/` (arnés) está sin versionar (review #7): decidir en `/tc-ship`.

## Pendientes humanos
- ☐ Revisión humana de las capturas de `docs/specs/002-poster-visual/screens/` (AC-5).
- ☐ Safari y Firefox: sello (AC-8) y mezcla de capas del duotono (AC-7). Sugerencia: preview del PR.
- ☐ Recorrido con teclado y lector de pantalla (AC-15).
- ☐ Confirmar `ficha.ach` («ACH.» / «LOGRO»).
- ☐ Respaldo de la fuente display en Android/Linux, medido en dispositivo real (review #5).
- ☐ Confirmación de la persona de las aceptaciones escritas en `plan.md` §9 (review #8 / design-review #2, #3, #4, #13).
- Decidido el 2026-10-28 por la persona (plan §9): CTA del hero a 360×640 aceptado tal cual.
- Gates manuales de `.tc/config.json`: ninguno (`manualGates: []`).

## Observaciones para la revisión
- `review.md` conserva `verdict: CHANGES-REQUESTED`: sus pasadas posteriores anotan fixes en `plan.md` §9, pero el documento no se ha vuelto a emitir. Su hallazgo MAJOR #1 (evidencia de la pausa) queda cubierto por esta validación; el veredicto de la review le corresponde a `/tc-review 002`.
- Esta validación no repitió el check `contact` (requiere `next dev` con variables ficticias); su última evidencia es la de la validación anterior.

## Conclusión
Gate completo en PASS (104 pruebas), trazabilidad limpia, arnés L4 con 142 comprobaciones sin FAIL sobre el árbol actual (incluida la pausa unificada de sello y cinta, que antes no tenía evidencia) y sin regresión de contenido ni de dependencias. Veredicto PASS-PENDIENTES: lo automatizable está en ✔; quedan los pendientes humanos de arriba. Siguiente paso: `/tc-review 002` (riesgo R2 alcanza `reviewFrom`) para re-emitir el veredicto de la review sobre este árbol, después `/tc-ship 002`.
