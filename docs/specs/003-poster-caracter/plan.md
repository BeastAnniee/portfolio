---
type: plan
spec: "[[specs/003-poster-caracter/spec]]"
approved_by: Jostin Aldair Nava
approved_at: 2026-10-28
---
<!-- plan.md — debe ser AUTOSUFICIENTE: un agente sin contexto previo tiene que poder ejecutarlo. Las tareas usan el formato `- [x] **T1** — título` y una línea `Cubre: REQ-1, AC-1` (lo leen tc-status y el lint). `approved_by` lo rellena el humano que aprueba el plan. -->
# Plan · 003-poster-caracter

**Riesgo:** R2 · **Rama:** `feat/003-poster-caracter` (sale de `origin/master`, no de `feat/002-poster-visual`) · **Commits:** convencionales (`feat(design): …`, `test(design): …`, `docs(design): …`), sin rastro de IA; **no se commitea durante Implement**: `/tc-ship` agrupa los commits por tarea.

## 1. Enfoque

Aplicar al código el contrato `docs/specs/003-poster-caracter/design.md` (valores medidos, composición, estados y movimiento ya fijados) y `docs/design/DESIGN.md`, **sin tocar contenido, datos, rutas, metadatos ni la lógica de contacto/«Now»**. Cambia el vestido (token de acento, texturas, ornamentos, fichas, bloque de Contact, movimiento) y se añaden cinco piezas pequeñas: `CountUp`, `Ornaments`, letras escalonadas, pegatina y vista previa del Lab. **Si un valor o regla del contrato no se puede cumplir al implementarlo, se para y se avisa; no se inventa otro** (los respaldos ya previstos por el contrato están en §7).

**Arquitectura elegida**

1. **Tokens y contrato de tests primero, CSS después, componentes al final.** Cada tarea de componente consume clases ya probadas en `globals.css`.
2. **Lógica en módulos puros probados con el ejecutor de Node** (`src/lib/*.ts`, mismo patrón que `now-status.ts`): fichas, letras, contador, posición de la vista previa. Los componentes son delgados. El JSX no es ejecutable en las pruebas (type stripping), así que los componentes se comprueban con (a) pruebas de **texto fuente** en `design-guards.test.ts` (patrón ya usado por la 002) y (b) el arnés de Chrome (L4).
3. **Movimiento con una sola fuente por nodo y sin Framer Motion.** Letras y pegatina: CSS. Parallax: CSS `animation-timeline: view()` (compositor, sin listeners; en navegadores sin soporte queda estático). Contador y vista previa: JS propio mínimo (`IntersectionObserver` + `requestAnimationFrame`; `pointermove` que solo escribe una variable CSS). `MotionProvider` y la dependencia **se conservan** (retirarlos es un ADR aparte, fuera de alcance).
4. **Sangre estructural, no `100vw`.** `main` pasa a ancho completo; `page.tsx` envuelve Hero…Lab en el contenedor `max-w-7xl` y deja `Contact` fuera. Nada de `overflow-x: hidden` global; solo `overflow-x: clip` en Hero y Contact.
5. **Ninguna textura queda debajo de texto** (contrato §2): las capas de textura son nodos vacíos, `aria-hidden`, `pointer-events: none`; un test lo exige y el arnés mide que no se solapan con ningún rect de texto.

**Alternativas descartadas**

| Alternativa | Por qué no |
|---|---|
| Framer Motion (`useScroll`, `useInView`, `m`) para contadores, letras y parallax | Suma JS (NF-1), duplica fuentes de animación por nodo (REQ-10) y `initial` oculta contenido sin JS (REQ-17). El contrato §6 lo descarta. |
| Parallax con `scroll` + `requestAnimationFrame` | Trabajo en el hilo principal y riesgo de tareas largas en móvil (REQ-15). El CSS scroll-driven va en el compositor. |
| Contador con `@property` + `counter()` | Anima una propiedad que no es `transform`/`opacity` y no deja la cifra en el DOM (REQ-10, REQ-12). |
| Halftone con `radial-gradient` o texturas en PNG/JPG | Degradados prohibidos (REQ-4); ráster nuevo prohibido (REQ-7) y más peso. Tile SVG de 8 px con `<circle>` en data-URI. |
| Sangre con `100vw` / `overflow-x: hidden` en `body` | Provoca scroll horizontal y oculta desbordes reales (NF-2). |
| Pruebas de componentes (Vitest + Testing Library) | Dependencias nuevas (NF-3); misma decisión D-B de la 002. |
| Todo en un commit / big-bang | Imposible de revisar y revertir por partes. |

**Decisiones que necesitan tu visto bueno al aprobar el plan**

- **D-A. Sin ADR.** No hay dependencia nueva ni cambio de protocolo; Framer Motion no se usa (queda montado como está).
- **D-B. Sin pruebas de componentes**; la UI se mide con el arnés y con pruebas de texto fuente.
- **D-C. Vista previa del Lab «sigue al cursor» solo en vertical**, dentro de una columna derecha reservada de 15 rem (contenedor ≥ 48 rem); es la forma de cumplir a la vez REQ-11 («no cubre texto») y «sigue al cursor» (contrato §7). Sin hover, con reduced-motion, bajo 48 rem o sin JS la imagen está en la propia fila.
- **D-D. Contadores:** solo `17`, `3` y `6` (regla estricta `^\d+$`); `40→100 %` y todo `[CONFIRMAR]` no se animan. No se muestran conteos derivados (pregunta abierta del contrato §7: se difieren).
- **D-E. Papel arrugado condicional** (T16): entra solo si se ve a 1280 y el raster ≤ 16 ms; si no, se retira sin sustituir por un degradado.
- **D-F. `SECTION_IDS` pasa a `src/content/sections.ts`** (re-exportado desde `index.ts`, sin cambiar ningún import ni el valor) para que los componentes de cliente importen `formatSectionFicha` sin arrastrar los dos diccionarios al bundle (NF-1).
- **D-G. Interpretación de AC-20:** «referencias vigentes» se comprueba en `README.md`, `docs/architecture.md`, `docs/design/DESIGN.md` y la skill `portfolio`; el contrato y la spec 003 citan `#F29BB0` solo como origen del cambio (históricos de la 002 no se reescriben).

## 2. Contexto técnico que el implementador necesita

