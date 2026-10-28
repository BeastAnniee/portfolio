---
type: design
spec: "[[specs/002-poster-visual/spec]]"
surface: "/en y /es (src/app/[lang]/page.tsx y componentes), src/app/not-found.tsx"
status: approved
---
<!-- Contrato de diseño 002 (/tc-design contrato). Lo aprueba una persona; el agente no se auto-aprueba. Lecturas: spec 002, DESIGN.md, principios.md, new-work.md y el código actual; la imagen profile.jpg se vio directamente. Contrastes WCAG calculados por la sesión principal (no recalculados aquí). -->
# Contrato de diseño · 002-poster-visual

## 0. Alcance y límites
- **Superficie(s):** `/en`, `/es` (Header, Hero, marquee, Now, Experience, Projects, Stack, Achievements, Education, Lab, Contact, Footer) y `not-found.tsx` (404 bilingüe).
- **Superficies protegidas:** sin cambios (N = 0, DESIGN.md §5). Se mantienen la forma de contacto, `/resume.pdf` y los enlaces GitHub, LinkedIn (`linkedin.com/in/aldair-nava-dev`) y correo; ids de ancla y orden de secciones de la 001 intactos (REQ-22).
- **Fuera de alcance:** textos de contenido, datos, rutas, metadatos, EmailJS/validación/`lib/*`, parpadeo de retícula, grano animado, tema claro, `resume.pdf`, dependencias nuevas.
- **Fase posterior** (no se corrige aquí): `Header.tsx:89-94` el menú móvil depende de JS (con JS apagado en móvil no hay navegación; el contenido sigue legible); `ProjectCard.tsx:25` capturas con `alt=""` (se respeta, REQ-8; inconsistente con REQ-8 «conservar alt»); `not-found.tsx:21` dos `h1` (uno por idioma); `Education.tsx:23-28` idiomas como texto unido con « | » en vez de lista; `framer-motion` queda sin uso tras este contrato (ver §6: candidato a retiro con ADR); `Particles.tsx`/`ogl`, `404.png`, `story.pdf` ya cubiertos (ADR 0001, REQ-20).

