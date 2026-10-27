---
type: spec
id: 002
title: Identidad visual póster brutalista — tokens, tipografía, sello y movimiento
aliases: ["002 · Identidad visual póster brutalista"]
status: approved
risk: R2
created: 2026-10-27
owner: Jostin Aldair Nava
approved_by: Jostin Aldair Nava
approved_at: 2026-10-27
---

<!-- Fuentes: [[design/DESIGN]] (dirección visual, paleta, tipografía, movimiento y restricciones; confirmado por la persona el 2026-10-27), [[specs/001-portfolio-v3/spec]] (alcance excluido a esta spec), [[specs/001-portfolio-v3/review]] (MINOR 1 y NIT heredados). Entrevista 2026-10-27. Los valores exactos de color, la fuente final y la composición los fija el contrato de diseño (`/tc-design contrato`), no esta spec. -->

## 1. Contexto y problema
La spec 001 (mergeada en `master`, `d9efaec`) dejó el contenido bilingüe y la arquitectura de información correctos, pero con el sistema visual **bento** de antes: fondo claro `#E2E2E2`, acentos púrpura/menta/ámbar, Bricolage + Inter, sello negro/púrpura. La 001 lo declaró «funcional pero sin pulir» a propósito.

Ese aspecto no corresponde a la dirección que la persona fijó en `docs/design/DESIGN.md` (póster brutalista editorial, oscuro y «washed», un solo acento) y es una plantilla reconocible. Además arrastra deudas visuales concretas:
- **V1** el titular del hero (`purple-deep` sobre claro) da 3,76:1 y 3,14:1: pasa AA solo como texto grande;
- **V2** `<Footer>` va dentro de `<main>` y no se expone como `contentinfo` (MINOR 1 de la review 001);
- **V3** el texto del sello depende de `textLength` sobre `<textPath>`, sin verificar en Safari/Firefox;
- **V4** `Particles.tsx` y la dependencia `ogl` son código muerto; `public/404.png` y `public/story.pdf` no se usan.

Quien visita (casi siempre un reclutador en móvil, una vez, con poca atención) debe entender en ~30 s quién es Jostin, y el estilo no puede ocultar la experiencia ni el contacto. Si no se hace, el sitio sigue luciendo como plantilla y las deudas V1–V4 quedan abiertas.

## 2. Objetivos y no-objetivos
**Objetivos**
- Reemplazar el sistema bento por el sistema póster de `DESIGN.md`: tokens semánticos (carbón, módulos, hueso, un acento), tipografía en tres roles y forma de marcos de línea fina sin sombras ni degradados.
- Hacer del nombre a escala de cartel, con la foto en duotono, lo memorable del hero.
- Rediseñar el sello como acento único y robusto en ambos idiomas.
- Incorporar el movimiento del catálogo aprobado (titulares, marcos, duotono→color, press, marquee) respetando `prefers-reduced-motion`.
- Cerrar V1–V4 sin alterar contenido ni estructura.

**Fuera de alcance (explícito)**
- Cambiar textos de contenido, datos factuales, orden de secciones, rutas, anclas, metadatos o el comportamiento de redirección por idioma de la 001. Solo se admiten **etiquetas de microtexto nuevas** (p. ej. «EXP. 01») añadidas a ambos diccionarios, sin afirmaciones nuevas.
- Tema claro o conmutador de tema: el sitio es de **un solo tema oscuro**.
- Parpadeo de retícula al cargar, grano animado y cualquier movimiento fuera del catálogo de `DESIGN.md` §6.
- Reemplazar `public/resume.pdf`; cambiar EmailJS o su flujo más allá de estilos y estados ya existentes.
- Paleta de comandos ⌘K y proyectos nuevos.
- Cambiar de framework, de estilo (Tailwind 4) o de librería de animación; añadir dependencias.

## 3. Requisitos
<!-- EARS. Los valores numéricos de color y la fuente final se fijan en el contrato de diseño y se verifican contra estos umbrales. -->