- **Lee primero** `docs/specs/003-poster-caracter/design.md` (§1–§8) y `spec.md`. Los valores concretos (hex, medidas, polígono del borde rasgado, duraciones, tabla de ornamentos, microtexto) están ahí; este plan no los repite entero.
- **Stack:** Next 15.5 App Router, React 19, Tailwind v4 (`@theme` en `src/app/globals.css`; contenedores: `@2xl` = 42 rem, `@3xl` = 48 rem), Framer Motion presente pero no usado por componentes. Componentes de servidor: `Hero`, `Experience`, `Projects`, `Stack`, `Achievements`, `Education`, `SectionHeading`, `DuoImage`, `ProjectCard`, `SignatureBadge`. De cliente (`'use client'`): `Lab`, `Contact`, `Now`, `Marquee`, `CopyEmailButton`, `MotionProvider`; `CountUp` será nuevo.
- **Comandos:** `npm test` (Node `--test` sobre `src/**/*.test.ts`; los imports de `src/lib` y `src/content` llevan extensión `.ts`), `npm run lint`, `npx tsc --noEmit`, `npm run build`, `node scripts/tc-verify.mjs --fast` (cada tarea) y `node scripts/tc-verify.mjs` (cierre). Línea base de esta sesión: `--fast` PASS; `npm run build` → `/[lang]` **13,4 kB**, First Load JS **116 kB** (presupuesto NF-1: **≤ 126 kB**).
- **Patrones de test a seguir:** `src/lib/design-css.test.ts` (helpers `flat`, `blocks(prefix)`, `rule(selector)`, `themeTokens()`; `rule()` solo encuentra reglas cuyo selector es **exactamente** el pedido y están fuera de `@media`/`@container`; para las anidadas usar `blocks('@container …')`) y `src/lib/design-guards.test.ts` (`sources`, `hits(regex)`, `byPath`; los dos archivos de test están en `SELF` y pueden citar patrones prohibidos).
- **Trampas de las guardas** (`design-guards.test.ts` escanea todo `src/` **incluidos comentarios**): no escribas las palabras `gradient`, `shadow`, `drop-shadow`, `backdrop-`, `ring-`, `bento`, `Particles`, `ogl` ni `transition: all` en ningún `.ts/.tsx/.css`; tampoco `outline-none`. `transition-transform` (chevron del Lab) está permitido; la utilidad `transition` a secas no. `rule(…)` y los regex de los tests dependen de la forma exacta del CSS (espacios, `;`), así que **escribe el CSS tal como lo fija el test de la tarea**.
- **Reutilizar:** `.duo/.duo-layer/.grain/.press/.rule-x/.rule-y/.marquee-*/.badge-spin/.mask/.rise` (`globals.css`), `DuoImage.tsx`, `SignatureBadge.tsx`, `SectionHeading.tsx` (su prop `ficha` ya existe y hoy nadie la usa), `formatFicha` (`src/lib/ficha.ts`), `contrastRatio` (`src/lib/contrast.ts`), `badgeBox` (`src/lib/badge-geometry.ts`), patrón de foco (`:focus-visible`).
- **No tocar:** `src/content/facts.ts`, `src/lib/contact.ts`, `src/lib/metadata.ts`, `src/lib/now-status.ts`, `MotionProvider.tsx`, `layout.tsx`, `package.json`, `scripts/tc-verify.mjs`, `scripts/lib/**`, `.tc/config.json`, `docs/constitution.md` (rutas con confirmación). `global-not-found.tsx` solo hereda el token (sin cambio).
- **Arnés L4:** `scripts/visual-check.mjs` (Chrome headless por CDP, sin dependencias, **no forma parte del gate**). Uso: `npm run build && npx next start -p 3400` y `node scripts/visual-check.mjs --url=http://localhost:3400 --check=<a,b|all> --langs=en,es --widths=320,360,390,1024,1280 [--shots]`. El check `contact` necesita `next dev` con `NEXT_PUBLIC_EMAILJS_*` ficticias (ver su comentario). Los puertos 3000 y 3100 pueden ser de procesos ajenos: no los toques; usa 3400 y detén tu servidor al terminar.
- **Fichas:** el contrato fija `[EXP. 01]`, `[PROJ. 01]`/`[PROY. 01]`, `[LAB 08]`, `[ACH. 06]`/`[LOGRO 06]`, `[EDU. 03]` (sin claves nuevas) y, por sección, `[NN]` con `NN = SECTION_IDS.indexOf(id) + 1` (`now` 02 … `contact` 09).

## 3. Tareas
<!-- Atómicas (≈1 commit), en orden, cada una con: archivos, test primero, verificación y requisitos/criterios que cubre. -->

- [x] **T1** — Rama desde `origin/master` y línea base
  - Archivos: ninguno (solo git).
  - Test primero: n/a (preparación). Antes de cambiar nada, `node scripts/tc-verify.mjs --fast` y `npm test` en verde fijan la línea base (anota nº de pruebas).
  - Cambio: `git fetch origin && git switch -c feat/003-poster-caracter origin/master`. El árbol sin commit (DESIGN.md modificado, 23 imágenes de `docs/context/referencias/` en el índice, `docs/specs/003-poster-caracter/`) viaja con la rama. **Si git rechaza el cambio porque archivos sin seguimiento colisionan con `origin/master`, para y avisa; no borres nada.**
  - Verificación: `git branch --show-current` → `feat/003-poster-caracter`; `git status --short` sigue mostrando esos cambios; `node scripts/tc-verify.mjs --fast` → PASS; `npm test` → 0 fallos.
  - Cubre: REQ-19, AC-18

- [x] **T2** — Token de acento `#EE5583` y tabla de contraste del contrato
  - Archivos: `src/app/globals.css`, `src/lib/design-css.test.ts`, `src/lib/design-guards.test.ts`
  - Test primero: en `design-css.test.ts` cambia `HEX.accent` a `#EE5583` y el primer test de tokens; reemplaza `TEXT_PAIRS` por la tabla del contrato §2 (bone/carbon 14,52 · bone/carbon-2 13,29 · bone-2/carbon 7,33 · bone-2/carbon-2 6,71 · accent/carbon 5,49 · accent/carbon-2 5,03 · carbon/accent 5,49 · carbon/bone 14,52, umbral 4,5; line/carbon 4,07 · line/carbon-2 3,72 · accent/carbon 5,49 · carbon/accent 5,49, umbral 3) con el mismo cálculo y tolerancia 0,01; sustituye «accent sobre bone ≈ 1,6» por un test de **pares prohibidos** (`bone/accent` y `accent/bone` = 2,64 < 3, `line/accent` = 1,35, ninguno en `TEXT_PAIRS`); corrige el comentario de la línea 56 que remite al contrato 002. En `design-guards.test.ts` añade: (1) `hits(/F29BB0/i)` en `src/` → `[]`; (2) ninguna línea con `bg-accent` (sin prefijo de variante) contiene `text-bone`, `text-bone-2` ni `text-accent`. Deben fallar (el token aún es `#F29BB0`).
  - Cambio: `--color-accent: #EE5583;` y el comentario «Fuente de verdad» de `globals.css` apunta al contrato 003. Corrige cualquier clase que el test (2) señale.
  - Verificación: `npm test` → 0 fallos; `grep -rin "F29BB0" src` → vacío; `node scripts/tc-verify.mjs --fast` → PASS.
  - Cubre: REQ-1, REQ-2, REQ-20, AC-1, AC-2, AC-19

