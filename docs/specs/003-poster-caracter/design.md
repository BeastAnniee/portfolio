---
type: design
spec: "[[specs/003-poster-caracter/spec]]"
surface: "/en y /es (src/app/[lang]/page.tsx y componentes: Hero, Marquee, Experience, Projects, Lab, Contact, SectionHeading) y tokens de src/app/globals.css; global-not-found.tsx solo hereda el token"
status: approved
---
<!-- Contrato de diseño 003 (/tc-design contrato). Reemplaza al de la 002 (que sigue siendo la base de lo que no se redefine aquí). Lo aprueba una persona; el agente no se auto-aprueba. Lecturas: spec 003, DESIGN.md, contrato 002, principios.md, new-work.md, el código actual (globals.css, page.tsx, componentes, facts.ts, diccionarios, tests de diseño) y las referencias img, img_5, img_12, img_18 (vocabulario, no plantilla). Contrastes de §2: medidos por la sesión principal, no recalculados aquí. Nada se midió en navegador: lo marcado «a medir» es pendiente. -->
# Contrato de diseño · 003-poster-caracter

## 0. Alcance y límites
- **Superficie(s):** `/en` y `/es` (Hero, Marquee, Experience, Projects, Lab, Contact, SectionHeading, `page.tsx`) y `globals.css`. `global-not-found.tsx` solo hereda el nuevo token `accent` (sin otro cambio).
- **Superficies protegidas:** sin cambios (N = 0). Se mantienen la forma de contacto (campos, validación, EmailJS), `/resume.pdf`, GitHub, LinkedIn y correo; ids de ancla, orden de secciones y rutas intactos (REQ-19).
- **Fuera de alcance:** textos de contenido y datos, EmailJS/`lib/contact.ts`, metadatos, comportamiento de «Now», degradados, sombras, `backdrop-*`, grano animado, tema claro, fuentes nuevas, dependencias, imágenes nuevas, parpadeo de retícula.
- **Fase posterior** (vistos y verificados en el código actual, no se corrigen aquí): `Header.tsx:78-83` (menú móvil con `hidden={!open}`: sin JS no hay navegación en < xl; el contenido sigue legible) · `ProjectCard.tsx:44` capturas con `alt=""` (se respeta también en la miniatura) · `global-not-found.tsx:23-24` un `h1` por idioma (dos `h1`) · `Education.tsx:36-44` idiomas como texto unido con « | » · `MotionProvider.tsx:3-7`, `layout.tsx:42` y `package.json:18` Framer Motion montado sin ningún componente animado (candidato a retiro con ADR; esta spec **no** lo usa) · `CopyEmailButton.tsx:46-52` una región `role="status"` por instancia (Hero y Footer: dos) · `design-css.test.ts:56` comentario que remite al contrato 002. Cerrados desde la 002 y fuera de lista: Particles/`ogl`, `404.png`, `story.pdf`.

