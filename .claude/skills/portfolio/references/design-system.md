# Sistema de diseño vigente

> Sistema póster con carácter propio (spec 003, 2026-10), sobre la base de la 002. La fuente de verdad es:
> - `docs/design/DESIGN.md` — dirección visual (póster oscuro, un acento saturado, línea fina, textura y ornamentos).
> - `docs/specs/003-poster-caracter/design.md` — contrato vigente: tokens, pares de contraste, composición, estados, movimiento.
> - `docs/specs/002-poster-visual/design.md` — base histórica de lo que la 003 no redefine.

## Resumen operativo
- **Tokens** (`@theme` en `src/app/globals.css`): `carbon` #141414 (fondo), `carbon-2` #1D1D1D (módulos), `bone` #E9E4D8 (texto y bloque invertido), `bone-2` #A8A398 (solo microtexto), `line` #7A766D (marcos), `accent` #EE5583 (único acento; nunca como texto ni borde sobre `bone`: 2,64:1).
- **Tipografía** (`src/app/fonts.ts`): Anton (titulares, mayúsculas), Work Sans (cuerpo, ≥ 16 px), IBM Plex Mono (microtexto 12 px con tracking). Las variables van en `<html>`.
- **Forma:** marcos de línea fina (1 px), radio 16/12/8, sin sombras ni degradados ni tarjetas dentro de tarjetas. Bloques invertidos marcados con `data-block` (máx. 2, no consecutivos): Projects (`bone`, texto carbon) y Contact (`accent` a sangre, **todo el texto en carbon**, nunca bone sobre acento).
- **Movimiento:** solo `transform` y `opacity`, catálogo cerrado; respeta `prefers-reduced-motion`. En CSS: letras del nombre escalonadas (200 ms, paso 18 ms), pegatina que gira (`-6°` → `-12°`), parallax decorativo con `animation-timeline: view()` y vista previa del Lab. JS mínimo: `CountUp` (solo enteros de `facts.ts`) y el seguimiento vertical de la vista previa. Framer Motion no se usa.
- **Imágenes:** duotono con `DuoImage` (capas `.duo-*` en `globals.css`), grano estático a 0,26 y punteado `duo-dots`.
- **Texturas y ornamentos:** capas vacías `.tex*` (punteado, papel arrugado) y SVG de `Ornaments.tsx` (`Star4`, `Checker`, `RingMarks`, `Parallax`): decorativos, `aria-hidden`, un solo color y **nunca debajo de texto**; borde rasgado `.torn-top` en Contact.
- **Fichas:** `[EXP. 01]` (elemento) y `[03]` (sección, índice real en `SECTION_IDS`) con `formatFicha` / `formatSectionFicha`.

No reintroduzcas colores, fuentes ni sombras fuera de este contrato; cualquier cambio visual pasa por `/tc-design`.
