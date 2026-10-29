# feat(design): rediseño con carácter propio (spec 003)

## Qué y por qué
Lleva el sistema póster de la 002 a una versión con carácter propio: acento saturado `#EE5583`, grano más fuerte, punteado y papel arrugado, borde rasgado, ornamentos SVG, pegatina rotada, fichas `[EXP. 01]` / `[03]`, cifras que cuentan, vista previa del Lab y parallax decorativo. Contact pasa a ser un bloque de acento a sangre. La persona lo consideraba aún tímido tras revisar 23 referencias.

**Spec:** `docs/specs/003-poster-caracter/spec.md` · **Riesgo:** R2 · **Componentes:** web

## Evidencia
- Gate: `node scripts/tc-verify.mjs --all` → **PASS** (lint, tipos, 156 tests, build; integración no configurada). Rama en `8cfa08e`.
- First Load JS de `/[lang]`: 118 kB (presupuesto ≤ 126 kB; línea base 116 kB). `package.json`, `package-lock.json` y `facts.ts` sin diff.
- Arnés visual en Chrome (`scripts/visual-check.mjs`, EN/ES, 320–1280 px): 0 FAIL en los grupos ejecutados (checks nuevos de la 003, `hero`, `blocks`, `lab`, contraste, JS desactivado, reduced-motion, forced-colors, red bloqueada, CLS, fuentes).
- Capturas clave en `docs/specs/003-poster-caracter/screens/`.
- **Validación (`validation.md`) y review (`review.md`): NO realizadas, omitidas por indicación expresa de la persona** para registrar esta versión como estable antes de abrir la spec 004. No hay veredicto PASS formal; `tc-spec-lint` avisa (modo warn) de `VALIDATION_MISSING` y `REVIEW_MISSING`.

## Gates manuales pendientes
- [ ] `/tc-validate 003` y `/tc-review 003` (omitidos)
- [ ] Check `contact` del arnés (estados de error, enviando, éxito y fallo): requiere `next dev` con `NEXT_PUBLIC_EMAILJS_*` ficticias; no se ejecutó
- [ ] Capturas completas de §8 (reduced-motion, forced-colors, JS desactivado, `hover: none`, zoom 200 %, 404)
- [ ] Recorrido con teclado y lector de pantalla; Safari y Firefox (`animation-timeline`, `mix-blend-mode`, `clip-path`)
- [ ] Aprobación visual de la composición del Hero, de Contact y del papel arrugado
- [ ] Decisión sobre `--cut`: con `.07em` el recorte del nombre apenas se nota (se come ≤ 0,4 % de la versal)

## Despliegue y vuelta atrás
Sitio estático en Vercel. PR → despliegue de vista previa → merge humano → producción. Vuelta atrás: «Promote» del despliegue anterior o `git revert -m 1 <merge>`; respaldos parciales: `--d-full: 0` (parallax), retirar `.tex-paper`, `--cut: 0`.

## Revisores requeridos por riesgo
R2: 1 + review de IA (pendiente de ejecutar)

## Divergencias respecto al plan (ver §9 del plan)
Foto del Hero sin cambio a color con hover/foco; Contact con intro `text-lg font-medium`; capa de punteado dentro de un contenedor; `md:pb-44` en Contact; checks `raster` y `cut` extra; correcciones de `SKILL.md` y `architecture.md`.

## Checklist del autor
- [x] Sin secretos ni TODO/debug residuales · [x] Docs al día · [x] Divergencias del plan anotadas