## 1. Dirección y jerarquía
**Dirección:** el póster de la 002 con más ruido y un acento que ya se ve: rosa `#EE5583`, grano a 0,26 sobre las fotos, punteado, borde rasgado en Contacto, ornamentos monocromos, una pegatina y fichas `[EXP. 01]`. Lo memorable sigue siendo el nombre a escala de cartel; ahora recortado por abajo. **El carácter va en los márgenes, las fotos y el bloque de Contacto; la lectura (texto sobre `carbon` plano) no se toca.**
**Reglas de forma (sin cambio, §1 de la 002):** radios 16/12/8 px, línea 1 px `line` (carbón dentro del bloque de acento), sin sombras ni degradados ni `ring-*`, un nivel de marco. Se añade: los bloques invertidos se marcan `data-block="bone|accent"`.
**Bloques invertidos (REQ-3):** DOM actual `Hero · Marquee · Now · Experience · Projects(bone) · Stack · Achievements · Education · Lab · Contact(accent)`. Projects y Contact están separados por 4 secciones; total 2; ninguno adyacente (comprobable con `[data-block]` en orden del DOM).
| Pantalla | Orden y acción principal | Secundarias |
|---|---|---|
| Hero | fila superior (greeting + pegatina) → nombre (3 líneas móvil / 1 línea ≥ 42 rem) → cargo → **CTA «Check out my work»** → iconos → resumen → foto | pegatina `#contact`, GitHub, LinkedIn, copiar correo |
| Experience | filas `[EXP. 0n]`; cifras con cuenta | — |
| Projects (bone) | igual que la 002; fichas `[PROJ. 0n]` | «Open project» |
| Lab | filas `[LAB 0n]` (ya no módulos); botón plegable intacto | «Open project»; miniatura |
| Contact (accent, a sangre) | ficha → título → formulario; **acción: «Send message»** | mailto en error |
**Hero (REQ-18).** Se mantiene el marco de la 002 (`data-hero-frame`, borde `line`, radio 16, `overflow-x: clip`; ahora también `relative`).
- *Fila superior:* `min-h-[76px]`; greeting a la izquierda (`max-width: calc(100% - 10.5rem)`); **pegatina** (§5) a la derecha. No hay texto sobre la foto.
- *Nombre recortado:* `h1 { clip-path: inset(0 0 var(--cut) 0); margin-bottom: calc(var(--cut) * -1); --cut: .07em }`: el borde inferior del marco (la línea `rule-x`) se come ≈ 7 % del cuerpo (**a medir ≤ 12 % de la altura de versal** en NAVA a 390 y 1280; si la lectura falla, `--cut: 0`). Tamaños de la 002 sin cambio (`38cqi`; `13cqi` ≥ `@2xl`); no se sangra en horizontal salvo que la medición pruebe ≤ 98 % de la palabra más ancha.
- *Foto:* `.duo` con grano 0,26 y capa `duo-dots` (§4). Detrás, un rectángulo de puntos `bone` (`.tex-dots-bone`, desplazado 12 px abajo-derecha, 0,30; sin texto encima). Estrella y damero (§5) en las esquinas. Sello sin cambios.
- *Presupuesto 390×844:* la fila superior sube de ≈ 46 a 76 px; estimación (no medida) del borde inferior del CTA en ES ≈ 735 px, 109 px de holgura. **Se mide a mano:** con movimiento apagado, en EN y ES a 390×844 y a 320×568, los `getBoundingClientRect().bottom` de `h1`, cargo, CTA y pegatina ≤ 844 (≤ 568 en 320 solo se exige h1, cargo y pegatina) y sin `scrollY`.

