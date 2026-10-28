# feat(design): identidad visual póster

## Qué y por qué
Sustituye el sistema visual bento de la 001 por la identidad póster (carbon/bone/accent, tipografía display, sello giratorio, marquee de créditos con pausa, duotono, 404 global bilingüe) y retira `Particles`, `ogl`, `404.png` y `story.pdf`. Contenido, rutas, anclas y metadatos de la 001 no cambian, salvo las enmiendas escritas en la spec.

**Spec:** `docs/specs/002-poster-visual/spec.md` · **Riesgo:** R2 · **Componentes:** web

## Evidencia
- Gate: `node scripts/tc-verify.mjs --all` → **PASS** (commit `38c0bff`): lint, typecheck, 106/106 pruebas, build, specs y secretos. Integración: no configurada.
- Check `contact` del arnés visual sobre el build final: 4/4 PASS (en/es × 320/1280).
- Validación por criterio: `docs/specs/002-poster-visual/validation.md` (PASS-PENDIENTES)
- Review independiente: `docs/specs/002-poster-visual/review.md` → APPROVE, sin BLOCKER/MAJOR; los MINOR 1–4 (prueba de `statusAfterEdit`, enmienda de la spec, check `contact`, `<title>` del 404) se cerraron antes del PR.

## Pendientes humanos
- [ ] Revisión visual de capturas (solo se versiona una selección en `screens/`)
- [ ] Recorrido con teclado y lector de pantalla; Safari y Firefox
- [ ] Aprobación de la composición del hero y de las aceptaciones de diseño de `plan.md` §9
- [ ] Medir el respaldo de Anton en Android/Linux (solo medido en Windows)
- [ ] Riesgo conocido: si falla la hidratación, el botón de pausa del marquee se ve pero no responde

## Despliegue y vuelta atrás
Despliegue estático habitual de la rama `master`. Vuelta atrás: revertir el merge; no hay migraciones ni datos.

## Revisores requeridos por riesgo
R2: 1 + review de IA (hecha, APPROVE)

## Checklist del autor
- [x] Sin secretos ni TODO/debug residuales · [x] Docs/ADR al día · [x] Divergencias del plan anotadas
