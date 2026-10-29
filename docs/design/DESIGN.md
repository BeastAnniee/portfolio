---
type: design-context
ui_paths: src
min_target_px: 44
min_font_px: 12
touch_first: true
---
<!-- DESIGN.md — contexto de diseño del proyecto. Confirmado por la persona el 2026-10-27; revisado el 2026-10-28 (rediseño con carácter propio a partir de docs/context/referencias, 23 imágenes). Es la fuente de verdad de /tc-design y de `node scripts/tc-design.mjs`. -->
# Contexto de diseño

## 1. Producto y personas
Portafolio personal bilingüe (EN/ES) de Jostin Aldair Nava (aldair.me). Objetivo: que quien lo visita entienda en ~30 s quién es, qué ha construido y cómo contactarlo.
- **Reclutador / líder técnico** que llega desde LinkedIn o un CV, casi siempre en móvil, una vez, con poca atención. Tarea más frecuente: confirmar perfil y experiencia, abrir 1-2 proyectos, contactar o bajar el CV. Error caro: un estilo tan ruidoso que oculte la experiencia o el contacto.
- **Colega o curioso técnico** en escritorio que explora los proyectos con calma.

## 2. Dispositivo y entorno
- Anchos objetivo: 360×640 y 390×844 (móvil, prioritario) y 1280 (escritorio); reflow correcto hasta 320 px y zoom al 200 %.
- Táctil primero (`touch_first: true`), también ratón y teclado. Luz de oficina o pantalla de móvil en exteriores: no depender de grises tenues.
- Idiomas: EN y ES con `lang` correcto; los textos en ES son más largos, el diseño debe absorberlos sin romper.
- Accesibilidad: WCAG 2.2 AA como mínimo; foco visible, `prefers-reduced-motion` respetado, objetivos ≥ 44 px, texto ≥ 12 px.

## 3. Dirección visual
Tono: **póster brutalista editorial, oscuro y desgastado**. Cartel impreso y fotocopiado con carácter propio: más crudo y más ruidoso en textura que la primera versión, pero con **un solo acento** y lectura inmediata. Referencias aportadas por la persona en `docs/context/referencias/` (23 imágenes; son corrección de rumbo y vocabulario, no plantilla a copiar): etiqueta musical brutalista rosa sobre negro (MNLTH), cartelería de moda y música en rojo/amarillo/rosa (UNRULED, TRYLV, Kaori), portada de disco en hueso sobre negro con marcos redondeados y ornamentos (Kanye/Vultures), flyers duotono rosa-sobre-ciruela (West End Threadz), formas bitmap/estrellas, y portafolios editoriales con nombre gigante recortado por el borde (OUTLINE, EUGENIA, MOCA, Studio Visla).
- **Lo memorable:** el nombre a escala de cartel, ocupando todo el ancho y recortado por el marco o por el borde de la pantalla, con la foto en duotono y grano; todo lo demás obedece a esa jerarquía. Segundo rasgo: **índices y microtexto de ficha** (`[01]`, `001 //`, `(about)`) que dan ritmo de catálogo.
- **Color (semántico, un solo acento):**
  - `carbon` ≈ `#141414` fondo base · `carbon-2` ≈ `#1D1D1D` módulos.
  - `bone` ≈ `#E9E4D8` texto principal y **bloques invertidos** (fondo hueso, texto carbón).
  - `accent` rosa saturado ≈ `#EE5583` (sustituye al rosa pálido anterior): titulares clave, sello, enlaces, estado activo y **bloques de acento a sangre** (fondo `accent`, texto **carbón**; nunca hueso sobre acento, 2,6:1) en 1-2 secciones. Nunca como segundo color competidor.
  - Los bloques invertidos (hueso o acento) son como máximo 2 por página y nunca dos seguidos, para que el carbón siga siendo la base.
  - Estados (error/éxito) con icono y texto además de color, derivados del hueso y el acento.
  - Contrastes ya medidos (WCAG): `accent`/`carbon` 5,49:1 · `accent`/`carbon-2` 5,03:1 · `carbon`/`accent` 5,49:1 · `bone`/`carbon` 14,5:1 · `bone-2`/`carbon` 7,3:1 · `line`/`carbon` 4,07:1 (bordes ≥ 3:1). El contrato debe **remedir con el grano encima** (texto ≥ 4,5:1; texto grande y bordes de control ≥ 3:1). Prohibido gris tenue en texto pequeño.