## 2. Sistema a reutilizar
Tokens (`globals.css` `@theme`), `fonts.ts`, `lucide-react`, `.duo`/`.grain`/`.press`/`.rule-*`/`.marquee-*`/`.badge-spin`, patrón de foco, `formatFicha`, `SectionHeading` (su prop `ficha`, hoy sin uso, se usa). **Cambia un token:** `--color-accent: #F29BB0 → #EE5583` (único `color-accent*`). Confirmo `#EE5583` (coincide con la paleta de img_5); no se ajusta.
**Estructura de página (a sangre).** `main` pasa a `w-full pt-16` (sin `max-w-7xl` ni `px`). `page.tsx` envuelve Hero…Lab en `<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">` y deja **Contact fuera**, a ancho completo. Contact conserva `<section id="contact" aria-labelledby>` dentro de `main`; su contenido va en un div con la misma anchura (`max-w-2xl` interior). No se usa `100vw` ni `overflow-x: hidden` global: la sangre es estructural y `scrollWidth` no puede exceder el viewport. Solo `overflow-x: clip` en Hero y en Contact (para los ornamentos).
**Pares texto/fondo realmente usados (alimenta AC-2; ratios medidos por la sesión principal):**
| Par | Ratio | Umbral | Uso |
|---|---|---|---|
| bone / carbon · bone / carbon-2 | 14,52 · 13,29 | 4,5 | texto; campos y botón de Contact (fondo carbon) |
| bone-2 / carbon · bone-2 / carbon-2 | 7,33 · 6,71 | 4,5 | microtexto mono ≥ 12 px, fichas, placeholders sobre carbon |
| accent / carbon · accent / carbon-2 | 5,49 · 5,03 | 4,5 | h2, cargo, enlaces, glifos del sello, cifras, viñetas |
| carbon / accent | 5,49 | 4,5 | **todo el texto del bloque de acento**, CTA, pegatina, cabecera CV |
| carbon / bone | 14,52 | 4,5 | bloque Projects; botón y campo en error dentro del bloque de acento |
| line / carbon · line / carbon-2 | 4,07 · 3,72 | 3 | marcos y bordes (fuera del bloque de acento) |
| accent / carbon (foco global) · carbon / accent (foco en acento) | 5,49 · 5,49 | 3 | `outline` 2 px; borde de error 2 px carbon sobre acento |
**PROHIBIDOS como texto o borde informativo:** bone / accent 2,64 · accent / bone 2,64 · line / accent 1,35 (bordes y separadores del bloque de acento: `carbon`) · bone-2 / bone 1,98 · bone-2 y line sobre accent (no medidos, no se usan). Hover de CTA/pegatina/botón pasa a fondo `bone` con texto `carbon` (14,52): vale, el texto nunca es bone sobre accent.
**Topes de textura medidos (REQ-6):** grano `overlay` 0,20/0,25/0,30 → carbon sobre accent 4,87/4,74/4,61 (pasa con margen fino) · bone sobre carbon ≥ 13,7 · bone-2 ≥ 6,9 · accent sobre carbon-2 4,70/4,61/4,53 (**sin texto accent pequeño sobre carbon-2 bajo grano**). Puntos bone sobre carbon: 0,06 → bone 12,77 / bone-2 6,45 / accent 4,83; 0,10 → accent 4,35 FALLA. Puntos carbon sobre accent: 0,06 → 4,98; 0,10 → 4,65; 0,15 → 4,27 FALLA. **Regla del contrato:** bajo texto accent ≤ 0,06; bajo texto carbon sobre accent ≤ 0,10; mayor intensidad solo donde no hay texto. **Decisión: ninguna textura queda debajo de texto.** Las capas de textura son nodos vacíos; un test lo exige (sin hijos de texto). Grano solo en `.duo` (fotos y capturas); sello y pegatina llevan fondo plano.
**Tipografía y escala:** sin cambio (Anton, Work Sans, IBM Plex Mono; micro 12 px, cuerpo 16 px, h3 24 px, h2 `clamp(2.5rem,8cqi,4.5rem)`).
**Selección de texto:** global `::selection` sigue accent/carbon (5,49). En `[data-block="accent"]`: `::selection { background: var(--color-carbon); color: var(--color-bone) }` (14,52, plano). **Foco:** `:focus-visible` accent global; `.inverted` y `[data-block="accent"]` → `outline-color: carbon`; `forced-colors` → `Highlight`.