### Color y forma
- **REQ-1.** EL SISTEMA DEBERÁ definir en `@theme` de Tailwind los tokens semánticos `carbon` (fondo base), `carbon-2` (módulos), `bone` (texto principal y bloques invertidos) y `accent` (rosa lavado), y DEBERÁ eliminar todo token y toda clase `bento-*` del código fuente.
- **REQ-2.** EL SISTEMA DEBERÁ cumplir en todo par texto/fondo realmente usado una relación de contraste ≥ 4,5:1 para texto normal y ≥ 3:1 para texto grande (≥ 24 px, o ≥ 18,5 px en negrita), bordes de controles, iconos informativos e indicador de foco; y NO DEBERÁ usar `accent` como color de texto sobre fondo `bone`.
- **REQ-3.** EL SISTEMA DEBERÁ usar un único color de acento y DEBERÁ comunicar los estados de error y éxito con icono y texto además de color.
- **REQ-4.** EL SISTEMA DEBERÁ resolver todas las superficies con marcos de línea de 1–2 px, radio moderado y retícula visible, sin sombras (`box-shadow`, `drop-shadow`), sin degradados y sin tarjetas dentro de tarjetas, y DEBERÁ presentar como bloque invertido (fondo `bone`, texto `carbon`) en 1 o 2 secciones, entre ellas Spotlight.

### Tipografía
- **REQ-5.** EL SISTEMA DEBERÁ cargar exclusivamente con `next/font/google` tres roles tipográficos —display condensada/pesada en mayúsculas para titulares, cuerpo en grotesca neutra y microtexto en mono o grotesca pequeña con tracking amplio—, con soporte de acentos y «ñ», sustituyendo a Bricolage Grotesque e Inter.
- **REQ-6.** EL SISTEMA DEBERÁ usar una escala de 4 a 6 tamaños, con texto de cuerpo ≥ 16 px a 390 px de ancho y ningún texto visible < 12 px.

### Hero e imagen
- **REQ-7.** CUANDO se muestra el hero, EL SISTEMA DEBERÁ presentar «Jostin Aldair Nava» como texto real del DOM (no imagen) a escala de cartel, ocupando el ancho del marco, con la foto de perfil en duotono, y SIN producir desbordamiento horizontal del documento entre 320 y 1280 px en EN y ES.
- **REQ-8.** EL SISTEMA DEBERÁ mostrar fotos y capturas en duotono (carbón + acento) con una textura de grano estática y decorativa marcada `aria-hidden`, conservar el `alt` vigente de cada imagen, no incluir texto dentro de imágenes y NO depender de `hover` para transmitir información.
- **REQ-9.** CUANDO una imagen con duotono recibe cursor o foco de teclado, EL SISTEMA DEBERÁ mostrarla en color pleno.

### Sello
- **REQ-10.** EL SISTEMA DEBERÁ presentar el sello rediseñado como único acento decorativo del hero (`aria-hidden`), con su texto tomado del diccionario del idioma activo, completo y sin recorte en EN y ES a 320, 390 y 1280 px, y NO DEBERÁ depender de que el navegador respete `textLength` para que el texto quepa.
- **REQ-11.** MIENTRAS el visitante no tenga `prefers-reduced-motion: reduce`, EL SISTEMA DEBERÁ rotar el sello usando solo `transform`; SI el visitante lo tiene, ENTONCES EL SISTEMA DEBERÁ mostrarlo estático.

### Movimiento
- **REQ-12.** EL SISTEMA DEBERÁ animar únicamente `transform` y `opacity`, con 100–250 ms para feedback y ≤ 500 ms para entradas, sin `transition: all`, sin retrasar acciones del visitante, con una sola fuente de animación por nodo (Framer Motion **o** CSS) y limitado al catálogo: titulares que suben desde máscara, marcos que se dibujan con `scaleX/scaleY`, duotono→color, press de botones y marquee.
- **REQ-13.** EL SISTEMA DEBERÁ ofrecer una cinta (marquee) fina de créditos construida solo con cadenas ya presentes en los diccionarios o en los datos factuales, que se desplace con `translateX`, pueda pausarse con un control accesible por teclado con nombre accesible, y cuyo contenido repetido no se lea dos veces con tecnologías de asistencia.
- **REQ-14.** MIENTRAS el visitante tenga `prefers-reduced-motion: reduce`, EL SISTEMA DEBERÁ sustituir todo movimiento por fundido o aparición instantánea, detener el marquee y no depender de movimiento para nada esencial; y NINGÚN elemento DEBERÁ producir más de 3 destellos por segundo.
- **REQ-15.** SI JavaScript no se ejecuta o la hidratación falla, ENTONCES EL SISTEMA DEBERÁ mostrar todo el contenido legible (las animaciones de entrada son mejora progresiva, no condición de visibilidad).