## 1. Dirección y jerarquía
**Dirección:** cartel impreso desgastado, oscuro, un solo acento. Lo memorable: el nombre a escala de cartel (Anton, mayúsculas) sobre el marco del hero y, debajo, la foto en duotono con el sello. Todo lo demás: filas escaneables, microtexto mono tipo ficha, líneas finas.
**Regla de forma:** radio 16 px en marcos de sección/hero, 12 px en módulos y controles, 8 px en chips; línea 1 px (`line`) salvo error (2 px). Sin `box-shadow`, `drop-shadow`, `ring-*` ni degradados. Máximo un nivel de marco con borde: un módulo nunca contiene otro marco (chips y botones son controles, no tarjetas). Sin `overflow-x-hidden` en el contenedor de página (taparía el desborde que mide AC-5); solo `overflow-x: clip` dentro del marco del hero.
**Bloque invertido (REQ-4):** solo **Projects** (spotlight) en `bone`/`carbon`. No hay segunda: una sola isla clara conserva el énfasis. Texto en carbón, sin acento ni gris; separadores carbón.
**Orden de lectura en móvil 390 px y acción principal por pantalla:**
| Pantalla | Orden | Acción principal | Secundarias |
|---|---|---|---|
| Header | marca, menú (44 × 44); panel: enlaces, CV, idioma | abrir menú | CV, idioma |
| Hero | microtexto `greeting` → nombre (3 líneas) → título/qualifier (accent, 20 px) → CTA → iconos → resumen → foto 3:2 + sello (orden móvil vigente tras design-review #1; en escritorio la foto va en la columna derecha) | «Check out my work» → `#projects` (relleno accent, texto carbón, alto 48) | GitHub, LinkedIn, copiar correo (44 × 44, borde `line`); CV vive en Header |
| Marquee | cinta 48 px bajo el hero | pausar (control) | — |
| Now | fecha/estado, 2 módulos, «Open to» | ninguna (lectura); enlace Archive es secundario | — |
| Experience | filas `EXP. 0n` separadas por línea | ninguna (lectura) | — |
| Projects (invertido) | 2 columnas con línea carbón; mobile apiladas | «Open project» por proyecto (subrayado, 44 px) | — |
| Stack, Achievements, Education | filas/columnas con línea, sin módulos | ninguna | — |
| Lab | intro → botón plegable (línea, 48 px) → módulos carbon-2 con borde | desplegar | «Open project» |
| Contact | label (h2 mono) → título Anton → formulario alineado a la izquierda | «Send message» (relleno accent) | enlace mailto en error |
| Footer | iconos, `builtBy` mono | — | — |
| 404 | «404» Anton accent, bloque EN y bloque ES | un enlace por idioma (accent EN, borde ES, 48 px) | — |

**Hero, composición (REQ-7).** El marco (`container-type: inline-size`, borde `line`, radio 16, `overflow-x: clip`) contiene el `h1` «Jostin Aldair Nava» como texto del DOM (palabras en `span` separados por espacios reales; mayúsculas con `text-transform`, no en el DOM).
- Contenedor < 42 rem (`@2xl`): una palabra por línea, `font-size: 30cqi`, `line-height: .86`, `white-space: nowrap`. Anchura de las tres palabras = **a medir**; criterio: cada palabra ≤ 100 % del ancho útil a 320, 360, 390 y 640 px (sin recorte de letras). Si JOSTIN/ALDAIR no llenan el ancho, subir `cqi` hasta 98 % medido, sin pasar.
- Contenedor ≥ 42 rem: una línea, `font-size: 9.2cqi` (a medir, mismo criterio). Debajo, rejilla 12 col: título, CTA, iconos y resumen en 7 col; foto 4:5 en 5 col.
- «Cortado por el marco»: el nombre toca los bordes izquierdo y derecho del marco (sin aire lateral) y el marco recorta con `overflow: hidden` en la máscara del titular. Las letras nunca se recortan por arriba o abajo (relleno de máscara .06em). **Decisión a aprobar por la persona** (riesgo de legibilidad del spec §7).
- Foto: `profile.jpg` (vertical, rostro al centro, a ~47 % x, ~40 % y; el jersey tiene texto «NEW YORK» en la parte baja). Móvil `aspect-ratio: 3/2` con `object-position: 50% 46%`; escritorio 4:5. El encuadre móvil deja fuera el texto del jersey (verificar en captura). `hero.photoAlt` intacto.

## 2. Sistema a reutilizar
Se reutilizan: Tailwind 4 `@theme` en `src/app/globals.css`, `next/font/google` en `src/app/fonts.ts`, `lucide-react`, la estructura `src/components/*`, `MotionProvider`, y el patrón de foco. **Se retiran** los 9 tokens `--color-bento-*` y las clases `bento-*`.
**Tokens en `@theme` (exactos):**
| Token | Valor | Uso |
|---|---|---|
| `carbon` | #141414 | fondo base |
| `carbon-2` | #1D1D1D | módulos (Now, Lab, campos) |
| `bone` | #E9E4D8 | texto principal; fondo del bloque invertido |
| `accent` | #F29BB0 | único acento: títulos clave, sello, enlaces, CTA, foco, error |
| `bone-2` | #A8A398 | solo microtexto mono ≥ 12 px y placeholders; nunca cuerpo |
| `line` | #7A766D | marcos, bordes de control, separadores, chips |
| `--font-display/-body/-mono` | ver §2 tipografía | tres roles |
Acento: exactamente uno (AC-3). `bone-2` y `line` son neutros, no acentos.
**Pares texto/fondo realmente usados (alimenta AC-2):**
| Par | Ratio | Umbral | Uso |
|---|---|---|---|
| bone / carbon | 14,52 | 4,5 | texto principal |
| bone / carbon-2 | 13,29 | 4,5 | texto en módulos, campos |
| accent / carbon | 8,85 | 4,5 | h2, qualifier, enlaces, sello, foco |
| accent / carbon-2 | 8,10 | 4,5 | enlaces, icono de error en módulos |
| bone-2 / carbon | 7,33 | 4,5 | microtexto mono, placeholders |
| bone-2 / carbon-2 | 6,71 | 4,5 | microtexto en módulos |
| carbon / bone | 14,52 | 4,5 | todo el bloque invertido, foco en él |
| carbon / accent | 8,85 | 4,5 | texto del CTA, envío, idioma activo |
| line / carbon | 4,07 | 3 | marcos, bordes de botón/campo, chips |
| line / carbon-2 | 3,72 | 3 | bordes en módulos y campos |
| accent / carbon, accent / carbon-2 | 8,85 / 8,10 | 3 | indicador de foco, borde de error |
| **accent / bone** | 1,64 | — | **PROHIBIDO como texto** (REQ-2) |
**Sin medir:** el centro del sello usa carbon sobre accent (ya medido). Ningún valor distinto de los listados.
**Estados:** error = borde 2 px `accent` + `CircleAlert` + texto `bone`; éxito = borde 1 px `bone` + `CircleCheck` + texto; cargando = `Loader` + texto (sin tercer color).
**Tipografía (`fonts.ts`, tres roles, sustituyen Inter y Bricolage):**
| Rol | Fuente | Pesos | Respaldo |
|---|---|---|---|
| Display | Anton (solo 400; `font-synthesis: none`) | 400 | `Impact, 'Arial Narrow', sans-serif` |
| Cuerpo | Work Sans | 400, 600 | `system-ui, sans-serif` |
| Micro | IBM Plex Mono | 400, 500 | `ui-monospace, 'Courier New', monospace` |
Subconjunto `latin` (cubre á é í ó ú ü ñ ¿ ¡ « » — – • ·); `display: swap`; se deja `adjustFontFallback` por defecto. **A medir:** `→` (U+2192, «40→100 %») no está en `latin` y caerá al respaldo; aceptado, a verificar en AC-4.
**Escala (5 tamaños + nombre):** micro 12 px (mono, mayúsculas, tracking .12em) · cuerpo 16 px (interlineado 1,55, `max-width: 65ch`) · destacado 20 px · h3 24 px (Anton) · h2 `clamp(2.5rem, 8cqi, 4.5rem)` (Anton) · nombre del hero en `cqi` (§1). Nada < 12 px.

## 3. Estados
| Estado | Qué ve la persona | Notas (texto además de color, recuperación) |
|---|---|---|
| Cargando (Contact) | Botón «Sending…» con spinner (`Loader`, giro CSS, `motion-reduce:animate-none`) y línea `role="status"` con icono + texto | Botón deshabilitado, no se pierde lo escrito |
| Cargando (fuente/imagen) | Fuente: respaldo con métricas ajustadas, sin desborde (`nowrap` + clip del marco). Imagen: marco `aspect-ratio` con borde `line` y fondo carbon-2, `alt` conservado | Sin desplazar el diseño (REQ-19) |
| Vacío | Experience: mensaje `experience.empty` en bone, en fila con línea. Sin datos en otra sección: no se renderiza el módulo | Ya existe; solo estilos |
| Error | Contact: campo con borde 2 px accent + `CircleAlert` + texto de `errors.*`; foco al primer error (existe). Fallo de envío: `role="alert"` con borde 2 px accent, icono, texto y `mailto` accent subrayado | Recuperación: reintentar o correo directo |
| Éxito | Borde 1 px bone + `CircleCheck` + `contact.success`. Copiar correo: aviso fijo bone/carbon, fade 250 ms | `role="status"` |
| Dato viejo (Now) | `nowStatus` > 90 días: etiqueta «Last updated»/«Última actualización» + `Clock` + fecha en `<time>`; vigente: «Updated»/«Actualizado». Contenido sin atenuar | Sin JS o antes de hidratar se pinta el estado seguro («Last updated»). Fecha inválida: `dateUnavailable` |
| JS desactivado | Todo el contenido visible (REQ-15): animaciones de entrada son **solo CSS** con `animation-fill-mode: backwards` (estado base = final), sin `initial` de Framer. Marquee estático con `<noscript><style>` (sin botón no hay movimiento) | AC-13 |
| `forced-colors: active` | Marcos con `border` real (nunca solo `background`); líneas que «se dibujan» son pseudo-elementos con `border-top/left`; capas del duotono `display:none`; foco `outline: 2px solid Highlight`, `outline-offset: 3px` (sin `box-shadow`/`ring`). Tailwind 4: variante `forced-colors:` y regla global en `@layer base` | AC-16 |
| 404 | Bloques EN y ES (`lang` por bloque) con título, texto y enlace de 48 px; «404» en Anton accent | Mismos tokens y fuentes |

## 4. Uso real
- **Entrada:** todo control ≥ 44 × 44 px (CTA y envío 48); separación ≥ 8 px entre vecinos. Foco global: `:focus-visible { outline: 2px solid accent; outline-offset: 3px }` (en bloque invertido: carbon). Se eliminan todos los `focus-visible:outline-none` y `ring-*`. Orden de foco = orden del DOM; `Footer` tras `main`.
- **Legibilidad:** contraste según tabla §2; cuerpo ≥ 16 px a 390; ES absorbido con `break-words`, rejillas `min-w-0` y filas apiladas en móvil. Sin información solo por color.
- **Carga de información (30 s de un reclutador, móvil):**

| Se muestra de inicio | Se difiere | Se elimina | Por qué lo necesita la persona |
|---|---|---|---|
| Nombre, foto, título, CTA, resumen; cinta de créditos (empresas y tecnologías ya en el sitio) | Lab plegado tras su botón; Header en menú móvil | blur lila, tarjetas de color (mint/amber/lilac), pastillas redondas, sombras, `backdrop-blur`, saludo a escala grande (`greeting` pasa a micro) | Confirma perfil en un vistazo y llega al trabajo con un toque |
| Experience en filas: empresa, rol, periodo, métricas en línea, viñetas, chips | — | métricas en mini-tarjetas (pasan a texto en línea con línea vertical) | Experiencia es el motivo de la visita; sin cajas anidadas |
| Now, Stack, Achievements, Education | — | tarjetas | Lectura rápida; sin contenido nuevo |
| Fichas `EXP. 01`, `PROJ. 01`, `LAB 01`, `ACH. 01`, `EDU. 01` | — | — | Orientan y dan carácter de ficha; numeración = índice del orden real en `facts.ts` (relleno a 2 dígitos); sin años ni cifras nuevas |
Sin quitar contenido de la 001 (REQ-22): solo decoración sale.
**Microtexto nuevo (claves idénticas en ambos diccionarios):**
| Clave | EN | ES |
|---|---|---|
| `ficha.exp` | EXP. | EXP. |
| `ficha.proj` | PROJ. | PROY. |
| `ficha.lab` | LAB | LAB |
| `ficha.ach` | ACH. [CONFIRMAR] | LOGRO [CONFIRMAR] |
| `ficha.edu` | EDU. | EDU. |
| `marquee.label` | Credits | Créditos |
| `marquee.pause` | Pause motion | Pausar animaciones |
| `marquee.play` | Resume motion | Reanudar animaciones |
`hero.badge` hoy repite la frase (42 y 54 caracteres, ver sello): se edita a una sola vuelta, `AVAILABLE FOR WORK • ` / `DISPONIBLE PARA TRABAJAR • ` (mismo mensaje, sin afirmación nueva) (confirmado por la persona el 2026-10-27; modifica un valor existente, ninguna prueba lo referencia).

## 5. Qué no se inventa
Sin métricas, logos, capturas, testimonios ni textos fuera del catálogo de §4. Sin datos del MES industrial ni de SoftBank en imágenes. La numeración de fichas no añade años ni cifras. No se alteran `resume.pdf`, GitHub, LinkedIn ni correo. `alt` de la 001 y `alt=""` de capturas intactos. Las capturas (`portfolio.png`, `cma_image.png`) y la foto son las existentes.

## 6. Movimiento
Catálogo cerrado (DESIGN.md §6, REQ-12). Solo `transform`/`opacity`; ninguna `transition-all/colors/shadow/opacity`; **el cambio de color en hover/activo es instantáneo** (sin transición de color). Todo es CSS (una fuente por nodo); Framer Motion deja de usarse (`MotionProvider` se conserva; retirarlo = ADR aparte).
| Nodo | Efecto | Fuente y detalle |
|---|---|---|
| Palabras del `h1` | suben desde máscara | CSS: `span.mask{overflow:hidden}` > `span.rise{animation: rise 360ms cubic-bezier(.2,.7,.2,1) backwards}`, `translateY(105%)→0`, retardos 0/60/120 ms (fin ≤ 480 ms). Sustituye `motion.div initial y:20` y `scale .92` del Hero |
| Marco del hero y 2 filetes del marquee | se dibujan | CSS: pseudo-elementos `::before/::after` con `border` real, `scaleX/scaleY` 0→1, 500 ms, `transform-origin` en el borde de origen, solo al cargar. Otras secciones: líneas estáticas |
| Duotono → color | desvanece la capa | CSS: 3 capas `aria-hidden` (ver imagen) bajan `opacity` 1→0 en 200 ms con `:hover` y `:focus-within`; solo en `@media (hover:hover)` para el cursor |
| Press de botones y enlaces-botón | `transform: scale(.97)` en `:active`, 120 ms | CSS (`.press`). Sustituye `whileHover/whileTap` de Hero y CopyEmailButton: el hover pasa a cambio de color instantáneo |
| Chevron de Lab | rota 180° | CSS `transition: transform 150ms` (sustituye `transition-transform`) |
| Aviso «Email copied» | fade + `translateY(8px)` 250 ms | CSS `animate-fade-in` existente (ya transform/opacity) |
| Sello | rota 360° en 24 s lineal (~10 px/s en el borde) | CSS `@keyframes badge-spin` en el contenedor del anillo; los glifos son estáticos (una sola animación) |
| Spinner de envío | giro | CSS, `motion-reduce:animate-none`; el texto «Sending…» permanece |
| Header | sin transición (se quitan `transition-colors`, `shadow-sm`, `backdrop-blur`) | fondo carbon opaco + `border-b line` |
**Marquee (REQ-13/14).** Cinta bajo el hero, alto 48 px, filetes `line`; microtexto mono 12 px bone sobre carbon; separador `·` decorativo `aria-hidden`.
- **Cadenas (todas existentes):** empresas `facts.experience[].company` (SoftBank · PlayOut Kids · GH2 Systems); tecnologías `TypeScript`, `NestJS`, `React`, `Next.js` (`facts.stack.development`), `Python` (`facts.projects`), `PostgreSQL` (`facts.stack.dataAutomation`); hitos `dict.achievements.items.frc.event` y `...hackmty2026.event`. Sin textos nuevos.
- **Mecánica:** pista con dos copias; la segunda `aria-hidden`. CSS `translateX(0 → -50%)`, derecha a izquierda, `--dur: 45s` lineal infinito (≈ 35 px/s, **a medir** con el ancho real; tope 50 px/s). La copia ocupa ≥ 100 % del ancho. Una sola fuente: CSS.
- **Pausa:** `<button>` 44 × 44 al final de la cinta, alternando `Pause`/`Play` (lucide) y `aria-label` = `marquee.pause`/`marquee.play`; pone `animation-play-state: paused` por atributo `data-paused`. Contenedor `role="group"` con `aria-label` = `marquee.label`. Sin JS: el `<noscript>` detiene la animación.
- **Destellos (REQ-14):** desplazamiento lento sin cambio de luminancia ni parpadeo; 0 destellos/s, la regla de 3/s no aplica.
**`prefers-reduced-motion: reduce`:** en `globals.css` se conserva el acortamiento global (0,01 ms) y se añade, por nodo: `.badge-spin, .marquee-track, .spin { animation: none !important }` (el atajo de 0,01 ms no detiene `infinite`); `.rise, .rule-x, .rule-y { animation: none }` (aparecen ya completos); el marquee queda detenido, **visible y legible**: pista `flex-wrap: wrap`, copia `aria-hidden` con `display:none`, botón de pausa oculto (no hay nada que pausar). Los tres efectos de capa del duotono cambian al instante.
**Imagen y duotono (REQ-8/9, sin dependencias).** Módulo `.duo` (`position:relative; overflow:hidden; aspect-ratio` fijo; fondo carbon-2; borde `line` solo en Lab). De abajo arriba: (1) `<Image>` a color con su `alt`; (2) `div.duo-sat` fondo gris carbon-2 con `mix-blend-mode: saturation` (equivale a escala de grises sin filtro animado); (3) `div.duo-mul` fondo `accent` con `multiply` (altas luces → accent); (4) `div.duo-lift` fondo `carbon` con `lighten` (negros → carbón); (5) `div.grain` estático `aria-hidden`: SVG `feTurbulence` en data-URI como `background-image`, `opacity: .18`, `mix-blend-mode: overlay`, sin animar. Las capas 2–4 se desvanecen (opacity) y el grano permanece. En `forced-colors` se ocultan 2–4. Foto del hero: color solo con cursor (no es interactiva; no recibe foco). Capturas del Lab: el disparador es el `article.group` con `group-hover` y `group-focus-within`, de modo que enfocar «Open project» activa el color; en táctil no hay hover, el duotono es el estado permanente y nada depende de él (el contenido está en texto).
**Sello (REQ-10/11).** Sin `textLength` ni `textPath`: cada glifo es un `<text>` SVG con `transform="rotate(θ cx cy)"`, `x=cx`, `y=cy−r`, `text-anchor: middle`; θ = i · 360 / N (N = glifos del texto, `Array.from`); espacios se saltan. Fuente mono 12 px, paso fijo de 9 px por glifo (avance mono ≈ 7,2 px, holgura 1,8 px, independiente de la métrica de la fuente de respaldo). **r = N · 9 / 2π; caja = 2 · (r + 12) px.** Con una vuelta: EN N = 21 → r ≈ 30 px, caja ≈ 84 px; ES N = 27 → r ≈ 39 px, caja ≈ 102 px. Texto accent sobre disco carbon con borde 1 px `line` (8,85). Centro: disco accent de diámetro `2r − 28 px` con `ArrowUpRight` 20 px carbon, sin texto. Todo `aria-hidden`. Posición: el centro de la caja sobre el borde inferior derecho de la foto, 8 px dentro del borde derecho; el contenedor de la foto reserva `margin-bottom: caja/2`, así no tapa el nombre, la cara ni el CTA y no sale del viewport a 320 px (máx. 102 de 262 útiles). Si la persona rechaza editar `hero.badge`, la misma fórmula da cajas de ≈ 144 (EN) y ≈ 178 px (ES), demasiado grandes a 320 px: por eso se propone la edición.

## 7. Conflictos con el proyecto
- neubrutalism.com (borde 3 px, sombra dura, radio 0, 3 acentos) y `bento-design-spec.md`: ya resueltos en DESIGN.md §7; gana la dirección del proyecto. La skill de diseño sugiere Inter o Work Sans: se elige Work Sans (Inter se retira por la spec).
- DESIGN.md §3 permite «parpadeo único de retícula» en su catálogo; la spec 002 §2 lo excluye: gana la spec, no se diseña.
- DESIGN.md §6 dice «`transform` y `opacity`»: se aplica también a `transition-colors` (se elimina). Aviso: la regla de 0,01 ms del CSS vigente no basta para animaciones `infinite` (se corrige en §6).
- Tailwind `ring-*` genera `box-shadow`: choca con «sin sombras»; gana la regla: foco con `outline`.
- Bloque invertido: la spec permite 1 o 2; este contrato elige 1 (Projects).
- Editar `hero.badge` roza REQ-22 («contenido sin cambios»): se declara y la persona lo confirmó el 2026-10-27.

## 8. Criterio de terminado visual
- **Pantallas × anchos × idiomas:** `/en` y `/es` a 320, 360, 390, 1024 y 1280 px (hero, marquee, Experience, Projects, Lab desplegado, Contact, Footer, menú móvil abierto) y 404; capturas con fuentes e imágenes asentadas.
- **Estados:** Contact (vacío, error de campo, enviando, éxito, fallo), Now fresco y viejo, Lab plegado y abierto, copiar correo, imagen bloqueada, fuente bloqueada.
- **Emulaciones:** `prefers-reduced-motion` (sello y marquee detenidos, aparición completa), `forced-colors: active`, JS desactivado, red bloqueada (fuentes e imágenes).
- **Mediciones (AC-4/5/8/9/12/13/15/16/17/21):** tamaños computados ≥ 12/16 px, `scrollWidth` ≤ viewport, ancho del nombre ≤ 100 % del marco, sello completo sin `textLength`, objetivos ≥ 44 px, un `main` y un `contentinfo` fuera de `main`, CLS ≤ 0,1.
- **Evidencia:** capturas en `docs/specs/002-poster-visual/screens/` con nombre `<pantalla>-<ancho>-<idioma>-<estado>.png`. Hasta existir, «inspección en navegador no realizada» queda como pendiente, no como evidencia.
- **Pendientes humanos:** aprobación de la composición del hero (cortado por el marco, orden móvil, CTA que a 360 × 640 puede quedar bajo el pliegue: **a medir**), Safari y Firefox (sello, mezcla de capas del duotono), recorrido con teclado, lector de pantalla, revisión de capturas, y los `[CONFIRMAR]` de §4.
- **Landmarks (REQ-16):** un solo `main` (Hero → Contact); `Header` queda como `banner`; `Footer` sale de `main` y es `contentinfo`. Mover `<Footer>` implica editar `src/app/[lang]/page.tsx` (hoy líneas 55-62 dentro de `main`).