## 3. Estados
| Estado | Qué ve la persona | Notas |
|---|---|---|
| Cargando | Contact: botón `bg-carbon text-bone` con `Loader` + «Sending…» (sin `opacity-50`: el texto atenuado sobre acento no se lee); `role="status"` sr-only. Fuente/imagen: como la 002; miniatura sin cargar = marco 16:9 `carbon-2` con borde `line` | Contadores: cifra final desde el HTML, nunca «0» |
| Vacío | Experience `experience.empty`; Lab/Projects vacíos no se renderizan; miniatura: los proyectos sin imagen no tienen ninguna | Igual que la 002 |
| Error | Campo: `bg-bone text-carbon border-2 border-carbon` + `CircleAlert` carbon + texto carbon (5,49), placeholder `carbon`; foco al primer error (existe). Fallo de envío: `role="alert"`, `bg-bone text-carbon border-2 border-carbon`, icono, texto, `mailto` carbon subrayado | Icono + texto + cambio de relleno, no solo color. Nunca `border-accent` dentro del bloque |
| Éxito | `role="status"`, `bg-carbon text-bone border-2 border-carbon` + `CircleCheck` + `contact.success` (14,52). Copiar correo: aviso bone/carbon con `border-carbon` (visible sobre el bloque) | n/a: el texto `contact.success` ya comunica el éxito sin depender del color |
| Dato viejo (Now) | Sin cambio (`updatedAt`, «Last updated» > 90 días, `Clock`) | Now no usa textura ni acento nuevo |
| JS desactivado | Titular completo (`sr-only` + letras visibles), cifras finales, **imágenes de Lab visibles en la fila**, pegatina con enlace, parallax estático, todo legible | AC-16 |
| `forced-colors` | `.tex`, `.duo-dots`, `.duo-sat/-mul/-lift` y `.ornament` en `display: none`; `.torn-top { clip-path: none; border-top: 2px solid CanvasText }`; foco `Highlight`; campos con borde real | AC-5 |
Campos de Contact (normal): `bg-carbon text-bone border border-carbon`, placeholder `bone-2` (7,33), etiquetas mono 12 px carbon. Hover de campo: sin cambio.

## 4. Uso real
- **Entrada:** objetivos ≥ 44 px (pegatina 48 de alto, botón de envío 48, campos `min-h-11`, «Open project» `min-h-11`); separación ≥ 8 px. Orden de foco = DOM: Header → pegatina (va justo tras el `h1`) → CTA → iconos → … → filas de Lab (enlace «Open project», que dispara la miniatura) → Contact. El foco no cae sobre texturas, ornamentos ni miniatura (`pointer-events: none`, no focusables).
- **Legibilidad:** contraste de §2; ES absorbido con `break-words`, `min-w-0`, filas apiladas. A 320 px y zoom 200 %: la fila superior del Hero cabe (EN: pegatina ≈ 160 px a x 110-270; ES ≈ 118 px; greeting ≤ 94 px), el título de Contact respeta `pr-16` bajo 640 px para no pisar la estrella (56 px). Sin información solo por color ni solo por textura.
**Carga de información (todo lo nuevo, clasificado):**
| Se muestra | Se difiere | Se elimina | Por qué |
|---|---|---|---|
| Pegatina «Get in touch»/«Escríbeme» (enlace `#contact`, = «enlace de contacto» de REQ-18) | — | — | Garantiza el contacto en el primer viewport en móvil, donde el menú está cerrado |
| Fichas `[EXP. 01]`… y de sección `[03]` (índice real) | Fichas en «Now» y en Stack (no hay índice ni clave) | — | Ritmo de catálogo; sin cifras nuevas |
| Cifras que cuentan (4 de `facts.ts`) | Conteos derivados (nº de proyectos, años): **no se muestran**; añadirían números sin decisión asociada (pregunta §7) | — | — |
| Miniatura de Lab (2 de 8 filas) | Imagen en color pleno solo con cursor | Módulos del Lab (pasan a filas) | Filas escaneables; la imagen sigue visible sin hover |
| Textura, ornamentos | Rejilla (no se dibuja) | tarjetas del Lab, `disabled:opacity-50` | Decoración en márgenes, 0 información |
**Microtexto nuevo (claves idénticas en `en` y `es`; todo lo demás reutiliza claves existentes):**
| Clave | EN | ES |
|---|---|---|
| `sticker.label` | Get in touch | Escríbeme |
**Fichas (REQ-9):** `formatFicha(label, index)` devuelve `[` + `label NN` + `]`, con `NN = index + 1` a 2 dígitos del dato en `facts.ts`; sin claves nuevas. Elemento: `[EXP. 01]` · `[PROJ. 01]` / `[PROY. 01]` · `[LAB 08]` · `[ACH. 06]` / `[LOGRO 06]` · `[EDU. 03]` (Achievements: `[ACH. 01] · 2021 – 2023`). Sección (`SectionHeading ficha`): `[NN]` con `NN = SECTION_IDS.indexOf(id) + 1` (`now` 02 … `contact` 09), mono 12 px (`bone-2` sobre carbon, `carbon` sobre bone/accent); en Contact: `[09] ` + `contact.badge`. AC-8 comprueba `^\[.+ \d{2}\]$` y que el número coincide con el índice.

