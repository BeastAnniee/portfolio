---
type: design-context
ui_paths: src
min_target_px: 44
min_font_px: 12
touch_first: true
---
<!-- DESIGN.md — contexto de diseño del proyecto. Confirmado por la persona el 2026-10-27. Es la fuente de verdad de /tc-design y de `node scripts/tc-design.mjs`. -->
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
Tono: **póster brutalista editorial, oscuro y «washed»**. Cartel impreso desgastado, no web saturada de colores neobrutalistas. Referencia correctiva aportada por la persona (solo como corrección de rumbo, no como plantilla): tipografía enorme y pesada, un solo acento lavado sobre carbón, marcos de línea fina con esquinas redondeadas, microtexto tipo ficha técnica, imagen en duotono con grano.
- **Lo memorable:** el nombre a escala de cartel, ocupando todo el ancho y cortado por el marco, con la foto en duotono; todo lo demás obedece a esa jerarquía.
- **Color (semántico, un solo acento):**
  - `carbon` ≈ `#141414` fondo base · `carbon-2` ≈ `#1D1D1D` módulos.
  - `bone` ≈ `#E9E4D8` texto principal y **bloques invertidos** (fondo hueso, texto carbón) en 1-2 secciones, p. ej. Spotlight.
  - `accent` rosa lavado ≈ `#F29BB0`: títulos clave, sello, enlaces y estado activo. Nunca como segundo color competidor.
  - Estados (error/éxito) con icono y texto además de color, derivados del hueso y el acento.
  - Valores finales **a medir con contraste real en el contrato** (texto ≥ 4,5:1; texto grande y bordes de control ≥ 3:1). Prohibido gris tenue en texto pequeño.
- **Tipografía:** display condensada/pesada en mayúsculas para titulares (candidata: Anton; alternativas Archivo Black), cuerpo en grotesca neutra legible (candidata: Inter o Work Sans), y microtexto en mono o grotesca pequeña con tracking amplio para etiquetas («EXP. 01», años, créditos). Escala corta de 4-6 tamaños; cuerpo ≥ 16 px en móvil. Todas desde `next/font/google`, con soporte de acentos y ñ.
- **Forma:** marcos de línea fina (1-2 px) con radio moderado, retícula visible, módulos de tamaños desiguales. **Sin sombras y sin degradados**; la jerarquía sale de escala, contraste y espacio.
- **Imagen:** fotos y capturas en duotono (carbón + acento) con grano; al pasar el cursor/foco, la captura puede mostrarse en color pleno. Textura de grano y desgaste **estática y decorativa** (`aria-hidden`); la lectura nunca depende de ella. Nada de texto dentro de imágenes.
- **Vocabulario:** la metáfora de concierto es un acento tipográfico (etiquetas tipo ficha, «tour», «line-up»); la navegación y los títulos de sección usan nombres claros (Experience/Experiencia, Projects/Proyectos…).
- **Qué NO es:** neobrutalismo web con 3+ colores saturados, bordes gruesos y sombras duras; plantilla genérica; degradados; tarjetas dentro de tarjetas; emojis como iconos; grano animado; todo centrado.

## 4. Sistema existente (qué se reutiliza)
- Se **reemplazan** los tokens bento de `src/app/globals.css` (`--color-bento-*`) y las fuentes de `src/app/layout.tsx` (Bricolage/Inter) por los nuevos.
- Se reutilizan: Next 15, Tailwind 4 (`@theme`), Framer Motion con `MotionConfig reducedMotion="user"` (`src/components/MotionProvider.tsx`), `lucide-react`, `next/font`, la estructura `src/components/*` y el patrón de focus-visible. El sello de `SignatureBadge.tsx` se rediseña como acento único.
- `src/components/Particles.tsx` y la dependencia `ogl` **ya se retiraron** (ADR 0001, spec 002).
- Componentes nuevos solo si lo existente no basta, y sin dependencias nuevas sin `/tc-adr` (en particular, i18n sin `next-intl` salvo ADR).

## 5. Superficies protegidas
Ninguna; el rediseño puede reorganizar, renombrar y reordenar secciones. Se mantiene: la existencia de la forma de contacto, el enlace a CV (`/resume.pdf`, que no se reemplaza hasta recibir el CV corregido) y los enlaces a GitHub, LinkedIn (`linkedin.com/in/aldair-nava-dev`) y correo.

## 6. Restricciones de diseño
- **Movimiento:** solo `transform` y `opacity`; 100-250 ms para feedback y hasta ~500 ms para entradas; sin `transition: all`; sin retrasar acciones; una sola fuente de animación por nodo (Framer Motion **o** CSS). Catálogo permitido: líneas de titular que suben desde una máscara, líneas de marco que «se dibujan» con `scaleX/scaleY`, cambio duotono → color en hover/foco, parpadeo único de retícula al cargar, press discreto en botones, cinta (marquee) fina de créditos con `translateX`.
- **`prefers-reduced-motion`:** todo pasa a fundido o aparición instantánea; el marquee se detiene; nada esencial depende de movimiento. Ningún destello > 3 por segundo. Lo continuo (marquee) tiene pausa accesible.
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