- [x] **T3** — Fichas con corchetes y numeración de sección
  - Archivos: `src/content/sections.ts` (nuevo), `src/content/index.ts`, `src/lib/ficha.ts`, `src/lib/ficha.test.ts`
  - Test primero: `ficha.test.ts` espera `[EXP. 01]`, `[EXP. 03]`, `[EXP. 10]`, `[LAB 01]`, `[LOGRO 06]`; el formato de elemento cumple `^\[.+ \d{2}\]$`; `formatFicha(en.ficha.lab, facts.projects.lab.length - 1)` → `[LAB 08]` (número derivado del dato real); `formatFicha('X', -1)` y un índice no entero lanzan error (no se numeran elementos inexistentes); `formatSectionFicha('now')` → `[02]`, `'hero'` → `[01]`, `'contact'` → `[09]` y, para cada id de `SECTION_IDS`, el número coincide con su posición + 1; un id fuera de la lista lanza error.
  - Cambio: mueve `SECTION_IDS` a `src/content/sections.ts` (mismo valor y orden) y reexpórtalo desde `index.ts` (`export { SECTION_IDS } from './sections.ts'`); `ficha.ts` importa de `sections.ts` (nunca de `index.ts`, para no arrastrar los diccionarios al cliente), devuelve `` `[${label} ${NN}]` `` y añade `formatSectionFicha(id: SectionId)`. Las ocho llamadas existentes a `formatFicha` no cambian: el corchete se propaga.
  - Verificación: `npm test` → 0 fallos (incluidos `content.test.ts` y `locale.test.ts` sin tocar); `npx tsc --noEmit` → sin errores.
  - Cubre: REQ-9, AC-8

- [x] **T4** — Lógica pura: letras escalonadas, contador y posición de la vista previa
  - Archivos: `src/lib/letters.ts`, `src/lib/letters.test.ts`, `src/lib/count-up.ts`, `src/lib/count-up.test.ts`, `src/lib/lab-preview.ts`, `src/lib/lab-preview.test.ts`
  - Test primero (los tres archivos de test se escriben antes y fallan por módulo inexistente):
    - `letters`: `LETTER_STEP_MS = 18` (≤ 40), `LETTER_DURATION_MS = 200`; `splitLetters('Jostin Aldair Nava')` → 3 palabras, 16 letras con índice continuo 0–15 (los espacios no consumen índice); concatenar las letras y unir con espacio reconstruye el nombre exacto; `riseTotalMs(16) = 470 ≤ 500` y `riseTotalMs(n) ≤ 500` para `facts.profile.name`.
    - `count-up`: `COUNT_MS = 500`; `isCountable('17')` verdadero; falso para `'40→100 %'`, `'[CONFIRMAR]'`, `''`, `'3.5'`, `'-2'`; `countAt(17, 0) = 0`, `countAt(17, 500) = 17`, `countAt(17, 9999) = 17`, monótona no decreciente y nunca mayor que el objetivo (barrido cada 10 ms); sobre `facts.experience` los valores contables son exactamente `['17','3','6']`.
    - `lab-preview`: `previewOffset({ pointerY, listTop, listHeight, previewHeight })` centra la miniatura en el puntero y la acota a `[0, max(0, listHeight − previewHeight)]` (puntero sobre la lista, por encima, por debajo, miniatura más alta que la lista → 0); `anchorOffset({ rowTop, listTop, listHeight, previewHeight })` ancla al borde superior de la fila con el mismo acotado; `shouldPreview({ hover, reducedMotion })` es `hover && !reducedMotion` (tabla de verdad completa).
  - Cambio: implementa los tres módulos sin dependencias ni acceso a `window`/`document`. `countAt` usa ease-out cúbica y `Math.round`.
  - Verificación: `npm test` → los tres archivos nuevos en verde, 0 fallos.
  - Cubre: REQ-11, REQ-12, REQ-13, AC-10, AC-11, AC-12

- [x] **T5** — CSS de textura, bloque de acento y capas de `forced-colors`
  - Archivos: `src/app/globals.css`, `src/lib/design-css.test.ts`
  - Test primero (en `design-css.test.ts`; fallan antes): `.grain` con `opacity` ∈ [0,20; 0,30] (valor del contrato 0,26) y sin `animation`; existen `.tex`, `.tex-dots-bone`, `.tex-dots-carbon`, `.duo-dots`, `.torn-top`, `.ornament`; `.tex` y `.duo-dots` con `pointer-events: none` y sin `animation`; el tile de punteado es un data-URI SVG con `<circle>` (de 8 px) y la CSS no contiene `gradient(`; opacidades: `.duo-dots` 0,35, `.tex-dots-bone` 0,30, `.tex-dots-carbon` 0,20 (ninguna > 0,35); `.torn-top` declara `clip-path: polygon(` con el polígono del contrato §5; el bloque `forced-colors` oculta `.duo-sat, .duo-mul, .duo-lift, .duo-dots, .tex, .ornament` (**sustituye** a la aserción que listaba solo las tres capas del duotono) y fija `.torn-top { clip-path: none; border-top: 2px solid CanvasText }`; la regla de foco pasa a `.inverted :focus-visible, [data-block="accent"] :focus-visible { outline-color: var(--color-carbon) }` (**sustituye** a la de solo `.inverted`); `[data-block="accent"] ::selection` es carbon/bone; la lista de clases del catálogo incluye las nuevas.
  - Cambio: en `globals.css`: `.grain` a 0,26; capas `.tex` (base: `position:absolute; inset:0; pointer-events:none`), `.tex-dots-bone` (puntos `#E9E4D8`), `.tex-dots-carbon` (`#141414`) con el tile SVG 8 px en data-URI codificado (`%23`), `.duo-dots` (`mix-blend-mode: multiply`, dentro de `.duo`), `.torn-top`, `.ornament { pointer-events: none }`, selección y foco en bloque de acento, y las capas ocultas en `forced-colors`. Sin `animation` en ninguna textura. Actualiza el comentario del encabezado de la sección duotono («grano a 0,26»).
  - Verificación: `npm test` → 0 fallos; `grep -nE "gradient|shadow" src/app/globals.css` → vacío; `node scripts/tc-verify.mjs --fast` → PASS.
  - Cubre: REQ-4, REQ-5, REQ-6, REQ-20, AC-4, AC-5, AC-6, AC-19

- [x] **T6** — CSS de movimiento: letras, pegatina, parallax, vista previa y reduced-motion
  - Archivos: `src/app/globals.css`, `src/lib/design-css.test.ts`
  - Test primero (fallan antes): `.rise` usa `LETTER_DURATION_MS` (200 ms) y `calc(var(--i, 0) * ${LETTER_STEP_MS}ms)` importados de `letters.ts` (**sustituye** a «360 ms / 60 ms»); `.sticker` con `transition: transform 150ms ease-out`, `transform: rotate(var(--r))`, base `--r: -6deg`, `:hover` (dentro de `@media (hover: hover)`) y `:focus-visible` con `--r: -12deg` (giro adicional 6° ≤ 8°; total 12° ≤ 16°); `.parallax` con `animation: drift linear both` y `animation-timeline: view()` **solo** dentro de `@supports (animation-timeline: view())`, `--d` igual a `--d-full` y a la mitad bajo 768 px; `@keyframes drift` solo anima `transform` (el test existente de keyframes lo cubre); `.name-cut` con `--cut: .07em`, `clip-path: inset(0 0 var(--cut) 0)` y `margin-bottom: calc(var(--cut) * -1)`; `.lab-preview` con `transform 120ms ease-out` y `opacity 150ms`, y reglas de `@container (min-width: 48rem)` que muestran la vista previa y ocultan `.lab-inline` solo con `[data-preview]`; en `prefers-reduced-motion`: `.rise, .parallax, .rule-x, .rule-y { animation: none; }` (**sustituye** a la regla sin `.parallax`), `.sticker { transition: none }` con `:hover`/`:focus-visible` en `--r: -6deg`, `.lab-preview { display: none }`; sigue el acortamiento global de 0,01 ms. Ningún `transition: all`, ninguna propiedad animada distinta de `transform`/`opacity`.
  - Cambio: implementa todo lo anterior en `globals.css` tal como lo fija el contrato §6 (la máscara por palabra `.mask` se conserva).
  - Verificación: `npm test` → 0 fallos; `node scripts/tc-verify.mjs --fast` → PASS.
  - Cubre: REQ-10, REQ-13, REQ-14, REQ-15, REQ-16, REQ-20, AC-9, AC-12, AC-13, AC-14, AC-15, AC-19