### Accesibilidad y estructura
- **REQ-16.** EL SISTEMA DEBERÁ exponer exactamente un landmark `main` y un `contentinfo` con `<Footer>` fuera de `main`.
- **REQ-17.** EL SISTEMA DEBERÁ mantener foco visible en todos los controles, objetivos táctiles ≥ 44 × 44 px y reflow sin desbordes a 320 px y con zoom al 200 %, en EN y ES.
- **REQ-18.** CUANDO el visitante usa `forced-colors: active`, EL SISTEMA DEBERÁ mantener visibles marcos, foco y estados (los marcos y el foco no dependerán solo de color de fondo ni de `box-shadow`).
- **REQ-19.** SI una fuente web no carga ENTONCES EL SISTEMA DEBERÁ mostrar el texto con una fuente de respaldo legible sin desborde, y SI una imagen no carga ENTONCES EL SISTEMA DEBERÁ conservar su marco, dimensiones y texto alternativo sin desplazar el diseño.

### Limpieza, documentación y no regresión
- **REQ-20.** EL SISTEMA DEBERÁ prescindir de `src/components/Particles.tsx`, de la dependencia `ogl`, de `public/404.png` y de `public/story.pdf`, sin dejar referencias en el código fuente.
- **REQ-21.** EL SISTEMA DEBERÁ dejar la documentación del repo coherente con el nuevo sistema: el spec bento y `design-system.md` de la skill `portfolio` reemplazados o marcados obsoletos, y `README.md` sin remitir al sistema bento ni a `About.tsx`.
- **REQ-22.** EL SISTEMA DEBERÁ conservar sin cambios el contenido, el orden de secciones, los ids de ancla, las rutas, los metadatos y el comportamiento de contacto y de «Now» de la 001, de modo que las pruebas existentes sigan pasando sin debilitar ninguna aserción y las claves de ambos diccionarios sigan idénticas entre sí.

**No funcionales**
- **NF-1.** El JS de primera carga de `/[lang]` no deberá superar el de `master` medido con `next build`; las fuentes no deberán causar un CLS > 0,1.
- **NF-2.** WCAG 2.2 AA como mínimo; dispositivo prioritario 360×640 y 390×844, escritorio 1280.
- **NF-3.** Sin dependencias nuevas.