## 5. Qué no se inventa
Ni cifras, ni capturas, ni logos, ni textos fuera de `sticker.label`. Sin imágenes para los 6 proyectos sin captura (no hay marcador de posición). Contadores solo de `facts.ts`: se animan `17`, `3` y `6` (regla estricta `^\d+$`); **no** se anima `40→100 %` (relación antes/después: contarlo mostraría valores intermedios falsos) ni nada con `[CONFIRMAR]`. Sin texto gigante duplicado como decoración (el nombre es el `h1`). Sin `alt` nuevo (miniatura `alt=""`, el contenido está en la fila).
**Ornamentos (REQ-7).** Componentes SVG inline en `src/components/Ornaments.tsx`: `viewBox`, `aria-hidden="true"`, `focusable="false"`, sin `<text>`, sin `id`, un color (`currentColor`), `pointer-events: none`, `.ornament`. Entre `<div class="parallax">` (transform animado) y el `<svg>` (rotación estática): un solo transform por nodo.
| Ornamento | Dónde | Tamaño | Color | Parallax |
|---|---|---|---|---|
| `Star4` (`M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z`) | Hero: esquina superior izquierda de la foto (−14 px) | 28 px | accent | sí, ±16 px |
| `Star4` | Contact: arriba a la derecha | 56 px (< 640) / 112 px | carbon | sí, ±20 px |
| `Checker` (2 filas × 6 casillas de 12 px, `<rect>`) | Hero: esquina superior derecha de la foto (−8 px) | 72 × 24 | bone | no |
| `RingMarks` (círculo r 44 + 12 marcas, trazo 1,5) | Contact: abajo a la derecha, solo ≥ 768 px | 140 px | carbon | sí, ±12 px |
**Pegatina (REQ-8/14).** Es un enlace de verdad: `<a href="#contact" class="sticker">` con el texto `sticker.label` visible + `ArrowDown` 16 px `aria-hidden`, 48 de alto, `bg-accent text-carbon`, mono 12 px, radio 8, sin `aria-hidden`. Posición `absolute right-4 top-4` (`@2xl:right-6`) dentro del marco: no solapa el nombre (fila de 76 px) ni la foto. Base `rotate(-6deg)`; hover (solo `hover: hover`) y `:focus-visible` → `rotate(-12deg)` (+6° ≤ 8°; total 12° ≤ 16°) y fondo `bone` instantáneo. Foco: `outline` accent 2 px, desfase 3 px (sobre carbon, 5,49). Sin `.press` (un solo transform).
**Texturas (REQ-5), sin ráster nuevo y sin degradados.** Todas `aria-hidden`, `pointer-events: none`, `z-index` bajo el texto, sin `animation`, `display: none` en `forced-colors`:
| Textura | Técnica | Dónde | Opacidad máx. |
|---|---|---|---|
| Grano | `.grain` actual (SVG `feTurbulence` en data-URI, `overlay`) | `.duo` (foto del Hero, capturas) | **0,26** (de 0,18) |
| Punteado (halftone) | data-URI SVG de un tile 8 px con `<circle>`; `.tex-dots-bone` (puntos `#E9E4D8`), `.tex-dots-carbon` (`#141414`); **sin** `radial-gradient` | `duo-dots` sobre la foto (carbon, `multiply`, sin texto) 0,35 · rectángulo desplazado tras la foto (bone) 0,30 · zona derecha de Contact ≥ 1024 px (carbon) 0,20 | los de §2 si algún día hay texto encima |
| Borde rasgado | `clip-path: polygon()` fijo en `.torn-top`: `0 6px,4% 1px,8% 8px,12% 3px,16% 9px,20% 2px,24% 7px,28% 0,32% 8px,36% 4px,40% 10px,44% 1px,48% 6px,52% 2px,56% 9px,60% 3px,64% 8px,68% 0,72% 7px,76% 4px,80% 10px,84% 2px,88% 6px,92% 1px,96% 8px,100% 3px,100% 100%,0 100%` | borde superior del bloque Contact (relleno superior ≥ 80 px, así el foco no se recorta) | n/a (forma) |
| Damero | `Checker` SVG (arriba) | Hero | n/a |
| Papel arrugado | Filtro SVG `feTurbulence` + `feDiffuseLighting` (luz distante) en data-URI, `multiply` | **solo** zona derecha de Contact ≥ 1024 px, sin texto | 0,35 |
**Papel arrugado: condicional.** No es un degradado ni un ráster, pero es sombreado simulado y puede costar raster en móvil. Se prueba con captura y traza; se descarta (no se sustituye por degradado) si no se ve a 1280 o si el raster supera 16 ms. Es la única textura con riesgo; el resto se considera honesta. Fuera de Contact y Hero no hay más texturas.