- **Tipografía:** display condensada/pesada en mayúsculas para titulares (Anton), cuerpo en grotesca neutra legible (Work Sans) y microtexto en mono con tracking amplio (IBM Plex Mono) para etiquetas, índices entre corchetes, años y créditos. Se admite titular a escala de cartel recortado por el borde, siempre con el texto completo en el DOM (lectores de pantalla) y legible al menos en su parte central. Escala corta de 4-6 tamaños; cuerpo ≥ 16 px en móvil. Todas desde `next/font/google`, con soporte de acentos y ñ. **No** se usan fuentes pseudo-rúnicas, de relieve ilegible ni texto con trazo roto (MNLTH) para contenido: rompen la ñ y los acentos del ES y la lectura en 30 s.
- **Forma:** marcos de línea fina (1-2 px) con radio moderado, retícula visible, módulos de tamaños desiguales, bloques de color a sangre. Se admiten **ornamentos geométricos monocromos** (estrellas de cuatro puntas, damero, rejilla o globo de líneas, círculos con marcas) como SVG decorativo `aria-hidden`, una **pegatina** rotada (≤ 8°) y filas «antiguas» tachadas **con** etiqueta de texto («archivado»), nunca solo tachado. **Sin sombras y sin degradados**; la jerarquía sale de escala, contraste y espacio.
- **Imagen y textura:** fotos y capturas en duotono (carbón + acento) con grano; al pasar el cursor/foco, la captura puede mostrarse en color pleno. La textura es **más intensa que en la v1 pero siempre estática y decorativa** (`aria-hidden`, `pointer-events: none`): grano hasta ≈ 0,30 de opacidad, halftone/punteado de puntos, textura de papel arrugado, borde rasgado y damero. Texto siempre **por encima** de la textura y medido con ella debajo; la lectura nunca depende de ella. Nada de texto dentro de imágenes. Con `forced-colors` las texturas se ocultan.
- **Vocabulario:** la metáfora de concierto es un acento tipográfico (etiquetas tipo ficha, «tour», «line-up»); la navegación y los títulos de sección usan nombres claros (Experience/Experiencia, Projects/Proyectos…).
- **Qué NO es:** neobrutalismo web con 3+ colores saturados, bordes gruesos y sombras duras; plantilla genérica; **degradados de cualquier tipo** (se mantienen prohibidos: el resplandor y el velo degradado de las referencias se resuelven con color plano, duotono y grano); tarjetas dentro de tarjetas; emojis como iconos; grano animado; fuentes ilegibles; todo centrado.

## 4. Sistema existente (qué se reutiliza)
- Se **reemplazan** los tokens bento de `src/app/globals.css` (`--color-bento-*`) y las fuentes de `src/app/layout.tsx` (Bricolage/Inter) por los nuevos.
- Se reutilizan: Next 15, Tailwind 4 (`@theme`), Framer Motion con `MotionConfig reducedMotion="user"` (`src/components/MotionProvider.tsx`), `lucide-react`, `next/font`, la estructura `src/components/*` y el patrón de focus-visible. El sello de `SignatureBadge.tsx` se rediseña como acento único.
- `src/components/Particles.tsx` y la dependencia `ogl` **ya se retiraron** (ADR 0001, spec 002).
- Componentes nuevos solo si lo existente no basta, y sin dependencias nuevas sin `/tc-adr` (en particular, i18n sin `next-intl` salvo ADR).

## 5. Superficies protegidas
Ninguna; el rediseño puede reorganizar, renombrar y reordenar secciones. Se mantiene: la existencia de la forma de contacto, el enlace a CV (`/resume.pdf`, que no se reemplaza hasta recibir el CV corregido) y los enlaces a GitHub, LinkedIn (`linkedin.com/in/aldair-nava-dev`) y correo.