- [x] **T7** — Microtexto de la pegatina en ambos diccionarios
  - Archivos: `src/content/types.ts`, `src/content/en.ts`, `src/content/es.ts`, `src/content/content.test.ts`
  - Test primero: nuevo test en `content.test.ts`: `Object.keys(en.sticker)` = `Object.keys(es.sticker)` = `['label']`, textos no vacíos, `en.sticker.label === 'Get in touch'` y `es.sticker.label === 'Escríbeme'`. Los tests de contenido existentes (claves idénticas en `en`/`es`, ficha, marquee) **no se tocan**.
  - Cambio: `sticker: { label: string }` en `Dictionary`; valores del contrato §4 en `en.ts`/`es.ts`. Ninguna otra clave.
  - Verificación: `npm test` → 0 fallos; `npx tsc --noEmit` → sin errores.
  - Cubre: REQ-8, REQ-19, AC-7, AC-18

- [x] **T8** — Ornamentos SVG y envoltorio de parallax
  - Archivos: `src/components/Ornaments.tsx` (nuevo), `src/lib/design-guards.test.ts`
  - Test primero (prueba de texto fuente, falla por archivo inexistente): en `Ornaments.tsx` cada `<svg` lleva `aria-hidden="true"` y `focusable="false"` y tantas veces como SVG hay; sin `<text`, sin `id=`, sin `<image`, sin `next/image`, sin `<script`; usa `currentColor` y ningún hex; cada SVG lleva la clase `ornament`; exporta `Star4`, `Checker`, `RingMarks`, `Parallax`; `Parallax` renderiza `className` con `parallax` y `aria-hidden="true"`.
  - Cambio: `Star4` (path del contrato §5), `Checker` (2×6 `<rect>` de 12 px alternados, 72×24), `RingMarks` (círculo r 44 + 12 marcas, trazo 1,5), todos con `viewBox`, un solo color (`currentColor`) y tamaño por prop. `Parallax({ d, className, children })` → `<div className="parallax …" style={{ '--d-full': `${d}px` }} aria-hidden="true">`: el `div` lleva el `transform` animado y el `<svg>` hijo, como mucho una rotación estática (un solo transform por nodo).
  - Verificación: `npm test` → 0 fallos; `npx tsc --noEmit` → sin errores.
  - Cubre: REQ-7, REQ-15, AC-7, AC-14

- [x] **T9** — Estructura a sangre, marca de bloques y fichas de sección
  - Archivos: `src/app/[lang]/page.tsx`, `src/components/SectionHeading.tsx`, `Now.tsx`, `Experience.tsx`, `Projects.tsx`, `Stack.tsx`, `Achievements.tsx`, `Education.tsx`, `Lab.tsx`, `src/lib/design-guards.test.ts`
  - Test primero (texto fuente, falla antes): `page.tsx`: `<main` no contiene `max-w-7xl` ni `px-`; existe un `div` con `mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10` que abre antes de `<Hero` y cierra después de `<Lab …/>`, y `<Contact` queda **después** de ese cierre (fuera del contenedor); `Projects.tsx` lleva `data-block="bone"`; cada una de las siete secciones con `SectionHeading` pasa `ficha={formatSectionFicha('<su id>')}`; `Projects` conserva `inverted`. El resto de pruebas de la 002 (orden del Hero, scroll-padding, etc.) siguen intactas.
  - Cambio: `main` → `w-full pt-16`; envoltorio `max-w-7xl` alrededor de Hero…Lab; `Contact` fuera. `SectionHeading` ya soporta `ficha` (mono 12 px, `bone-2` sobre carbon y carbon en bloque invertido): cada sección la pasa con `formatSectionFicha`. **Los textos del Hero/Marquee/Now/… no cambian.**
  - Verificación: `npm test` → 0 fallos; `node scripts/tc-verify.mjs --fast` → PASS; `npm run build` → compila (la hoja de Contact aún no cambia).
  - Cubre: REQ-3, REQ-9, REQ-19, AC-3, AC-8

- [x] **T10** — Contact como bloque de acento a sangre
  - Archivos: `src/components/Contact.tsx`, `src/lib/design-guards.test.ts`
  - Test primero (texto fuente, falla antes): `Contact.tsx` tiene `<section id="contact" aria-labelledby="contact-title" data-block="accent"`, `torn-top`, `bg-accent`, `text-carbon`, `Star4` y `RingMarks` con `Parallax`; **no** contiene `text-accent`, `text-bone-2`, `border-accent`, `border-line`, `opacity-50` ni `disabled:opacity`; **sí** `bg-carbon text-bone` solo en campos y botón; las capas `tex-dots-carbon` son elementos autocerrados sin hijos (`<div … />`) y `aria-hidden="true"`; la guarda existente «tarjetas invertidas» se mantiene y se amplía con `text-(accent|bone-2)` prohibido en Contact.
  - Cambio (contrato §1–§4): sección a ancho completo con `torn-top`, `overflow-x-clip`, `relative`, `bg-accent text-carbon`, relleno superior ≥ 80 px (`pt-20`), contenedor interior `mx-auto max-w-7xl px-4 sm:px-6 lg:px-10` y `max-w-2xl` para el contenido. Ficha `{formatSectionFicha('contact')} {copy.badge}` (carbon). Título y texto en `carbon` (el título con `pr-16` bajo 640 px). Campos normales `bg-carbon text-bone border border-carbon placeholder:text-bone-2`, etiquetas carbon; campo con error `bg-bone text-carbon border-2 border-carbon` con `CircleAlert` y texto carbon; éxito `role="status"` `bg-carbon text-bone border-2 border-carbon`; fallo `role="alert"` `bg-bone text-carbon border-2 border-carbon` con `mailto` carbon subrayado; botón `bg-carbon text-bone border border-carbon hover:bg-bone hover:text-carbon`, **sin** `disabled:opacity-50` (enviando: mismo fondo, `Loader` + «Sending…»). Ornamentos: `Star4` carbon 56 px (112 px ≥ 640) arriba a la derecha con `Parallax d=20`; `RingMarks` carbon 140 px abajo a la derecha solo ≥ 768 px con `d=12`; punteado `tex-dots-carbon` en una columna derecha (`hidden lg:block`, ancho tal que **no** toque la columna del formulario a 1024 px; ver contrato §5 «ninguna textura bajo texto»). **La lógica del formulario (`validateContact`, `sendContact`, `statusAfterEdit`, foco al primer error, EmailJS) no cambia.**
  - Verificación: `npm test` → 0 fallos; `node scripts/tc-verify.mjs --fast` → PASS; `npm run build` → compila.
  - Cubre: REQ-2, REQ-3, REQ-4, REQ-5, REQ-7, REQ-15, AC-2, AC-3, AC-4, AC-7

