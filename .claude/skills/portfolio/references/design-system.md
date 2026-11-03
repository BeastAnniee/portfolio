# Sistema de diseño vigente

> Sistema póster con carácter propio, en un sitio de tres páginas (`/[lang]`, `/[lang]/work`, `/[lang]/about`). La fuente de verdad es:
> - `docs/design/DESIGN.md` — dirección visual (póster oscuro, un acento saturado, línea fina, textura y ornamentos).
> - `docs/specs/003-poster-caracter/design.md` — tokens, pares de contraste y topes de textura.
> - `docs/specs/002-poster-visual/design.md` — base histórica de lo que la 003 no redefine.

## Resumen operativo
- **Tokens** (`@theme` en `src/app/globals.css`): `carbon` #141414 (fondo), `carbon-2` #1D1D1D (módulos), `bone` #E9E4D8 (texto y bloque invertido), `bone-2` #A8A398 (solo microtexto), `line` #7A766D (marcos), `accent` #EE5583 (único acento; nunca como texto ni borde sobre `bone`: 2,64:1).
- **Tipografía** (`src/app/fonts.ts`): Anton (titulares, mayúsculas), Work Sans (cuerpo, ≥ 16 px), IBM Plex Mono (microtexto 12 px con tracking). Las variables van en `<html>`.
- **Forma:** marcos de línea fina (1 px), radio 16/12/8, sin sombras ni degradados ni tarjetas dentro de tarjetas. Bloques invertidos marcados con `data-block` (**máx. 2 por página, no consecutivos**): `bone` con texto carbon (Featured en Home, Projects en Trabajo, Achievements en Sobre mí) y Contact (`accent` a sangre, **todo el texto en carbon**, nunca bone sobre acento). El Hero es a pantalla completa y sin marco.
- **Movimiento:** `transform` y `opacity` (y `--p` de los filetes), catálogo cerrado M1–M8; respeta `prefers-reduced-motion` y el contenido es visible por defecto. GSAP + ScrollTrigger (`src/animation/`, cargados con `import()` desde `PageMotion`): entrada del Hero, foto con scrub, revelado de secciones, filetes, apertura del Lab y telón de página. En CSS: hover/press/foco, pegatina que gira (`-6°` → `-12°`), parallax decorativo con `animation-timeline: view()`, cinta y sello. `CountUp` cuenta solo enteros de `facts.ts`. Una sola fuente por nodo; Framer Motion no anima nada.
- **Imágenes:** duotono con `DuoImage` (capas `.duo-*` en `globals.css`), grano estático a 0,26 y punteado `duo-dots`.
- **Texturas y ornamentos:** capas vacías `.tex*` (punteado, papel arrugado) y SVG de `Ornaments.tsx` (`Star4`, `Checker`, `RingMarks`, `Parallax`): decorativos, `aria-hidden`, un solo color y **nunca debajo de texto**; borde rasgado `.torn-top` en Contact.
- **Fichas:** `[EXP. 01]` (elemento), `[03]` (sección, posición dentro de su página en `PAGE_SECTIONS`) y `[02/03]` (página) con `formatFicha`, `formatPageSectionFicha` y `formatPageIndex`.

No reintroduzcas colores, fuentes ni sombras fuera de este contrato; cualquier cambio visual pasa por `/tc-design`.