## 4. Criterios de aceptación
| ID | Requisito | Dado / Cuando / Entonces | Verificación |
|---|---|---|---|
| AC-1 | REQ-1 | Dado el código fuente, cuando se busca `bento` en `src/`, entonces no hay coincidencias y `@theme` define `carbon`, `carbon-2`, `bone` y `accent`. | test unitario que lee `globals.css` + `grep` |
| AC-2 | REQ-2 | Dada la tabla de pares texto/fondo del contrato, cuando se calcula el contraste de cada par, entonces cumple su umbral (4,5:1 o 3:1) y no existe el par `accent`-sobre-`bone` como texto. | test unitario de contraste sobre los tokens |
| AC-3 | REQ-3 | Dado `globals.css`, cuando se cuentan los tokens de acento, entonces hay exactamente uno; y dados los estados de error y éxito del formulario, entonces cada uno muestra icono y texto. | test unitario + manual (navegador) |
| AC-4 | REQ-5, REQ-6 | Dada la página `/en` y `/es` a 390 px, cuando se miden los tamaños computados, entonces ningún texto visible mide < 12 px, el cuerpo ≥ 16 px y los tres roles usan `next/font/google`; «ñ» y acentos se muestran. | script en Chrome headless + `grep` de `fonts.ts` |
| AC-5 | REQ-7 | Dado el hero en EN y ES a 320, 360, 390, 1024 y 1280 px, cuando se carga, entonces el nombre es texto del DOM, la foto es duotono y `scrollWidth` del documento ≤ ancho del viewport. | Chrome headless (medición) + capturas revisadas por la persona |
| AC-6 | REQ-4 | Dado `src/`, cuando se buscan `shadow`, `drop-shadow` y `gradient`, entonces no hay usos; y Spotlight (y como máximo otra sección) se renderiza en `bone`/`carbon`. | `grep` + captura |
| AC-7 | REQ-8, REQ-9 | Dada una imagen con duotono, cuando recibe `hover` o foco, entonces su filtro pasa a color pleno; el grano es `aria-hidden`, los `alt` de la 001 siguen presentes y no hay información solo en hover. | Chrome headless (estilo computado) + `grep` de `alt` |
| AC-8 | REQ-10 | Dado el sello en EN y ES a 320, 390 y 1280 px, cuando se elimina el atributo `textLength` por script, entonces el texto sigue completo y sin recorte. | Chrome headless + captura; **pendiente humano:** Safari y Firefox |
| AC-9 | REQ-11, REQ-14 | Dado el sello con `prefers-reduced-motion: reduce` emulado, entonces no hay animación activa; sin esa preferencia, la animación solo cambia `transform`. | Chrome headless (emulación) |
| AC-10 | REQ-12 | Dado el CSS y los componentes, cuando se revisan, entonces no hay `transition: all`/`transition-all` y toda animación afecta solo a `transform`/`opacity` con las duraciones indicadas y una sola fuente por nodo. | `grep` + revisión de código (review) |
| AC-11 | REQ-13 | Dado el marquee, cuando se usa el teclado, entonces su control de pausa es alcanzable, tiene nombre accesible y detiene el desplazamiento; y el contenido repetido está `aria-hidden`. | Chrome headless + `grep` |
| AC-12 | REQ-14 | Dado `prefers-reduced-motion: reduce` emulado, cuando se cargan `/en` y `/es`, entonces el marquee está detenido y ningún elemento tiene una animación de movimiento activa. | Chrome headless (emulación) |
| AC-13 | REQ-15 | Dado JavaScript deshabilitado, cuando se carga `/es`, entonces titulares y secciones tienen `opacity` 1 y son visibles. | Chrome headless con JS desactivado |
| AC-14 | REQ-16 | Dado el DOM de `/en` y `/es`, cuando se consulta, entonces hay un `main` y un `contentinfo`, y el segundo no es descendiente del primero. | Chrome headless (árbol de accesibilidad) |
| AC-15 | REQ-17 | Dado `/en` y `/es`, cuando se navega con Tab y se mide, entonces cada control muestra foco visible con contraste ≥ 3:1, mide ≥ 44 × 44 px, y no hay desborde a 320 px ni al 200 % de zoom. | Chrome headless + **recorrido humano con teclado** |
| AC-16 | REQ-18 | Dado `forced-colors: active` emulado, cuando se carga la página, entonces marcos, foco y estados siguen visibles. | Chrome headless (emulación) + captura |
| AC-17 | REQ-19 | Dadas las peticiones de fuentes e imágenes bloqueadas, cuando se carga `/es`, entonces el texto es legible sin desborde y cada imagen conserva marco, dimensiones y `alt`. | Chrome headless (bloqueo de red) |
| AC-18 | REQ-20 | Dado el repo, cuando se busca `Particles`, `ogl`, `404.png` y `story.pdf` en el código fuente, `package.json` y el lockfile, entonces los archivos no existen y no hay referencias de producto (salvo la guarda de `resolveProjectMedia` y su prueba para `/404.png`). | `grep` + `node scripts/tc-verify.mjs` |
| AC-19 | REQ-21 | Dados `README.md`, la skill `portfolio` y sus referencias, cuando se buscan `bento` y `About.tsx`, entonces el spec bento está retirado u obsoleto y no hay referencias vigentes. | `grep` |
| AC-20 | REQ-22 | Dado el diff de `*.test.ts`, entonces no se elimina ni se debilita ninguna aserción; las pruebas existentes pasan; el orden y los ids de sección son los de la 001; ambos diccionarios mantienen claves idénticas. | `npm test` + `git diff` + pruebas de contenido |
| AC-21 | NF-1 | Dado `next build` en esta rama y en `master`, cuando se comparan, entonces el JS de primera carga de `/[lang]` no es mayor; y el CLS medido en carga ≤ 0,1. | salida de `next build` + Chrome headless |
| AC-22 | NF-3 | Dado `package.json`, entonces no se añade ninguna dependencia (solo se retira `ogl`). | `git diff package.json` |

