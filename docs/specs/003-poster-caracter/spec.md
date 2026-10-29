---
type: spec
id: 003
title: Rediseño con carácter propio — acento saturado, textura, ornamentos y movimiento ampliado
aliases: ["003 · Rediseño con carácter propio"]
status: in-review
risk: R2
created: 2026-10-28
owner: Jostin Aldair Nava
approved_by: Jostin Aldair Nava
approved_at: 2026-10-28
---

<!-- Fuentes: [[design/DESIGN]] (revisado el 2026-10-28 con las 23 referencias de `docs/context/referencias/`; §3, §6 y §7 fijan las decisiones), [[specs/002-poster-visual/spec]] (base mergeada; esta spec lo enmienda en los puntos indicados), [[specs/002-poster-visual/design]] (contrato visual vigente, a reemplazar por el de la 003). Entrevista 2026-10-28. Los valores finales de color, la composición y el catálogo de microtexto los fija el contrato de diseño (`/tc-design contrato`), no esta spec. -->

## 1. Contexto y problema
La 002 (mergeada en `master`, PR #3) dejó el sistema póster: carbón, hueso y un acento rosa **lavado** (`#F29BB0`), grano estático a 0,18, sello y marquee. Es correcto y accesible, pero la persona lo considera aún **tímido**: tras revisar 23 referencias (cartelería brutalista, portadas de disco, flyers duotono, portafolios con el nombre gigante recortado por el borde) decidió, el 2026-10-28, darle carácter propio. `DESIGN.md` ya recoge esas decisiones; **el código sigue siendo el de la 002**.

Lo que cambia respecto a la 002 (decisiones de la persona):
- **Acento:** de `#F29BB0` a un rosa saturado ≈ `#EE5583`, con **bloques de acento a sangre** (fondo acento, texto carbón). Contacto es el bloque de acento; Spotlight sigue en hueso.
- **Textura:** grano más fuerte (hasta ≈ 0,30), halftone/punteado, papel arrugado, borde rasgado y damero, todo **estático**.
- **Forma:** ornamentos geométricos SVG monocromos, una pegatina rotada y microtexto de ficha entre corchetes (`[01]`).
- **Movimiento:** vista previa que sigue al cursor en la lista de proyectos, contadores, titulares con letras escalonadas, pegatina que gira y parallax decorativo.
- **Se mantiene prohibido:** degradados de cualquier tipo (aunque las referencias los usan), sombras y grano animado.

Quien visita (casi siempre un reclutador, en móvil, con poca atención) debe seguir entendiendo en ~30 s quién es Jostin; el carácter no puede ocultar experiencia ni contacto. Si no se hace, el sitio queda con una dirección escrita en `DESIGN.md` que el código no cumple, y los tests de la 002 siguen fijando valores que la persona ya descartó.

## 2. Objetivos y no-objetivos
**Objetivos**
- Aplicar al código el `DESIGN.md` revisado: acento saturado, bloques de acento, textura ampliada, ornamentos e índices de ficha.
- Añadir al catálogo de movimiento los cinco comportamientos aprobados, todos con reduced-motion y con degradación sin JavaScript.
- Reemplazar los tests de la 002 que fijan valores antiguos por equivalentes del nuevo contrato, sin perder cobertura.
- Mantener la lectura en 30 s en móvil, el contraste AA y el contenido de la 001/002 intactos.

**Fuera de alcance (explícito)**
- Cambiar textos de contenido, datos factuales, orden de secciones, rutas, anclas, metadatos o el comportamiento de contacto y de «Now». Solo se admiten **etiquetas de microtexto nuevas** (pegatina, etiquetas de contadores, índices) en ambos diccionarios, sin afirmaciones nuevas.
- Degradados, sombras, `backdrop-*`, grano animado, tema claro o conmutador de tema.
- Fuentes pseudo-rúnicas o de trazo roto; cambiar las tres familias vigentes (Anton, Work Sans, IBM Plex Mono) salvo que el contrato lo justifique con `/tc-adr`.
- Reemplazar `public/resume.pdf`, cambiar EmailJS, paleta de comandos, proyectos nuevos o cifras nuevas escritas a mano.
- Añadir dependencias (Framer Motion ya existe y puede usarse; cualquier otra → `/tc-adr`).
- Filas «antiguas» tachadas: los datos actuales no tienen elementos archivados que las justifiquen.

## 3. Requisitos
<!-- EARS. Los valores exactos y la composición los fija el contrato de diseño. -->

### Color y bloques
- **REQ-1.** EL SISTEMA DEBERÁ definir `accent` en `@theme` como rosa saturado ≈ `#EE5583` (valor final medido en el contrato), mantenerlo como único token de acento y NO DEBERÁ dejar el valor `#F29BB0` en `src/` ni en los tests.
- **REQ-2.** EL SISTEMA DEBERÁ cumplir, en todo par texto/fondo realmente usado, contraste ≥ 4,5:1 (texto normal) y ≥ 3:1 (texto grande, bordes de control, iconos informativos y foco); el texto sobre fondo `accent` DEBERÁ ser `carbon`, y NO DEBERÁN existir los pares `accent`-sobre-`bone` ni `bone`-sobre-`accent` como texto.
- **REQ-3.** EL SISTEMA DEBERÁ presentar Contacto como bloque de acento a sangre (fondo `accent`, texto `carbon`, también controles y foco), mantener Spotlight en `bone`/`carbon`, y NO DEBERÁ tener más de 2 bloques invertidos por página ni dos consecutivos.
- **REQ-4.** EL SISTEMA DEBERÁ seguir sin sombras (`box-shadow`, `drop-shadow`), sin degradados de cualquier tipo, sin `backdrop-*` y sin tarjetas dentro de tarjetas; la legibilidad del texto sobre una foto se resolverá con un panel plano `carbon`, no con un velo degradado.

### Textura y ornamento
- **REQ-5.** EL SISTEMA DEBERÁ aplicar a las imágenes duotono un grano estático de opacidad entre 0,20 y 0,30, y DEBERÁ ofrecer como capas decorativas estáticas halftone/punteado, textura de papel arrugado, borde rasgado y damero, todas `aria-hidden`, con `pointer-events: none`, sin animación y ocultas con `forced-colors: active`.
- **REQ-6.** EL SISTEMA DEBERÁ mantener, medido sobre la página renderizada con todas las texturas activas, contraste ≥ 4,5:1 para todo texto que se superponga a una textura; y el texto DEBERÁ estar siempre por encima de la textura en el orden de apilamiento.
- **REQ-7.** EL SISTEMA DEBERÁ incluir ornamentos geométricos monocromos (estrella de cuatro puntas, damero, rejilla o círculo con marcas) como SVG inline `aria-hidden`, sin texto ni información dentro, sin dependencias y sin añadir imágenes de ráster.
- **REQ-8.** EL SISTEMA DEBERÁ mostrar una pegatina rotada ≤ 8° cuyo texto salga del diccionario del idioma activo, sin afirmación nueva, `aria-hidden` si repite contenido visible y sin tapar texto ni controles a 320–1280 px.
- **REQ-9.** EL SISTEMA DEBERÁ mostrar las fichas de sección y de elemento entre corchetes (p. ej. `[01]`), con el número derivado del índice real del dato y sin numerar elementos inexistentes.

### Movimiento (amplía el catálogo de la 002)
- **REQ-10.** EL SISTEMA DEBERÁ animar únicamente `transform` y `opacity`, con 100–250 ms para feedback y ≤ 500 ms para entradas, sin `transition: all`, sin retrasar acciones del visitante, con una sola fuente de animación por nodo (Framer Motion **o** CSS) y limitado al catálogo de `DESIGN.md` §6.
- **REQ-11.** CUANDO el visitante tiene cursor real (`hover: hover`) y pasa sobre un proyecto con imagen en la lista de proyectos, EL SISTEMA DEBERÁ mostrar una miniatura que sigue al cursor; CUANDO el proyecto recibe foco de teclado, DEBERÁ mostrarla anclada a la fila; y SI no hay hover, ENTONCES la imagen DEBERÁ estar visible en la propia fila. La miniatura NO DEBERÁ cubrir texto ni controles ni ser la única vía para ver el proyecto, y los proyectos sin imagen NO DEBERÁN mostrar miniatura.
- **REQ-12.** CUANDO una cifra de las métricas de Experience o un conteo derivado de `facts.ts` entra en vista, EL SISTEMA DEBERÁ contarla una sola vez hasta su valor final; la cifra final DEBERÁ estar en el DOM desde la carga y NO DEBERÁ haber cifras escritas a mano fuera de `facts.ts`, ni animarse valores con `[CONFIRMAR]`.
- **REQ-13.** CUANDO se muestra un titular con entrada escalonada, EL SISTEMA DEBERÁ subir las letras con ≤ 40 ms entre letras y ≤ 500 ms en total, y DEBERÁ exponer el titular a tecnologías de asistencia como una sola cadena, no letra a letra.
- **REQ-14.** CUANDO la pegatina recibe hover o foco, EL SISTEMA DEBERÁ girarla ≤ 8° adicionales usando solo `transform`.
- **REQ-15.** EL SISTEMA DEBERÁ aplicar parallax solo a imágenes, ornamentos y texto gigante decorativos, con desplazamiento ≤ 40 px mediante `transform`, nunca sobre texto con contenido, formularios ni enlaces; y SI en emulación móvil a 360 px el scroll presenta tareas largas (> 50 ms) atribuibles al parallax, ENTONCES EL SISTEMA DEBERÁ desactivarlo por debajo de 768 px.
- **REQ-16.** MIENTRAS el visitante tenga `prefers-reduced-motion: reduce`, EL SISTEMA DEBERÁ dejar estáticos contadores (cifra final al instante), letras escalonadas, parallax, miniatura que sigue al cursor, pegatina, sello y marquee, no depender de movimiento para nada esencial y no producir más de 3 destellos por segundo.
- **REQ-17.** SI JavaScript no se ejecuta o la hidratación falla, ENTONCES EL SISTEMA DEBERÁ mostrar todo el contenido legible: titulares completos, cifras finales y proyectos con su imagen visible.

### Lectura rápida y no regresión
- **REQ-18.** EL SISTEMA DEBERÁ mostrar en el primer viewport de 390×844 px, sin scroll y con todo el movimiento apagado, el nombre, el cargo y el enlace de contacto, en EN y ES.
- **REQ-19.** EL SISTEMA DEBERÁ conservar sin cambios el contenido, el orden de secciones, los ids de ancla, las rutas, los metadatos y el comportamiento de contacto y de «Now»; los tests de contenido y comportamiento DEBERÁN seguir pasando sin debilitarse y los diccionarios `en` y `es` DEBERÁN mantener claves idénticas.
- **REQ-20.** EL SISTEMA DEBERÁ reemplazar los tests de la 002 que fijan valores antiguos (hex del acento y su tabla de contraste, «único bloque invertido», grano 0,18) por equivalentes del nuevo contrato, sin eliminar ninguna aserción sin sustituto y manteniendo las guardas contra sombras, degradados, `transition: all` y `ogl`.
- **REQ-21.** EL SISTEMA DEBERÁ dejar coherentes con el nuevo sistema `docs/design/DESIGN.md`, el contrato `docs/specs/003-poster-caracter/design.md`, `design-system.md` de la skill `portfolio` y `README.md`/`docs/architecture.md` cuando mencionen color o movimiento.

**No funcionales**
- **NF-1.** El JS de primera carga de `/[lang]` no deberá superar el de `master` (tras la 002) en más de 10 kB gzip medido con `next build`, y el CLS en carga deberá ser ≤ 0,1. *(El presupuesto de 10 kB es una propuesta de esta spec; la persona puede ajustarlo al aprobar.)*
- **NF-2.** WCAG 2.2 AA como mínimo; dispositivos 360×640, 390×844 y 1280; reflow hasta 320 px y zoom al 200 %, en EN y ES.
- **NF-3.** Sin dependencias nuevas.

## 4. Criterios de aceptación
| ID | Requisito | Dado / Cuando / Entonces | Verificación |
|---|---|---|---|
| AC-1 | REQ-1 | Dado `globals.css` y `src/`, cuando se busca `#F29BB0`, entonces no hay coincidencias; `@theme` define `color-accent` ≈ `#EE5583` y es el único token `color-accent*`. | test unitario + `grep` |
| AC-2 | REQ-2 | Dada la tabla de pares del contrato, cuando se calcula cada contraste con los hex de `@theme`, entonces cumple su umbral; el texto sobre `accent` es `carbon` y no existen pares `accent`/`bone` ni `bone`/`accent` como texto. | test unitario de contraste + `grep` de clases |
| AC-3 | REQ-3 | Dado `/en` y `/es`, cuando se renderiza, entonces Contacto tiene fondo `accent` y texto `carbon` (incluidos controles y foco), Spotlight sigue en `bone`, hay ≤ 2 bloques invertidos y ninguno es adyacente a otro. | Chrome headless (estilo computado + orden del DOM) + captura |
| AC-4 | REQ-4 | Dado `src/`, cuando se buscan `shadow`, `drop-shadow`, `gradient`, `backdrop-` y `transition-all`/`transition: all`, entonces no hay usos. | test de guardas (`design-guards`) + `grep` |
| AC-5 | REQ-5 | Dado el CSS y los componentes, cuando se inspecciona, entonces el grano tiene opacidad entre 0,20 y 0,30, no hay `animation` en las capas de textura, todas son `aria-hidden` con `pointer-events: none` y con `forced-colors` emulado quedan ocultas. | test unitario de CSS + Chrome headless (emulación) |
| AC-6 | REQ-6 | Dada una captura de cada superficie con textura a 390 y 1280 px, cuando se muestrea el fondo bajo el texto, entonces el contraste del texto es ≥ 4,5:1 (≥ 3:1 en texto grande) con la textura activa. | script de medición sobre capturas + revisión humana |
| AC-7 | REQ-7, REQ-8 | Dado el DOM, cuando se consultan ornamentos y pegatina, entonces los ornamentos son `<svg>` inline `aria-hidden` sin `<text>`, la pegatina rota ≤ 8°, su texto está en ambos diccionarios y no se solapa con texto ni controles a 320–1280 px. | test unitario + Chrome headless (geometría) |
| AC-8 | REQ-9 | Dados `/en` y `/es`, cuando se leen las fichas, entonces cada una tiene formato `[…NN]` y su número coincide con el índice del dato en `facts.ts`. | test unitario de `formatFicha` + Chrome headless |
| AC-9 | REQ-10 | Dado el CSS y los componentes, cuando se revisan, entonces toda animación nueva afecta solo a `transform`/`opacity`, con las duraciones indicadas y una sola fuente por nodo. | `grep` + revisión de código |
| AC-10 | REQ-11 | Dado un proyecto con imagen, cuando hay `hover: hover` y el cursor lo recorre, entonces la miniatura lo sigue; con foco de teclado aparece anclada a la fila; sin hover la imagen es visible en la fila; no tapa texto y los proyectos sin imagen no la muestran. | Chrome headless (emulación hover/táctil) + recorrido con teclado |
| AC-11 | REQ-12 | Dado `/en` y `/es`, cuando una cifra entra en vista, entonces cuenta una sola vez hasta el valor de `facts.ts`; el texto final está en el DOM desde la carga; no hay cifras literales fuera de `facts.ts`. | Chrome headless + test de contenido + `grep` |
| AC-12 | REQ-13 | Dado un titular escalonado, cuando se mide, entonces el retardo entre letras es ≤ 40 ms, la duración total ≤ 500 ms y el árbol de accesibilidad lo expone como una sola cadena. | Chrome headless (árbol de accesibilidad y temporización) |
| AC-13 | REQ-14 | Dada la pegatina, cuando recibe hover o foco, entonces el cambio es solo `transform` y la rotación total ≤ 16° (8° base + 8°). | Chrome headless (estilo computado) |
| AC-14 | REQ-15 | Dado el parallax, cuando se inspecciona, entonces solo actúa sobre elementos decorativos con ≤ 40 px de `transform`; y a 360 px emulado el scroll no registra tareas largas > 50 ms atribuibles a él, o está desactivado bajo 768 px. | Chrome headless (traza de rendimiento) + revisión de código |
| AC-15 | REQ-16 | Dado `prefers-reduced-motion: reduce` emulado, cuando se carga `/en` y `/es`, entonces contadores muestran la cifra final, letras, parallax, pegatina, sello, marquee y miniatura quedan estáticos y no hay animación de movimiento activa. | Chrome headless (emulación) |
| AC-16 | REQ-17 | Dado JavaScript deshabilitado, cuando se carga `/es`, entonces titulares, cifras finales y proyectos con imagen son visibles (`opacity` 1). | Chrome headless con JS desactivado |
| AC-17 | REQ-18 | Dado 390×844 con movimiento apagado, cuando se carga `/en` y `/es`, entonces nombre, cargo y enlace de contacto están dentro del primer viewport sin scroll. | Chrome headless (geometría) + captura |
| AC-18 | REQ-19 | Dado el diff, entonces los tests de contenido y comportamiento pasan sin debilitarse, orden e ids de sección son los de la 002 y los diccionarios mantienen claves idénticas. | `npm test` + `git diff` + test de claves |
| AC-19 | REQ-20 | Dado el diff de `*.test.ts`, entonces cada aserción retirada tiene un sustituto del nuevo contrato (hex, tabla de contraste, bloques invertidos, grano) y siguen las guardas de sombras, degradados, `transition: all` y `ogl`. | `git diff` + `npm test` + revisión |
| AC-20 | REQ-21 | Dados los documentos listados, cuando se buscan `#F29BB0` y «lavado», entonces no hay referencias vigentes y el contrato 003 existe. | `grep` + `node scripts/tc-design.mjs lint 003` |
| AC-21 | NF-1 | Dado `next build` en esta rama y en `master`, cuando se comparan, entonces el JS de primera carga de `/[lang]` crece ≤ 10 kB gzip y el CLS en carga ≤ 0,1. | salida de `next build` + Chrome headless |
| AC-22 | NF-2 | Dado `/en` y `/es` a 320, 360, 390, 1024 y 1280 px y con zoom al 200 %, cuando se mide, entonces no hay desbordamiento horizontal, el foco es visible con contraste ≥ 3:1 y los controles miden ≥ 44 × 44 px. | Chrome headless + **recorrido humano con teclado** |
| AC-23 | NF-3 | Dado `package.json`, entonces no se añade ninguna dependencia. | `git diff package.json` |

## 5. Modos de falla y estado seguro
| Falla | Efecto | Detección | Estado seguro / respuesta | Criterio |
|---|---|---|---|---|
| JavaScript no se ejecuta o la hidratación falla | Cifras en 0, letras ocultas o miniaturas sin imagen | JS desactivado en prueba | Contenido final visible; contadores, letras y parallax son mejora progresiva | AC-16 |
| `prefers-reduced-motion: reduce` | Movimiento molesto o inaccesible | Emulación en navegador | Todo estático con cifras finales | AC-15 |
| Dispositivo táctil sin hover | La vista previa nunca aparece | Emulación táctil | La imagen está visible en la fila | AC-10 |
| Navegación solo con teclado | La miniatura solo existe con ratón | Recorrido con teclado | La miniatura aparece anclada al enfocar la fila | AC-10, AC-22 |
| Textura intensa reduce el contraste del texto | Texto ilegible al aire libre | Medición sobre capturas | El gate falla; se baja la opacidad de la textura | AC-6 |
| Acento usado con texto hueso o como texto sobre hueso | Contraste ≈ 2,6:1 o inferior | Test de contraste | Prohibido; solo `carbon` sobre `accent` | AC-2 |
| Contador con cifra no confirmada | Se anima un dato inventado | Revisión de `facts.ts` | Solo valores confirmados; los `[CONFIRMAR]` no se animan | AC-11 |
| Parallax en móvil de gama baja | Scroll con tirones o mareo | Traza de rendimiento a 360 px | Se desactiva bajo 768 px | AC-14 |
| Titular escalonado leído letra a letra | Lector de pantalla ilegible | Árbol de accesibilidad | Cadena única expuesta | AC-12 |
| Texto del ES más largo desborda hero o pegatina | Recorte o scroll horizontal | Medición 320–1280 px en ambos idiomas | El diseño absorbe el texto | AC-7, AC-22 |
| Modo de alto contraste (`forced-colors`) | Marcos y foco desaparecen o texturas estorban | Emulación | Texturas ocultas; marcos y foco visibles | AC-5 |
| Se pierde contenido o se debilita un test al reemplazar los de la 002 | El sitio diverge del CV o baja la cobertura | Diff de tests + pruebas de contenido | Cada aserción retirada tiene sustituto | AC-18, AC-19 |
| El JS de primera carga crece por contadores y parallax | Carga lenta en móvil | `next build` | Presupuesto de 10 kB; si se excede, se simplifica | AC-21 |

## 6. Interfaces y datos
- **Tokens y CSS:** `src/app/globals.css` (`@theme`, `.grain`, capas de textura) y los tests `src/lib/design-css.test.ts` y `src/lib/design-guards.test.ts`.
- **Diccionarios:** sin claves eliminadas ni renombradas; solo claves nuevas de microtexto (pegatina, etiquetas de contadores, índices), idénticas en `en` y `es`.
- **Datos factuales (`facts.ts`):** sin cambios. Los contadores leen `experience[].metrics` y conteos derivados (p. ej. número de proyectos, años de logros); no se añaden cifras.
- **Rutas y metadatos:** sin cambios.
- **Superficies protegidas:** ninguna (`DESIGN.md` §5); se conservan la forma de contacto, el CV `/resume.pdf` y los enlaces a GitHub, LinkedIn y correo.

## 7. Supuestos, dependencias y riesgos
- **Dependencia:** la 002 está mergeada en `origin/master` (PR #3); la 003 parte de `origin/master`, no de `feat/002-poster-visual`. Los cambios sin commitear de `docs/design/DESIGN.md` y las 23 imágenes de `docs/context/referencias/` viajan a la rama de la 003 en su primer commit.
- **Dependencia:** `/tc-design contrato` antes del plan fija el hex final, la composición de Contacto como bloque de acento, la geometría de la pegatina y los ornamentos, y mide el contraste con textura; la auditoría de diseño va antes de `/tc-review`.
- **Supuesto:** Framer Motion, ya presente, cubre contadores, letras y parallax sin ADR; si no bastara, `/tc-adr`.
- **Supuesto:** la lista de proyectos a la que aplica la vista previa es la de Lab. Solo 2 de 8 proyectos tienen imagen (`/portfolio.png`, `/cma_image.png`); sin imágenes nuevas, la vista previa será limitada. Más imágenes son contenido y quedan fuera.
- **Riesgo:** parallax y contadores sobre móvil de gama baja; lo acotan REQ-15, REQ-16 y NF-1.
- **Riesgo:** grano al 0,30 sobre el rosa saturado puede bajar el contraste de microtexto; lo acota REQ-6/AC-6.
- **Riesgo:** reemplazar tests de la 002 puede enmascarar una regresión; lo acota REQ-20 y la revisión del diff.
- **Pendientes humanos previsibles:** revisión visual de capturas, recorrido con teclado y lector de pantalla, Safari y Firefox, y aprobación de la composición del hero y de Contacto.

## 8. Preguntas abiertas
<!-- Ninguna: las decisiones de la entrevista están en §9. El presupuesto de 10 kB (NF-1) es una propuesta que la persona confirma al aprobar. -->

## 9. Decisiones relacionadas
- **Decisiones de la persona (entrevista 2026-10-28):** acento saturado · degradados siguen prohibidos · grano más fuerte pero estático · movimiento nuevo = vista previa en fila, contadores y entrada escalonada, parallax decorativo · la 002 ya está mergeada · Contacto es el bloque de acento · los contadores usan las métricas de Experience y conteos derivados de `facts.ts`.
- Dirección visual: [[design/DESIGN]] (§3, §6 y §7). Contrato visual: `docs/specs/003-poster-caracter/design.md` (pendiente, `/tc-design contrato`).
- Spec base: [[specs/002-poster-visual/spec]]. Referencias: `docs/context/referencias/` (23 imágenes, solo lectura).