## 6. Movimiento
Catálogo de la 002 sin cambio (`rule-*`, capas duotono, press, chevron, aviso, sello, marquee, spinner) más lo siguiente. **Fuente única por nodo; Framer Motion no se usa** (NF-1: solo se añaden ≈ 2 kB de JS propio; sin `LazyMotion`, `useScroll` ni `m`). Solo `transform`/`opacity`; sin `transition: all`.
| Comportamiento | Nodo | Fuente y detalle | Reduced-motion · sin hover · teclado · sin JS |
|---|---|---|---|
| Letras escalonadas (hero) | cada letra del `h1` (`.rise`, sustituye el rise por palabra) | CSS: `translateY(105%)→0`, **200 ms**, `animation-delay: calc(var(--i) * 18ms)` con `--i` = índice de letra en el nombre (17 letras → fin ≤ 488 ms), `backwards`. Máscara por palabra. `h1` = `<span class="sr-only">Jostin Aldair Nava</span>` + letras en `aria-hidden` (una sola cadena para lectores; sin ñ ni acentos en el nombre; el kerning entre letras `inline-block` se pierde, **a medir** en captura) | Reduced: `animation: none`, nombre completo. Sin JS: idéntico (solo CSS). Los h2 de sección **no** se escalonan (no están a la vista al cargar; animarlos exigiría JS de observación sin beneficio) |
| Pegatina | `.sticker` | CSS `transition: transform 150ms ease-out`; `--r: -6deg → -12deg` | Reduced: sin transición y sin giro (`--r` fijo -6). Sin hover: base. Teclado: gira con `:focus-visible`. Sin JS: igual |
| Contadores | `<CountUp value>` (cliente) en `dd` de Experience | JS: `IntersectionObserver` (umbral 0,4), `requestAnimationFrame`, **500 ms** ease-out cúbica, **una vez**; escribe solo el texto de un `span aria-hidden`; el valor final también está en un `span.sr-only` y en el HTML servido. Antes de contar fija `min-width` con el ancho final (CLS 0) | Reduced o sin `IntersectionObserver`: no anima, cifra final. Sin JS: cifra final. Solo `^\d+$` |
| Vista previa en fila (Lab) | `.lab-preview` (1 contenedor, `aria-hidden`, dentro del panel `hidden`) con 1 `Image` por proyecto con imagen | JS escribe **solo** el `translateY` objetivo (clamp dentro de la lista); CSS anima: `transform 120ms ease-out`, `opacity 150ms`. Se activa (`data-preview` en la lista) solo con `(hover: hover)` **y** sin reduced-motion; y se muestra en la columna derecha de 15 rem (contenedor ≥ 48 rem). Cursor: sigue en vertical (`pointermove` sobre la lista). Foco: `focusin` en la fila ancla la miniatura a su borde superior | Con `data-preview` la imagen en línea (`.lab-inline`) se oculta; **sin hover, con reduced-motion, bajo 48 rem o sin JS la imagen está en la fila** (`.duo` 16:9, máx. 20 rem, sin duplicar). Proyectos sin imagen: nada |
| Parallax | `div.parallax` de Star4 (×2) y RingMarks | CSS: `@keyframes drift { from { transform: translateY(calc(var(--d) * -1)) } to { transform: translateY(var(--d)) } }`; `animation: drift linear both; animation-timeline: view()` dentro de `@supports (animation-timeline: view())`. `--d`: 16 / 20 / 12 px (≥ 768) y la mitad bajo 768 px. Sin JS, sin listeners, en el compositor → 0 tareas largas atribuibles | Reduced: `animation: none`. Sin soporte (Firefox sin la función): estático, es decoración. Táctil/teclado: igual. Se apaga bajo 768 px (`--d: 0`) solo si la traza a 360 px muestra tareas > 50 ms |
**Recomendación y riesgo.** Parallax con scroll-driven CSS (riesgo: Safari ≥ 26 y Chrome sí; Firefox no, queda estático); contador con IO + rAF propio (riesgo: ≈ 0,5 kB, texto cambiante leído por lector: mitigado con `aria-hidden` en lo animado). Alternativa descartada: `useScroll`/`useInView` de Framer (el plan debe medir su coste con `next build`; aquí no hace falta). Alternativa descartada para contar: `@property` + `counter()` (anima una propiedad que no es transform/opacity).
**`prefers-reduced-motion` (se añade al bloque actual):** `.rise, .parallax { animation: none }`; `.sticker { transition: none }` y su `:hover/:focus-visible` conserva `--r: -6deg`; `.lab-preview` fuera de juego (JS no activa `data-preview`); contadores en estático. El sello y el marquee siguen como en la 002. Ningún destello > 3/s.
**Tests (REQ-20, sustituyen aserciones, no las quitan):** hex `#EE5583` y tabla de §2; duraciones: `.rise` 200 ms/18 ms (antes 360/60), `.sticker` 150 ms, `--cut`; «único bloque invertido» → `[data-block]` ≤ 2 y no consecutivos; grano 0,26 ∈ [0,20; 0,30]; `design-guards`: `text-(accent|bone-2)` prohibido también en Contact; `gradient(`, `shadow`, `transition: all`, `ogl` siguen vetados.