- [x] **T11** — Hero: pegatina, nombre en letras recortado por abajo, foto con punteado y ornamentos
  - Archivos: `src/components/Hero.tsx`, `src/components/DuoImage.tsx`, `src/app/[lang]/page.tsx`, `src/lib/design-guards.test.ts`
  - Test primero (texto fuente, falla antes): en `Hero.tsx`, el `<h1` lleva `name-cut`, contiene un `<span className="sr-only">` con el nombre y un `aria-hidden="true"` con las letras generadas por `splitLetters`; la pegatina es `<a … href="#contact" className="sticker …">`, sin `aria-hidden`, con `hero`-prop `sticker` y `ArrowDown`, y aparece en el DOM **después** de `</h1>` y **antes** de `href="#projects"` (CTA); `Star4`, `Checker`, `Parallax` y la capa `tex-dots-bone` (vacía y `aria-hidden`) presentes; `data-hero-frame` sigue con `overflow-x-clip` y gana `relative`; el test existente «cargo y CTA antes que la foto» sigue verde. `DuoImage` acepta `dots?: boolean` y solo entonces pinta `<div className="duo-dots" aria-hidden="true" />` entre las capas y el grano; **sin** la clase `duo-layer`.
  - Cambio (contrato §1, §5, §6): fila superior de `min-h-[76px]` con el saludo a la izquierda (`max-width: calc(100% - 10.5rem)`) y la pegatina `absolute right-4 top-4 @2xl:right-6` (48 px de alto, `bg-accent text-carbon`, mono 12 px, radio 8, `hover:bg-bone`); `h1` con `name-cut`, tamaños de la 002 intactos, `sr-only` + letras (`<span class="mask …">` por palabra y `<span class="rise" style="--i: n">` por letra); foto con `dots`, rectángulo `tex-dots-bone` desplazado 12 px abajo-derecha detrás, `Star4` accent 28 px (−14 px, `Parallax d=16`) y `Checker` bone 72×24 (−8 px) en las esquinas; sello sin cambios. `page.tsx` pasa `sticker={dict.sticker.label}` a `Hero`. **Ni cargo, ni resumen, ni CTA, ni iconos cambian de texto.**
  - Verificación: `npm test` → 0 fallos; `node scripts/tc-verify.mjs --fast` → PASS; `npm run build` → compila.
  - Cubre: REQ-5, REQ-7, REQ-8, REQ-13, REQ-14, REQ-15, REQ-17, REQ-18, AC-7, AC-12, AC-13, AC-16, AC-17

- [x] **T12** — Experience: cifras que cuentan (`CountUp`)
  - Archivos: `src/components/CountUp.tsx` (nuevo, cliente), `src/components/Experience.tsx`, `src/lib/design-guards.test.ts`
  - Test primero (texto fuente, falla antes): `CountUp.tsx` importa `COUNT_MS`, `countAt` e `isCountable` de `@/lib/count-up.ts`, usa `IntersectionObserver` (umbral 0,4) y `requestAnimationFrame`, consulta `prefers-reduced-motion`, renderiza la cifra final en un `span` `sr-only` y en otro `aria-hidden="true"`, y no importa `framer-motion` ni usa `setInterval`/`setTimeout` para contar; `Experience.tsx` usa `<CountUp` y **ni este ni `CountUp.tsx` contienen el literal de ninguna métrica de `facts.experience`** (`17`, `3`, `6`, `40→100 %`).
  - Cambio: `CountUp({ value })`: el HTML servido contiene el valor final; al montar, si `isCountable(value)`, no hay reduced-motion y existe `IntersectionObserver`, fija `min-width` con el ancho final (CLS 0), observa, y en la primera entrada cuenta **una vez** de 0 al valor en `COUNT_MS` escribiendo solo el texto del nodo (sin `setState` por fotograma) y termina escribiendo exactamente `value`; desconecta y cancela el `rAF` al desmontar. Valores no contables (`40→100 %`, vacíos) se renderizan tal cual sin observar. En `Experience`, `dd` usa `<CountUp value={metric.value} />` conservando clases y tipografía.
  - Verificación: `npm test` → 0 fallos; `node scripts/tc-verify.mjs --fast` → PASS; `npm run build` → compila.
  - Cubre: REQ-12, REQ-16, REQ-17, AC-11, AC-15, AC-16

- [x] **T13** — Lab: filas con ficha y vista previa que sigue al cursor
  - Archivos: `src/components/Lab.tsx`, `src/components/ProjectCard.tsx`, `src/lib/design-guards.test.ts`
  - Test primero (texto fuente, falla antes): `Lab.tsx` usa `previewOffset`, `anchorOffset` y `shouldPreview` de `@/lib/lab-preview.ts`, `matchMedia('(hover: hover)')` y `prefers-reduced-motion`, expone `data-preview`, filas con `data-lab-row`, un contenedor `lab-preview` con `aria-hidden="true"`, `onPointerMove` en la lista y foco (`onFocus`/`focusin`) en las filas, y no importa `framer-motion`; `ProjectCard.tsx` ya no contiene la variante `'module'` ni `bg-carbon-2`/`rounded-xl border`, tiene `variant: 'inverted' | 'row'`, conserva `alt=""` en la imagen, y las ramas `inverted ? '…'` siguen sin `text-accent`/`text-bone-2` (guarda existente); `lab-inline` aparece en la fila.
  - Cambio (contrato §1, §6): `Lab` renderiza una `<ol>` de filas `[LAB 0n]` (borde `line` superior, `break-words`, apiladas en móvil) y, a la derecha, el contenedor `lab-preview` de 15 rem con 1 `Image` color pleno 16:9 `alt=""` por proyecto con imagen (`facts.projects.lab` → 2 de 8); `ProjectCard` variante `row` muestra, si hay imagen, un `DuoImage` 16:9 `lab-inline` (máx. 20 rem). Estado: `preview` (de `shouldPreview` con `matchMedia`, con listeners de cambio) pone `data-preview` en la lista; `pointermove` escribe solo `--y` (`previewOffset`) y activa la imagen de la fila bajo el cursor; `focusin` en una fila ancla con `anchorOffset`; `pointerleave` la apaga. Sin hover, con reduced-motion, bajo 48 rem o sin JS no hay `data-preview` y la imagen está en la fila. Proyectos sin imagen: nada. El botón plegable (`aria-expanded`, `aria-controls`) y los textos no cambian; el chevron conserva `transition-transform`.
  - Verificación: `npm test` → 0 fallos; `node scripts/tc-verify.mjs --fast` → PASS; `npm run build` → compila.
  - Cubre: REQ-5, REQ-9, REQ-11, REQ-16, REQ-17, AC-8, AC-10, AC-15, AC-16

