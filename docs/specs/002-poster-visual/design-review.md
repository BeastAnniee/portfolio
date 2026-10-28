---
type: design-review
spec: "[[specs/002-poster-visual/spec]]"
verdict: APPROVE
inspection: browser
---
<!-- design-review.md — auditoría de diseño (/tc-design auditoría), segunda pasada, tras la corrección del hallazgo #1 de la primera. verdict solo en el frontmatter. -->
# Auditoría de diseño · 002-poster-visual

## Resumen
**Segunda pasada.** Se releyó el código de `/[lang]` (Hero, SignatureBadge, DuoImage, Header, LocaleSwitch, Now, Contact, CopyEmailButton, Projects, ProjectCard, Lab, Marquee, `lib/marquee.ts`, `globals.css`, `page.tsx`, `layout.tsx`, `global-not-found.tsx`) y se revisaron las capturas de `screens/`. Se vieron `page-{320-en, 320-es, 360-en, 360-es, 390-en, 1024-en, 1024-es, 1280-en, 1280-es}-normal.png`, `404-390-en-normal.png`, y muestras de `badge-`, `marquee-`, `lab-` y `menu-`. Las superficies protegidas (DESIGN.md §5: contacto, CV, GitHub, LinkedIn, correo) siguen presentes.

**Veredicto: APPROVE.** El MAJOR de la primera pasada (#1, hero móvil) está **corregido** con evidencia de código y de capturas; no hay BLOCKER ni MAJOR abiertos. Quedan 11 MINOR abiertos (2 son nuevos de esta pasada, ver #14 y #15) y 3 hallazgos descartados.

**Evidencia de #1 (confirmado):**
- Código: en `Hero.tsx:53-88` la columna de texto (cargo + `qualifier`, CTA, iconos, resumen) va **antes** de la foto (`Hero.tsx:90-105`) en el DOM; en escritorio `@2xl:row-start-1` / `@2xl:col-start-8` mantiene la foto a la derecha. Prueba de regresión: `src/lib/design-guards.test.ts:94-102`. Ojo: la prueba compara posiciones de texto en el fuente; es un guardarraíl suficiente, no una medición.
- Capturas: `page-360-en/es`, `page-320-en/es` y `page-390-en` muestran nombre (3 líneas) → cargo en accent → «Check out my work»/«Ver mi trabajo» → resumen → foto con sello; a 1024 y 1280 (EN y ES) texto a la izquierda, foto a la derecha, sin solapes ni desborde visible.
- Medición aportada por la sesión principal (dato, **no re-medida por mí**): CTA en y=621–669 a 360×640 (antes 869–917), `scrollWidth` 360. Esto deja un residuo, ver #14.

**Sin regresión nueva en el hero** (a 320/360/390/1024/1280, EN/ES, en las capturas válidas):
- *Orden de lectura y de foco:* DOM = saludo → `h1` → cargo → CTA → GitHub → LinkedIn → copiar correo → resumen → foto. El orden de Tab (CTA → GitHub → LinkedIn → copiar correo → pausa del marquee) coincide con el visual en móvil y, además, ahora **también en escritorio** (antes la foto iba primero en el DOM y a la derecha en pantalla). La foto no es interactiva y el sello es `aria-hidden` y no recibe foco; ninguno rompe la secuencia. El lector de pantalla anuncia el `alt` de la foto al final del bloque: aceptable. No pude comprobar el recorrido con teclado ni con lector reales.
- *Sello al final de la columna móvil:* cuelga del borde inferior de la foto (`Hero.tsx:102`); el contenedor reserva `margin-bottom: caja/2` (`Hero.tsx:92`) más el `p-4` del marco, así que no se corta por `overflow-x: clip` ni se solapa con la cinta que sigue; en las capturas a 320 y 360 (EN/ES) se ve completo dentro del marco.
- *Sin cambios de estructura* que afecten a las superficies protegidas ni a los ids de ancla.

**No se pudo comprobar (pendiente humano):** Safari, Firefox, lector de pantalla y recorrido real con teclado; contraste renderizado propio (se aceptan los valores del contrato y de `validation.md`, que no releí). Capturas válidas disponibles pero de baja resolución (página completa): el detalle fino del hero se tomó del código.

## Hallazgos
<!-- BLOCKER = cambia una superficie protegida, rompe un invariante o se sale del alcance. MAJOR = dificulta la tarea. MINOR = pulido. Máx. 15, por impacto. Estado: abierto | corregido | descartado. -->
| # | Sev | Ubicación | Problema y escenario (qué ve/hace la persona → por qué le cuesta) | Corrección sugerida | Estado |
|---|---|---|---|---|---|
| 1 | MAJOR | `src/components/Hero.tsx:53-88` y `:90-105` | Primera pasada: en móvil la foto iba antes del cargo y del CTA y el reclutador de 360×640 no veía qué hace Jostin ni la acción principal. Ahora el texto va antes que la foto (código, prueba `design-guards.test.ts:94-102` y capturas 320/360/390 EN/ES). El cargo en accent queda dentro del primer pliegue; el CTA arranca en el pliegue (residuo en #14). | — | **corregido** (orden DOM verificado; CTA y=621–669 a 360×640, antes 869–917) |
| 14 | MINOR | `src/components/Hero.tsx:30-60` (espacio vertical sobre el CTA en móvil) | **Nuevo, residuo de #1.** A 360×640 el CTA ocupa y=621–669: solo ~19 px de sus 48 caen sobre el pliegue y la etiqueta («Check out my work», centro ≈ y 645) queda debajo. En un móvil real con barra del navegador (≈ 560–600 px útiles) el CTA entero queda fuera de pantalla. A 390×844 el CTA (≈ y 657–705, estimado, no medido) sí es visible. La persona ve cargo y borde del botón: se entiende, pero «acción principal visible sin desplazarse» (principios §2) se cumple a medias a 360×640. Ya figura como decisión humana en `plan.md` §9. | Decisión humana: o se acepta (cargo visible + botón asomando), o se recorta altura sobre el CTA (p. ej. `gap-6` → `gap-4`, saludo y relleno del marco más compactos, o nombre algo menor en móvil si el criterio medido de 96–98 % lo permite). Recapturar 360×640 EN/ES. | descartado: la persona acepta el riesgo (2026-10-28); a 390×844 el CTA cabe entero y a 360×640 arranca sobre el pliegue |
| 2 | MINOR | `src/components/SignatureBadge.tsx:34-39` | El círculo accent relleno con flecha ↗ junto a la foto parece un botón, pero es `aria-hidden` y no navega: tocarlo no hace nada (falso afordance en táctil) y es un segundo relleno accent que compite con el CTA. Tras el reordenamiento, en móvil queda al final del hero (menos expuesto en el primer pliegue), pero en escritorio sigue en el primero. | Quitar la flecha (sello solo tipográfico) o envolver el sello en un enlace real a `#contact` con nombre accesible y objetivo ≥ 44 px. | abierto |
| 3 | MINOR | `src/components/Header.tsx:21`, `src/components/LocaleSwitch.tsx:25`, `src/components/Hero.tsx:61` | A 1280 el primer pliegue tiene tres bloques accent rellenos: CV, idioma activo (un `span` que parece botón) y el CTA del hero. Se diluye «una acción principal»; el CV compite con el CTA. | Relleno accent solo para el CTA; CV con marco `line` y idioma activo con subrayado o texto accent. | abierto |
| 4 | MINOR | `src/components/Header.tsx:92-102`, `src/components/Hero.tsx:58-85` | En móvil el CV solo aparece tras abrir el menú y desplazarse al final de la lista; el hero ofrece GitHub, LinkedIn y correo pero no el CV, tarea frecuente según DESIGN.md §1. El reordenamiento no lo cambia. | Añadir el CV como acción secundaria en el hero (junto a los iconos) o mover el CV al inicio del menú móvil. | abierto |
| 5 | MINOR | `src/app/global-not-found.tsx:14-35` · `screens/404-390-en-normal.png` | Primera pasada: la captura de la 404 se veía sin estilos. Verificado: la captura regenerada muestra la 404 con estilos (Anton, «404» en accent, enlaces `bone`/`line` de 48 px) y el código carga `globals.css` y `fontClasses` (`:2-3,14`); la captura anterior estaba obsoleta. El resto del hallazgo (dos `<h1>`, `global-not-found.tsx:20`, dentro del `map`) es real pero ya estaba declarado fuera de alcance en `design.md` §0 y `plan.md` (seguimiento): se pasa a «Fase posterior». | — | descartado (captura obsoleta; dos `h1` → fase posterior) |
| 6 | MINOR | `src/components/Now.tsx:33-50` | La vigencia se evalúa tras hidratar: el HTML servido dice «Última actualización» con reloj y, para visitas dentro de 90 días, cambia a «Actualizado» y el reloj desaparece (salto de texto y de ancho en la línea). Es seguro (nunca pinta viejo como actual) pero cambia ante todos los que llegan con JS; hoy (`updatedAt` 2026-10-27) todos lo ven. | Mantener el estado seguro, pero evitar el salto: reservar el hueco del icono (`invisible` en vez de quitar el nodo) o calcular el estado en servidor y revalidar en cliente. | abierto |
| 7 | MINOR | `src/components/Contact.tsx:40-43`, `:155-168`, `:192-196` | Tras un envío correcto el mensaje «enviado» permanece mientras la persona escribe de nuevo en el formulario vacío (`handleChange` no limpia `status`): parece que el mensaje nuevo ya se envió. Mientras envía, «Enviando…» aparece dos veces (línea de estado y botón). | Limpiar `status` de éxito al primer cambio de campo; dejar la indicación de envío en un solo sitio. | corregido (fix: ver plan.md §9) |
| 8 | MINOR | `src/components/CopyEmailButton.tsx:20-25`, `:41-47` | Si `navigator.clipboard` falla (permiso, HTTP, navegador embebido de LinkedIn) el `catch` retorna sin avisar: el toque en el sobre no da respuesta ni alternativa. Hay una región `role="status"` por instancia (hero y pie), dos en la página. | En el fallo, mostrar el correo en texto o abrir `mailto:` con aviso; dejar una sola región viva. | corregido (fix: ver plan.md §9) |
| 9 | MINOR | `src/components/Projects.tsx:25-37`, `src/components/Lab.tsx:52`, `src/content/facts.ts:11-25` | Primera pasada: Lab usa `duo-trigger` en la tarjeta y Spotlight no. Verificado: las dos tarjetas de Spotlight no tienen `image` en `facts.ts`, así que no hay captura que reaccione; `DuoImage` ya es `duo-trigger` por sí misma (`DuoImage.tsx:18`). Sin escenario hoy. El duotono permanente en táctil es coherente con DESIGN.md §3. | — | descartado (Spotlight no tiene imágenes) |
| 10 | MINOR | `src/lib/marquee.ts:7`, `src/components/Marquee.tsx:16-33` | Primera pasada: las tecnologías son un literal. Verificado: `marquee.test.ts:38-41` exige que cada cadena exista en `facts` o en el diccionario, así que no puede divergir en silencio; la copia repetida es `aria-hidden` (`Marquee.tsx:19`), que es lo que pide REQ-13. Que la primera copia se lea es preferencia, no defecto. | — | descartado (guardado por prueba; REQ-13 cumplido) |
| 11 | MINOR | `src/components/Contact.tsx:135-144` | El `<h2>` accesible es el microtexto de 12 px («Contacto») y el titular visual («Trabajemos juntos») es un `<p>`; el resto de secciones usa `SectionHeading` con el titular como `h2`. Quien navega por encabezados oye «Contacto» y no el titular. | Titular grande como `h2` con `aria-labelledby`; microtexto como `p`. | abierto |
| 12 | MINOR | `src/app/globals.css:270-273` | Solo las secciones llevan `scroll-margin-top`; el encabezado fijo mide ~61 px y no hay `scroll-padding-top` en `html` (confirmado por búsqueda: no existe). Al tabular, un control recién enfocado puede quedar bajo la barra (WCAG 2.4.11). **No comprobado con teclado real.** | `html { scroll-padding-top: 5rem; }`. | corregido (fix: ver plan.md §9) |
| 13 | MINOR | `src/app/global-not-found.tsx:16` | `min-h-screen` (100vh) en el `main` de la 404: con la barra del navegador móvil añade un desplazamiento innecesario. | `min-h-dvh`. | abierto |
| 15 | MINOR | `screens/hero-{320,360,390,1024,1280}-{en,es}-normal.png`, `screens/page-390-es-normal.png` | **Nuevo, evidencia.** Las capturas `hero-*` (vistas: 320-es, 360-en, 360-es, 390-en, 1024-es, 1280-en) salen **sin hoja de estilos** (serif, viñetas, foto gigante a color antes del contenido) y no representan el hero real; y `page-390-es-normal.png` (390×844, un ancho objetivo) muestra la **404**, no la página ES. Quien revise «capturas del hero» (pendiente humano de AC-5) verá una página rota o la foto antes del texto y concluirá lo contrario de lo medido. No es un defecto del producto: las capturas válidas (`page-*`) sí muestran el hero correcto. Causa no confirmada (probable captura durante un rebuild o antes de cargar el CSS). | Regenerar `hero-*` y `page-390-es-normal.png` con el build limpio y revisar a ojo cada una antes de entregarlas a la persona; si no se regeneran, borrarlas. | abierto |

## Hallazgos mecánicos
Fuente: `.tc/design-check.json` (generado 2026-10-28T16:59:18Z; 0 MAJOR, 2 MINOR, 15 INFO).

| Indicio | Clasificación |
|---|---|
| MINOR `viewport-height` · `src/app/[lang]/page.tsx:31` | Descartado: `min-h-screen` en el contenedor raíz de una página mucho más alta que el viewport; no centra contenido ni produce desborde por 100vh. |
| MINOR `viewport-height` · `src/app/global-not-found.tsx:16` | Confirmado → hallazgo #13. |
| INFO `sticky-hover` ×15 · `global-not-found.tsx:26,27`; `Contact.tsx:190`; `CopyEmailButton.tsx:37`; `Footer.tsx:15`; `Header.tsx:18,21,72`; `Hero.tsx:18,61`; `Lab.tsx:31`; `LocaleSwitch.tsx:44`; `Marquee.tsx:53`; `Now.tsx:62`; `ProjectCard.tsx:69` | Descartados: Tailwind 4 (`package.json:32`) compila `hover:` dentro de `@media (hover: hover)`; verificado de nuevo en el CSS de build actual `.next/static/css/f140d0b52c665604.css` (regla `.hover\:bg-bone` dentro de `@media (hover:hover)`). Los `.duo-trigger:hover` de `globals.css:264-268` también están acotados. Sin hover pegado en táctil. (Cambia respecto a la pasada anterior solo la numeración: `Hero.tsx:18,61` en lugar de `:18,:78` por el reordenamiento.) |

## Fase posterior (no se corrige ahora)
- `src/app/global-not-found.tsx:20`: dos `<h1>` (uno por idioma). Heredado; ya declarado en `design.md` §0 y en el seguimiento de `plan.md`.
- `docs/specs/002-poster-visual/design.md:24` (tabla de orden de lectura del hero, «nombre → foto 3:2 + sello → título → CTA») y `plan.md` T8 describen el orden **anterior**; la corrección de #1 los deja desactualizados. Actualizar el contrato en la fase correspondiente (es la persona quien aprueba el contrato; yo no lo edito).
- Sin enlace de salto al contenido (`rg skip` en `src` sin resultados; `layout.tsx` y `page.tsx` no lo tienen). A 1280 un usuario de teclado atraviesa marca, 8 enlaces, CV e idioma antes del hero. Heredado de la 001; no comprobado con teclado real.
- Hero entre 640 y ~703 px de ancho de viewport (marco < 42 rem, p. ej. un móvil en horizontal): sigue en una sola columna con el nombre a `38cqi` en tres líneas (~580 px de alto) y un viewport de ~375 px de alto; el CTA queda lejos del pliegue. No medido; el arnés mide 640 pero no el alto de ese caso.
- `src/components/Lab.tsx:40-55`, `src/components/Achievements.tsx:18-37`: sin estado vacío si el array queda vacío (Experience sí, `Experience.tsx:22`). Datos estáticos, riesgo bajo.
- `src/content/facts.ts`: las métricas de Experience (17 pantallas, 3 idiomas, 6 departamentos, 40→100 %) vienen de la 001 y no se verificaron frente a una fuente.
- `src/components/ProjectCard.tsx:68-70`: el enlace de la variante invertida no tiene estado hover (solo subrayado).
- Trabajo sin commit (git status): commitear antes de `/tc-review`.

## Conflictos con el proyecto
- web-design-guidelines pide Title Case en títulos y botones y voz en segunda persona; el proyecto fija titulares en mayúsculas de display y microcopy desde diccionario (DESIGN.md §3 y §6). Gana el proyecto; no se reportó.
- La guía neobrutalista (borde 3 px, sombra dura) queda fuera por DESIGN.md §7; no se aplicó.
- El orden móvil que fija `design.md` §1 (foto antes que cargo y CTA) choca con principios §2 («acción principal visible sin desplazarse»): la corrección de #1 sigue a los principios y a la tarea de la persona, y el contrato debe actualizarse (ver Fase posterior). `design.md` §8 ya dejaba esta decisión como pendiente humana.
- Sin conflictos con `AGENTS.md` ni con la constitución. `hero.badge` («disponible para trabajar») ya lo confirmó la persona; no se reabre.

## Reglas consultadas (obligatorio; solo lo que realmente se leyó)
| Fuente (ruta) | Leída | Reglas o secciones aplicadas |
|---|---|---|
| `tc-design/vendor/web-design-guidelines/command.md` | sí | Accesibilidad (skip link, encabezados, nombre accesible), foco, formularios, animación, imágenes, tacto, hover, anti-patrones |
| `tc-design/vendor/anti-ui-slop/SKILL.md` + `reference/audit.md`, `operate.md`, `craft.md` | sí | Auditoría de solo lectura, jerarquía y acción principal, estados, objetivos, contraste, movimiento, evidencia y cierre del ciclo |
| `tc-design/vendor/anti-ui-slop/reference/distill.md` | no consultada | — (no se detectó sobrecarga de información) |
| `tc-design/references/principios.md` | sí | §2 jerarquía y acción principal, §4 estados, §5 formularios, §6 foco/objetivos, §7 movimiento, §10 señales de UI genérica |
| `docs/design/DESIGN.md` | sí | §1–§7 (personas, dispositivos, dirección, sistema, superficies protegidas, restricciones, decisiones) |
| `docs/specs/002-poster-visual/spec.md`, `design.md`, `plan.md` | sí | REQ/AC, contrato de hero, sello, movimiento y estados; divergencias de `plan.md` §9 (incluido el fix de #1) |
| `src/app/[lang]/layout.tsx` | sí | `lang` por idioma, `viewport` sin `user-scalable=no`, sin skip link, fuentes en `<html>` |
| `.tc/design-check.json` | sí | Indicios mecánicos clasificados arriba |
| `docs/specs/002-poster-visual/validation.md` | no consultada en esta pasada | — |
| Informes de `taste-skill` | no hubo | — |

## Cobertura
- [x] Superficies protegidas intactas (DESIGN.md §5): contacto, CV, GitHub, LinkedIn y correo presentes; el reordenamiento no mueve ni quita ninguna.
- [x] Objetivos táctiles y carga de información (contrato §4): CTA 48 px, iconos y botones 44 px en el código revisado; texto mínimo 12 px (`text-xs`). El CTA a 360×640 queda a medias sobre el pliegue (#14, decisión humana).
- [x] Estados cargando / vacío / error / éxito y dato viejo: contacto con enviando, éxito y error con icono y texto y foco al primer error (#7 es pulido); `Now` con `updatedAt` y paso a «última actualización» (#6 es pulido). Vacío de Lab y Achievements en fase posterior.
- [x] Movimiento: solo `transform`/`opacity`, sin `transition: all`, reduced-motion cubre sello, cinta (detenida y legible) y filetes; la cinta tiene botón de pausa. Sin dependencias nuevas.
- [ ] Accesibilidad: nombre accesible, contraste y objetivos revisados en código y captura; orden de foco del hero verificado por código; **foco no tapado por el encabezado (#12), recorrido real con teclado, lector de pantalla, Safari y Firefox pendientes de revisión humana**.