## 6. Restricciones de diseño
- **Movimiento:** solo `transform` y `opacity`; 100-250 ms para feedback y hasta ~500 ms para entradas; sin `transition: all`; sin retrasar acciones; una sola fuente de animación por nodo (Framer Motion **o** CSS); sin dependencias nuevas. Catálogo permitido:
  - *Ya existente:* líneas de titular que suben desde una máscara, líneas de marco que «se dibujan» con `scaleX/scaleY`, cambio duotono → color en hover/foco, press discreto en botones, cinta (marquee) de créditos o de nombre a escala gigante con `translateX`.
  - *Vista previa en fila:* en la lista de proyectos, una miniatura (`transform: translate` + `opacity`) que sigue al cursor solo con `(hover: hover)`; con foco de teclado aparece anclada a la fila y en táctil la imagen es visible en la propia fila. Nunca es el único modo de ver el proyecto ni cubre texto.
  - *Entrada:* titular con letras que suben escalonadas (≤ 40 ms entre letras, ≤ 500 ms totales); pegatina que gira ≤ 8° al hover/foco; **contadores** que cuentan una sola vez al entrar en vista: la cifra final está en el DOM desde el inicio, solo se cuentan cifras confirmadas (lo no confirmado es `[CONFIRMAR]` y no se anima) y con reduced-motion se muestra la cifra final al instante.
  - *Parallax / scroll-linked:* solo sobre imágenes, ornamentos y texto gigante **decorativos**, desplazamiento ≤ 40 px con `transform`, listeners pasivos o `useScroll` de Framer Motion; nunca sobre texto que lleve contenido, formularios ni enlaces. Se desactiva con `prefers-reduced-motion` y se comprueba en la auditoría a 360 y 390 px (sin tirones ni desplazamiento horizontal); si no es fluido en móvil, se apaga por debajo de 768 px.
- **`prefers-reduced-motion`:** todo pasa a fundido o aparición instantánea; el marquee y el sello se detienen; contadores, letras escalonadas, parallax, vista previa que sigue al cursor y pegatina giratoria quedan estáticos; nada esencial depende de movimiento. Ningún destello > 3 por segundo. Lo continuo (marquee, sello) tiene pausa accesible. La pantalla debe leerse en 30 s en móvil con todo el movimiento apagado.
- **Datos vivos:** la sección «Now» muestra `updatedAt` y, pasados 90 días, se presenta como «última actualización» y no como actual.
- **Estados:** formulario de contacto con cargando/éxito/error y foco al primer error; cada vista de contenido define vacío y error si el dato falta.
- **i18n:** EN y ES desde un diccionario tipado; sin literales sueltos en componentes; la traducción no añade afirmaciones nuevas.
- **Contenido:** sin datos inventados; lo no confirmado se marca `[CONFIRMAR]`. Sin capturas ni código del MES industrial ni de SoftBank.
- **Dependencias:** ninguna nueva sin `/tc-adr`.
- **Alcance:** solo UI/contenido del portafolio; no se toca el envío de EmailJS más allá de estados y accesibilidad.

## 7. Decisiones sobre reglas de terceros
- La guía neobrutalista web (neubrutalism.com: borde 3 px, sombra dura, radio 0, paleta de 3 acentos) **no aplica**: la persona aportó una referencia correctiva (póster oscuro, un acento, línea fina). Gana la dirección de este archivo.
- La regla del spec bento «sin sombras realistas» se conserva y se amplía a «sin sombras».
- `.claude/skills/portfolio/references/bento-design-spec.md` se **eliminó**; `design-system.md` de la skill remite al contrato de diseño de la spec 002.
- La metáfora de concierto no sustituye nombres claros de navegación (reclutadores, bilingüe).
- **2026-10-28 · Rediseño con carácter propio (23 referencias).** Decisiones de la persona sobre lo que piden las referencias:
  - *Acento:* sube de un rosa pálido a un rosa saturado (`#EE5583`), siempre uno solo; los bloques de acento llevan texto carbón.
  - *Degradado:* **se mantiene prohibido** aunque MNLTH, Lena Park, Venus y OUTLINE lo usan (resplandor, esfera punteada, velo sobre foto). Conflicto anotado: el efecto se obtiene con color plano, duotono y grano, y la legibilidad sobre foto con un panel plano carbón (no con velo degradado).
  - *Grano/textura:* se relaja a «más fuerte pero estático» (grano ≈ 0,30, halftone, papel arrugado, borde rasgado, damero). El grano animado sigue prohibido.
  - *Movimiento:* el catálogo crece con vista previa en fila, contadores y entrada escalonada, y parallax/scroll-linked decorativo. La recomendación de limitar el parallax en móvil se recoge como salvaguarda medible en la auditoría (apagar bajo 768 px si no es fluido), no como prohibición.
  - *Fuentes rúnicas/ilegibles (MNLTH):* descartadas por la ñ/acentos del ES y la lectura en 30 s.
  - Estas decisiones cambian la dirección visual implementada por la spec 002: su aplicación al código requiere spec y plan nuevos; este archivo solo fija el contrato.