- [x] **T14** — Arnés visual: adaptar los checks de la 002 al nuevo sistema
  - Archivos: `scripts/visual-check.mjs`
  - Test primero: el propio arnés es la prueba. Antes de editar, `npm run build && npx next start -p 3400` y `node scripts/visual-check.mjs --url=http://localhost:3400 --check=hero,inverted,lab --langs=en --widths=390` debe **fallar** en los tres (miden la estructura de la 002); tras el cambio, pasar.
  - Cambio: (1) `SHOTS_DIR` por defecto en `docs/specs/003-poster-caracter/screens/` con `--spec=<id>` para elegir otro; actualiza la cabecera y el mensaje del check `pages`. (2) `hero`: el nombre accesible se lee del `.sr-only` del `h1` (el `textContent` ya duplica), mide las 3 palabras por `.mask` y las 16 letras `.rise`, y exige `.duo-dots` además de las 3 capas. (3) `inverted` → `blocks`: recorre `[data-block]` en orden del DOM; exige ≤ 2, ninguno consecutivo, Contact `rgb(238, 85, 131)`/`rgb(20, 20, 20)`, Projects `rgb(233, 228, 216)`/carbon, y sigue exigiendo la clase `.inverted` en Projects. (4) `lab`: filas `li[data-lab-row]` en lugar de `article` módulo carbon-2; duotono → color con hover/foco y permanente sin hover sobre `.lab-inline .duo`. (5) `contact`: colores esperados del bloque de acento y de los estados. Mantén `ALL_CHECKS` y los checks no afectados.
  - Verificación: `node scripts/visual-check.mjs --url=http://localhost:3400 --check=hero,inverted,lab,landmarks,overflow --langs=en,es --widths=320,390,1280` → `0 FAIL`.
  - Cubre: REQ-3, REQ-18, REQ-19, AC-3, AC-17, AC-18

- [x] **T15** — Arnés visual: checks nuevos de la 003
  - Archivos: `scripts/visual-check.mjs`
  - Test primero: cada check nuevo se corre primero contra el árbol **sin** la característica correspondiente cuando sea posible (p. ej. `first-viewport` contra `origin/master` debe poder fallar) o, si no, se verifica que falla al forzar un caso conocido (p. ej. `--scope`), y después pasa contra la build de la rama.
  - Cambio: añade y registra en `ALL_CHECKS`: `first-viewport` (REQ-18: con `prefers-reduced-motion` emulado y sin animaciones, en 390×844 y 320×568, `getBoundingClientRect().bottom` de `h1`, cargo, CTA y pegatina ≤ 844 [≤ 568 en 320 solo h1, cargo y pegatina] y `scrollY` = 0; EN y ES); `sticker` (enlace a `#contact`, rotación computada ≤ 8° en reposo, ≤ 16° totales con hover/foco, solo `transform` en `transition-property`, rect sin solapar el `h1`, el CTA ni la foto, 320–1280); `ornaments` (svg `aria-hidden`, sin `<text>`, sin ráster, ≤ 40 px de `transform` por parallax, `pointer-events: none`); `textures` (cada `.tex`/`.duo-dots` `aria-hidden`, `pointer-events: none`, sin `animation`, **sin hijos de texto y sin solaparse con ningún rect de texto** a 320–1280, ocultas con `forced-colors`; opacidad del grano ∈ [0,20; 0,30]); `letters` (retardo entre letras ≤ 40 ms, total ≤ 500 ms, árbol de accesibilidad del `h1` = una cadena); `counters` (cifra final en el DOM al cargar, también con JS desactivado; cuenta una sola vez al entrar en vista hacia el valor de `facts.ts`; reduced-motion → cifra final al instante; sin CLS); `fichas` (formato `^\[.+ \d{2}\]$`, número = índice real); `preview` (con `hover: hover`: la miniatura sigue al cursor en vertical y no solapa texto; foco por teclado la ancla a la fila; sin hover la imagen está en la fila; proyectos sin imagen no la muestran); `parallax` (a 360 px emulados, `PerformanceObserver` de `longtask` durante el desplazamiento: ninguna > 50 ms atribuible; desplazamiento ≤ 40 px).
  - Verificación: `node scripts/visual-check.mjs --url=http://localhost:3400 --check=first-viewport,sticker,ornaments,textures,letters,counters,fichas,preview,parallax --langs=en,es --widths=320,360,390,1024,1280` → `0 FAIL` (los INFO/avisos se anotan en `validation.md`, no se silencian).
  - Cubre: REQ-5, REQ-6, REQ-8, REQ-9, REQ-11, REQ-12, REQ-13, REQ-14, REQ-15, REQ-16, REQ-17, REQ-18, AC-5, AC-6, AC-7, AC-8, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16, AC-17, AC-22

- [x] **T16** — Papel arrugado en Contact (condicional)
  - Archivos: `src/app/globals.css`, `src/components/Contact.tsx`, `src/lib/design-css.test.ts`
  - Test primero: `design-css.test.ts` exige `.tex-paper` con data-URI SVG (`feTurbulence` + `feDiffuseLighting` con `feDistantLight`), `mix-blend-mode: multiply`, `opacity` ≤ 0,35, sin `animation` ni `gradient(`, y que quede dentro del grupo oculto en `forced-colors` (hereda `.tex`).
  - Cambio: capa `tex tex-paper` vacía y `aria-hidden` en la zona derecha de Contact a ≥ 1024 px (la misma columna sin texto de T10). **Compuerta de decisión:** captura a 1280 px y traza de rendimiento; si el efecto no se aprecia o el raster supera 16 ms, se **retira** (CSS, marcado y su test) y se anota en §9; no se sustituye por un degradado. La persona aprueba su composición en la revisión visual.
  - Verificación: `npm test` → 0 fallos; `node scripts/visual-check.mjs --url=http://localhost:3400 --check=textures,contrast --langs=en,es --widths=1024,1280` → `0 FAIL`; captura `contact-1280-en-normal.png` en `screens/`.
  - Cubre: REQ-5, REQ-6, AC-5, AC-6

- [x] **T17** — Documentación coherente con el nuevo sistema
  - Archivos: `docs/design/DESIGN.md`, `.claude/skills/portfolio/references/design-system.md`, `README.md`, `docs/architecture.md`, `src/lib/design-guards.test.ts`
  - Test primero: amplía el test «README y skill portfolio no remiten al sistema anterior» de `design-guards.test.ts`: `README.md`, `docs/architecture.md`, `docs/design/DESIGN.md` y los `.md` de la skill `portfolio` no contienen `F29BB0` ni `lavado` (sin distinguir mayúsculas); y `docs/design/DESIGN.md` no menciona el «parpadeo único de retícula». Falla hoy (DESIGN.md líneas 28 y 67; `design-system.md` línea 8).
  - Cambio: `DESIGN.md`: reformula las dos líneas que citan el rosa anterior (sin su hex ni «lavado») y elimina el «parpadeo único de retícula» de §6 (no existe en el código; contrato §7). `design-system.md`: tokens con `accent` `#EE5583`, bloque de acento (Contact, texto carbon), texturas, ornamentos, fichas y el movimiento nuevo. `README.md`/`docs/architecture.md`: solo si afirman algo sobre color o movimiento que ya no sea cierto (hoy `README.md` lista Framer Motion para animaciones: corrige si el código ya no lo usa, sin tocar el resto). **No se reescriben** los artefactos de la 001/002 ni el contrato 003 (D-G).
  - Verificación: `npm test` → 0 fallos; `node scripts/tc-design.mjs lint 003` → sin errores; `grep -rniE "F29BB0|lavado" README.md docs/architecture.md docs/design .claude/skills/portfolio` → vacío.
  - Cubre: REQ-21, AC-20