## 5. Modos de falla y estado seguro
| Falla | Efecto | Detección | Estado seguro / respuesta | Criterio |
|---|---|---|---|---|
| JavaScript no se ejecuta o la hidratación falla | Titulares ocultos por máscara/animación de entrada | JS desactivado en prueba | Contenido visible; la animación es mejora progresiva | AC-13 |
| `prefers-reduced-motion: reduce` | Movimiento continuo molesto o inaccesible | Emulación en navegador | Sello estático, marquee detenido, fundidos | AC-9, AC-12 |
| Texto en ES más largo desborda el hero o el sello | Nombre o sello recortado, scroll horizontal | Medición a 320–1280 px en ambos idiomas | El diseño absorbe el texto; sin desborde | AC-5, AC-8 |
| Navegador ignora `textLength` | Texto del sello cortado o solapado | Prueba quitando `textLength` | El texto cabe sin depender de ese atributo | AC-8 |
| Fuente web no carga | Reflow o texto ilegible | Bloqueo de red en prueba | Respaldo legible, sin desborde, CLS ≤ 0,1 | AC-17, AC-21 |
| Imagen (foto o captura) no carga | Hueco o desplazamiento del diseño | Bloqueo de red en prueba | Marco y dimensiones conservados con `alt` | AC-17 |
| Modo de alto contraste (`forced-colors`) | Marcos y foco desaparecen | Emulación en navegador | Bordes y foco visibles | AC-16 |
| Contraste insuficiente en un nuevo par texto/fondo | Texto ilegible al aire libre | Test de contraste de tokens | El gate falla antes de producción | AC-2, AC-15 |
| Acento usado sobre hueso | Texto casi invisible (≈ 1,6:1) | Test de contraste | Prohibido; solo `carbon` sobre `bone` | AC-2 |
| Marquee imposible de pausar | Barrera para usuarios de teclado o con atención limitada | Prueba de teclado | Control de pausa operable | AC-11 |
| Se pierde o altera contenido al rediseñar | El sitio vuelve a divergir del CV | Pruebas de contenido + diff de tests | Pruebas de la 001 siguen verdes sin debilitar | AC-20 |

## 6. Interfaces y datos
- **Tokens y tipografía:** `src/app/globals.css` (`@theme`) y `src/app/fonts.ts`. Los valores finales de color y la fuente elegida (candidatas en `DESIGN.md` §3) quedan en el contrato de diseño.
- **Diccionarios:** sin claves eliminadas ni renombradas; solo se admiten claves nuevas de microtexto, idénticas en `en` y `es`.
- **Datos factuales (`facts.ts`):** sin cambios.
- **Rutas y metadatos:** sin cambios; la imagen Open Graph sigue siendo `/profile.jpg`.
- **Archivos retirados:** `src/components/Particles.tsx`, `public/404.png`, `public/story.pdf`, dependencia `ogl`.

## 7. Supuestos, dependencias y riesgos
- **Dependencia:** la 001 está mergeada; esta rama (`feat/002-poster-visual`) parte de `master` actualizado.
- **Dependencia:** retirar `ogl` exige un **ADR** previo al plan (`/tc-adr`, lo indica `DESIGN.md` §4).
- **Dependencia:** `/tc-design contrato` antes del plan fija valores de color (medidos), fuente final, composición del hero, definición del sello y catálogo de microtexto; y la auditoría de diseño va antes de `/tc-review`.
- **Supuesto:** un solo tema oscuro; `public/profile.jpg`, `portfolio.png` y `cma_image.png` bastan como material para el duotono, que se resuelve con CSS/SVG sin dependencias.
- **Supuesto:** la marquee reutiliza cadenas existentes (empresas, tecnologías, hitos); si el contrato pidiera textos nuevos, se marcarán `[CONFIRMAR]` y se registrarán en los diccionarios.
- **Riesgo:** el nombre «cortado por el marco» puede volverse ilegible en 320 px o con ES; lo acota AC-5 con revisión humana de capturas.
- **Riesgo:** duotono y grano pueden costar rendimiento en móvil de gama baja; lo acota NF-1 y se prefieren filtros CSS/SVG estáticos.
- **Riesgo:** el sello en Safari/Firefox no se puede verificar en este entorno (queda como pendiente humano de AC-8).
- **Pendientes humanos previsibles:** revisión visual de capturas, recorrido con teclado y lector de pantalla, Safari/Firefox, y aprobación de la composición del hero.

## 8. Preguntas abiertas
<!-- Ninguna: las decisiones de la entrevista están en §9. -->

## 9. Decisiones relacionadas
- **Decisiones de la persona (entrevista 2026-10-27):** la 001 ya está mergeada · rediseño completo del sello · movimiento incluido: titulares/marcos/hover, marquee de créditos, grano estático y duotono (el parpadeo de retícula queda fuera) · se incluyen contraste del hero, landmark del pie, retiro de `Particles`/`ogl` y retiro de `404.png`/`story.pdf`.
- Dirección visual: [[design/DESIGN]]. Contrato visual: `docs/specs/002-poster-visual/design.md` (pendiente, `/tc-design contrato`).
- ADR pendiente antes del plan: retiro de `Particles.tsx` y `ogl` (`/tc-adr`).
- Spec previa: [[specs/001-portfolio-v3/spec]].
