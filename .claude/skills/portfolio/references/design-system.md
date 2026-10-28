# Sistema de diseño vigente

> Reemplaza al sistema anterior (spec 002, 2026-10). La fuente de verdad es:
> - `docs/design/DESIGN.md` — dirección visual (póster oscuro, un acento, línea fina).
> - `docs/specs/002-poster-visual/design.md` — contrato: tokens, pares de contraste, composición, estados, movimiento.

## Resumen operativo
- **Tokens** (`@theme` en `src/app/globals.css`): `carbon` #141414 (fondo), `carbon-2` #1D1D1D (módulos), `bone` #E9E4D8 (texto y bloque invertido), `bone-2` #A8A398 (solo microtexto), `line` #7A766D (marcos), `accent` #F29BB0 (único acento; nunca como texto sobre `bone`).
- **Tipografía** (`src/app/fonts.ts`): Anton (titulares, mayúsculas), Work Sans (cuerpo, ≥ 16 px), IBM Plex Mono (microtexto 12 px con tracking). Las variables van en `<html>`.
- **Forma:** marcos de línea fina (1 px), radio 16/12/8, sin sombras ni degradados ni tarjetas dentro de tarjetas; un solo bloque invertido (Projects).
- **Movimiento:** solo `transform` y `opacity`, todo en CSS, catálogo cerrado; respeta `prefers-reduced-motion`.
- **Imágenes:** duotono con `DuoImage` (capas `.duo-*` en `globals.css`) y grano estático.

No reintroduzcas colores, fuentes ni sombras fuera de este contrato; cualquier cambio visual pasa por `/tc-design`.