- [x] **T18** — Mediciones «a medir» del contrato, ajustes y presupuesto
  - Archivos: los que cada medición obligue a ajustar (`globals.css`, `Hero.tsx`, `Contact.tsx`), `docs/specs/003-poster-caracter/screens/*.png`
  - Test primero: los checks de T14/T15 son las pruebas; esta tarea los ejecuta sobre la build final y cierra lo que el contrato dejó «a medir».
  - Cambio: build y `next start -p 3400`; (1) `--cut`: el borde inferior del marco se come ≤ 12 % de la altura de versal en NAVA a 390 y 1280; si la lectura falla, `--cut: 0`; (2) kerning de las letras `inline-block`: captura y revisión; (3) primer viewport 390×844 (EN y ES) y 320×568 con movimiento apagado; (4) traza a 360 px del parallax: si hay tareas > 50 ms atribuibles, `--d-full: 0` bajo 768 px; (5) raster del papel arrugado (cierra T16); (6) AC-6: contraste muestreado bajo cada texto de Contact y Hero a 390 y 1280 con texturas activas; (7) `next build`: `/[lang]` First Load JS ≤ **126 kB** (línea base 116 kB) y CLS ≤ 0,1; (8) `git diff package.json package-lock.json` vacío; (9) capturas por pantalla × ancho × idioma × estado según contrato §8 (`<pantalla>-<ancho>-<idioma>-<estado>.png`) incluidos reduced-motion, `forced-colors`, JS desactivado, `hover: none`, zoom 200 % y la 404 con el nuevo acento. **Cualquier ajuste que cambie un valor del contrato se anota en §9; si algo no se puede cumplir con los respaldos previstos, para y avisa.**
  - Verificación: `node scripts/visual-check.mjs --url=http://localhost:3400 --check=all --langs=en,es --widths=320,360,390,1024,1280` → `0 FAIL`; `npm run build` → tamaños dentro de presupuesto; `git diff package.json` → vacío.
  - Cubre: REQ-6, REQ-15, REQ-18, NF-1, NF-2, NF-3, AC-6, AC-14, AC-17, AC-21, AC-22, AC-23

- [x] **T19** — Auditoría del diff de pruebas y cierre del gate
  - Archivos: ninguno nuevo (revisión de `*.test.ts`); correcciones solo si la auditoría las pide.
  - Test primero: n/a (auditoría). La referencia es la tabla de aserciones sustituidas del §5.
  - Cambio: `git diff -U0 origin/master -- 'src/**/*.test.ts'` y, línea por línea, comprueba que cada aserción retirada tiene su sustituto de la tabla del §5 y que las guardas de sombras, degradados, `transition: all`, `ogl` y «sin Particles» siguen; `git diff origin/master -- src/content` solo muestra `sections.ts`, `index.ts`, `types.ts`, `en.ts`/`es.ts` (clave `sticker`) y su test; `facts.ts` sin diff. Después `node scripts/tc-verify.mjs` completo.
  - Verificación: `node scripts/tc-verify.mjs` → `VEREDICTO: PASS`; `npm test` → 0 fallos y el nº de pruebas ≥ la línea base de T1; `node scripts/tc-spec-lint.mjs --trace 003` → sin ⚠ ni ✖.
  - Cubre: REQ-19, REQ-20, AC-18, AC-19

## 4. Estrategia de validación
| Nivel | Qué | Comando / evidencia |
|---|---|---|
| L1 Estático | lint, tipos, secretos, coherencia de specs | `node scripts/tc-verify.mjs --fast` tras cada tarea; `node scripts/tc-spec-lint.mjs 003` |
| L2 Unitario | `ficha`, `letters`, `count-up`, `lab-preview`, tokens y contraste (tabla §2), CSS (`design-css.test.ts`), guardas de texto fuente (`design-guards.test.ts`), diccionarios idénticos | `npm test` |
| L3 Integración / contrato | `next build` estático de `/en` y `/es`, presupuesto de JS, diccionarios y datos intactos | `npm run build` (≤ 126 kB First Load JS de `/[lang]`; línea base 116 kB); `git diff origin/master -- src/content/facts.ts package.json` vacío |
| L4 E2E en Chrome (arnés) | Geometría, estilos computados, emulaciones (`prefers-reduced-motion`, `forced-colors`, JS desactivado, `hover: none`, zoom 200 %), CLS, traza de parallax, capas de textura sin texto, árbol de accesibilidad | `node scripts/visual-check.mjs --check=all --langs=en,es --widths=320,360,390,1024,1280` contra `next start -p 3400` |
| L5 Manual / operativo | Revisión visual de capturas, recorrido con teclado y lector de pantalla, Safari y Firefox (`animation-timeline`, `mix-blend-mode`, `clip-path`), composición del Hero y de Contact, papel arrugado, punteado y grano al sol | Humano; se registra en `validation.md` como pendiente si no se hace |

Mapa AC → evidencia principal: AC-1/2 T2 · AC-3 T9/T10/T14 · AC-4 T5/T10 · AC-5 T5/T15 · AC-6 T15/T18 · AC-7 T7/T8/T15 · AC-8 T3/T15 · AC-9 T6 · AC-10 T13/T15 · AC-11 T12/T15 · AC-12 T6/T11/T15 · AC-13 T6/T11 · AC-14 T6/T15/T18 · AC-15 T6/T12/T15 · AC-16 T11–T13 · AC-17 T11/T15/T18 · AC-18/19 T19 · AC-20 T17 · AC-21/23 T18 · AC-22 T15/T18.

## 5. Trazabilidad
`node scripts/tc-spec-lint.mjs --trace 003` debe mostrar cada REQ con al menos un AC y una tarea. **Excepción documentada:** AC-20 se interpreta según D-G.