## 7. Conflictos con el proyecto
- **Degradados de las referencias** (resplandor MNLTH, velo de OUTLINE, esfera de Venus) vs. la regla «sin degradados»: gana el proyecto; el efecto se hace con color plano, duotono, grano y punteado SVG. Los puntos **no** usan `radial-gradient`.
- **Fuentes rúnicas de MNLTH:** descartadas (ñ/acentos del ES).
- **REQ-11 «sigue al cursor» vs. «no cubre texto»:** no pueden cumplirse a la vez con una miniatura que cuelga del puntero. Decisión: sigue al cursor **solo en vertical**, dentro de una columna derecha reservada. La persona debe aprobarlo.
- **REQ-18 «enlace de contacto»** es ambiguo (hoy el Hero no tiene ningún enlace a `#contact`; el menú está cerrado en móvil). Decisión: la pegatina cumple ese papel; el botón de copiar correo cuenta como apoyo.
- **REQ-10 «solo `transform` y `opacity`» vs. contadores:** un contador cambia texto, no una propiedad animada; DESIGN.md §6 lo incluye en el catálogo. Se declara como interpretación.
- **Papel arrugado:** sombreado simulado con filtro SVG; se interpreta como textura (no como `box-shadow`/elevación). Condicional (§5).
- **REQ-9/REQ-1 vs. documentos de la 002:** `#F29BB0` y «lavado» siguen en `globals.css`, `design-css.test.ts` y docs de la 002 (históricos: no se reescriben; AC-20 se limita a los listados en REQ-21).
- **DESIGN.md §6 lista «parpadeo único de retícula»** como efecto existente; no existe en el código y la 002 §2 lo excluyó. **La 003 no lo diseña.** Conviene quitarlo de DESIGN.md (REQ-21), que aquí no se edita.
- **REQ-5/REQ-6:** como ninguna textura queda bajo texto, AC-6 se cumple por construcción; se mide igualmente (§8).
- **Parallax en móvil:** activo con ±½ amplitud; se apaga bajo 768 px solo si la traza lo exige (REQ-15).
- **Pregunta abierta:** ¿se muestran conteos derivados (nº de proyectos, años)? Se difieren por falta de decisión asociada.