**Aserciones de la 002 que se sustituyen (REQ-20/AC-19; ninguna se elimina sin sustituto):**
| Aserción de la 002 | Sustituto de la 003 | Tarea |
|---|---|---|
| `color-accent` = `#F29BB0` y `HEX.accent` | `#EE5583` en `@theme` y en la tabla | T2 |
| `TEXT_PAIRS` con 8,85 / 8,1 | tabla de contraste del contrato §2 (5,49 / 5,03 …) + pares prohibidos (`bone/accent`, `accent/bone`, `line/accent`) | T2 |
| «accent sobre bone ≈ 1,6:1» | `bone/accent` = `accent/bone` = 2,64 < 3 y fuera de la tabla | T2 |
| `forced-colors` oculta `.duo-sat, .duo-mul, .duo-lift` | ídem + `.duo-dots, .tex, .ornament`; `.torn-top` sin recorte | T5 |
| foco: solo `.inverted :focus-visible` | `.inverted` **y** `[data-block="accent"]` en carbon | T5 |
| «único bloque invertido» (comentario de `Projects.tsx` y check `inverted` del arnés) | `[data-block]` ≤ 2 y no consecutivos | T9, T14 |
| grano a 0,18 | grano ∈ [0,20; 0,30] (0,26) | T5 |
| `.rise` 360 ms / 60 ms | `LETTER_DURATION_MS` 200 / `LETTER_STEP_MS` 18 | T6 |
| reduced-motion: `.rise, .rule-x, .rule-y` | + `.parallax`; `.sticker`, `.lab-preview` | T6 |
| `ficha.test.ts`: `'EXP. 01'` … | `'[EXP. 01]'` … + `formatSectionFicha` | T3 |
| módulos del Lab (`bg-carbon-2`, `article`) en el arnés | filas `li[data-lab-row]` | T13, T14 |
| «tarjetas invertidas no usan text-accent/bone-2» | se mantiene y se amplía a Contact | T10 |

## 6. Despliegue y vuelta atrás
- **Naturaleza:** sitio estático (Next, Vercel). Sin base de datos, sin migraciones, sin flags ni variables nuevas.
- **Despliegue:** PR de `feat/003-poster-caracter` a `master` (lo hace `/tc-ship`) → despliegue de vista previa de Vercel → merge → producción. Ejecuta y aprueba la persona dueña (Jostin); no hay ventana de cambio.
- **Versión anterior:** `master` tras el merge de la 002 (`82506fa`), siempre disponible en Vercel («Promote» del despliegue anterior) o con `git revert -m 1 <merge de la 003>`.
- **Criterio de rollback:** contraste o lectura rota en producción, scroll horizontal en móvil, formulario de Contact sin enviar, o regresión de rendimiento visible. Respaldos parciales sin revertir todo: `--d-full: 0` (parallax), retirar `.tex-paper` (T16), `--cut: 0` (nombre sin recorte).
- **Sin impacto en datos:** no cambia `facts.ts`, EmailJS ni `/resume.pdf`.

## 7. Riesgos del plan
1. **El carácter ensucia la lectura o el contraste** (grano 0,26 y punteado sobre acento y carbon, acento más saturado). *Mitigación:* ninguna textura bajo texto por construcción (test de capas vacías + check `textures` que mide solapamientos); AC-6 muestreado en T18; si falla, se baja la opacidad de la textura, no el umbral.
2. **El primer viewport de 390×844 deja de caber** (fila superior de 76 px, pegatina, texto ES más largo) o la pegatina/ornamentos pisan texto a 320 px. *Mitigación:* `first-viewport` y `sticker` en T15 y mediciones de T18 con holgura estimada de ≈ 109 px; si no cabe se **para y se avisa** (no se improvisa otra composición).
3. **Rendimiento o compatibilidad del movimiento** (parallax scroll-driven sin soporte en Firefox, papel arrugado costoso en raster, contador/vista previa con CLS o tareas largas). *Mitigación:* respaldos del contrato (§6): estático sin soporte, `--d-full: 0`, descarte del papel, `min-width` fijo; traza a 360 px en T15/T18; presupuesto de 10 kB gzip con medición real en T18.
4. **Reescribir las pruebas de la 002 oculta una regresión.** *Mitigación:* tabla de sustituciones (§5) y auditoría del diff en T19; los tests de contenido y comportamiento no se tocan.

## 8. Definición de terminado
- [ ] Todas las tareas marcadas y `node scripts/tc-verify.mjs` en verde (evidencia en `.tc/last-verify.json`)
- [ ] Cada criterio de aceptación tiene evidencia en `validation.md` (gate + arnés + capturas)
- [ ] Sin TODO/debug residuales; docs actualizados (`DESIGN.md`, skill `portfolio`, README/arquitectura si aplica); sin ADR (D-A)
- [ ] `package.json` y `facts.ts` sin diff; `/[lang]` First Load JS ≤ 126 kB; CLS ≤ 0,1
- [ ] Gates manuales resueltos o anotados como pendientes humanos (recorrido con teclado y lector de pantalla, Safari/Firefox, aprobación de composición del Hero y de Contact, papel arrugado, miniatura vertical)

## 9. Divergencias durante la implementación
<!-- El implementador anota aquí todo desvío respecto al plan (qué, por qué, quién lo aprobó). -->

- **T1 (rojo del arnés):** con el arnés viejo fallaron `hero` y `lab`; `inverted` seguía en verde porque solo mide Projects. Renombrado a `blocks` (alias `inverted`).
- **T8/T4:** el test de `Ornaments.tsx` se escribió en la misma tanda que el componente (sin ver el rojo previo); la comprobación de que falla sin el archivo no se hizo.
- **T10:** la capa de punteado va dentro de un contenedor `absolute` (las utilidades de Tailwind pierden frente al CSS sin capa de `.tex`). Se añadió `md:pb-44` a Contact para que `RingMarks` (≥ 768 px) quede bajo el formulario y no solape texto. `Parallax` lleva `pointer-events-none`.
- **T11:** la pegatina lleva `border border-transparent` (forma visible en `forced-colors`, como el CTA).
- **T13:** `ProjectCard` del Lab conserva `className="duo-trigger"` (el arnés detectó que sin él el foco no devolvía el color a la imagen).
- **T14/T15:** además de lo previsto, el arnés cambia colores del acento en `focus`/`contact`; `textRects` recorta contra ancestros con `overflow` (Anton mide 1,5 em de contenido); el nombre accesible del `h1` se compara sin distinguir mayúsculas (text-transform). Nuevos checks extra: `raster` (T16) y `cut` (T18).
- **T16:** el papel arrugado entra (surfaceScale 9, elevación 32°, opacidad 0,35): se aprecia a 1280 y el raster máx. es 0,4 ms (<16 ms). Pendiente: aprobación humana de la composición.
- **T17:** además de lo listado se corrigieron `SKILL.md` (apuntaba al contrato 002) y `docs/architecture.md` (`SECTION_IDS` vive en `sections.ts`); README: línea de Framer Motion.
- **T18 `--cut`:** medido 0–0,4 % de la versal (≤ 12 %: cumple), pero con `.07em` el recorte cae casi todo bajo la línea base y **apenas se nota**; decisión humana si se quiere un recorte visible (≈ `.17em`).
- **Post-implementación (2026-10-29, feedback de la persona al verlo en dev):** (a) la foto del Hero ya no vuelve a color con hover/foco (`DuoImage fixed`), cambio sobre el contrato §3; (b) Contact: intro `text-lg font-medium` y etiquetas/ficha en `font-bold` para mejorar la lectura sobre el acento. Las animaciones «inexistentes» eran la preferencia del sistema operativo (animaciones desactivadas); no es un fallo. El rediseño de estructura (varias páginas, Hero, navegación, animación más elaborada) pasa a la spec 004.