## 8. Criterio de terminado visual
- **Pantallas × anchos × idiomas:** `/en` y `/es` a 320, 360, 390, 1024 y 1280: Hero (fila superior, nombre recortado, foto con punteado), Experience (cifras antes/después de contar), Projects, Lab plegado y abierto (con y sin `data-preview`; con foco en la fila de imagen), Contact completo (reposo, error de campo, enviando, éxito, fallo) y menú móvil. 404: solo una captura del nuevo acento.
- **Emulaciones:** `prefers-reduced-motion` · `forced-colors: active` · JS desactivado · `hover: none`/táctil · zoom 200 % y reflow a 320 px · red bloqueada (fuentes, imágenes).
- **Mediciones ligadas a la spec:** AC-1/AC-2 con test de contraste sobre la tabla de §2 (ratios y hex de `@theme`); AC-3 con estilo computado de `[data-block]` y orden del DOM; AC-5 con opacidades del CSS y emulación; **AC-6** muestreando el fondo bajo cada texto de Contact y del Hero a 390 y 1280 (y comprobando que `.tex` no tiene hijos de texto); AC-7 con `getBoundingClientRect` de pegatina y ornamentos frente a texto y controles a 320-1280; AC-8 con `formatFicha`; AC-9/AC-12/AC-13 con estilos computados y árbol de accesibilidad (`h1` = una cadena); AC-11 con IO y valores de `facts.ts`; AC-10 con emulación hover/táctil y teclado; AC-14 con traza a 360 px; AC-16 con JS off; **AC-17 (REQ-18): a mano, a 390×844, EN y ES, movimiento apagado: `bottom` de `h1`, cargo, CTA y pegatina ≤ 844**; AC-21 comparando `next build` con `master` (≤ +10 kB gzip; esperado ≈ +2 kB) y CLS ≤ 0,1; AC-22 objetivos ≥ 44 px y `scrollWidth` ≤ viewport.
- **Evidencia:** capturas en `docs/specs/003-poster-caracter/screens/<pantalla>-<ancho>-<idioma>-<estado>.png`. «Inspección en navegador no realizada» queda como pendiente.
- **Pendientes humanos:** aprobar la composición del Hero (recorte del nombre, pegatina), Contact como bloque de acento y su borde rasgado; la decisión sobre la miniatura vertical; si el papel arrugado entra; no animar `40→100 %`; recorrido con teclado, lector de pantalla, Safari y Firefox (scroll-driven, `mix-blend-mode`, `clip-path`); revisar a ojo el punteado y el grano sobre las fotos al sol.
