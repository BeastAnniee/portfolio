---
type: adr
status: accepted
date: 2026-10-27
decide: Jostin Aldair Nava
reversibility: easy
spec: "[[specs/002-poster-visual/spec]]"
---
<!-- status: proposed | accepted | superseded | rejected · reversibility: easy | costly | irreversible · spec: enlace opcional, p. ej. "[[specs/003-x/spec]]" -->
# ADR-0001 · Retirar `Particles.tsx` y la dependencia `ogl`

## Contexto
- `src/components/Particles.tsx` es un fondo WebGL de partículas que importa `ogl` (`^1.0.11`, dependencia directa en `package.json`).
- Ningún archivo de `src/` lo importa: solo se referencia a sí mismo. Es código muerto desde el sistema bento (verificado con `grep` el 2026-10-27).
- La spec 002 fija una dirección visual de póster impreso: textura de **grano estático y decorativo**, sin grano animado, y movimiento limitado a `transform`/`opacity` (REQ-8, REQ-12). Un fondo WebGL animado queda fuera de ese catálogo y contradice `prefers-reduced-motion` y el presupuesto de JS (NF-1).
- `DESIGN.md` §4 marca su retiro como «fase propia» que requiere ADR. La constitución P8 exige ADR para toda dependencia nueva; este ADR documenta además el retiro para dejar rastro.
- La 002 incluye el retiro (REQ-20, AC-18) por decisión de la persona.

## Criterios de decisión
1. Mantenibilidad: no conservar código muerto ni una dependencia sin uso.
2. Rendimiento y accesibilidad: no arrastrar WebGL ni su peso al bundle.
3. Coherencia con la dirección visual aprobada.
4. Reversibilidad: poder recuperarlo si se necesitara.

## Opciones
### A. Retirar `Particles.tsx` y `ogl`
- Pros: elimina código muerto y una dependencia; reduce superficie de mantenimiento y de auditoría de vulnerabilidades; coherente con la spec 002; el bundle no crece (NF-1).
- Contras: si algún día se quisiera un efecto WebGL habría que reintroducirlo (con su propio ADR).

### B. Mantenerlos sin usar
- Pros: cero trabajo.
- Contras: dependencia y archivo muertos que `npm audit` y futuras actualizaciones seguirán arrastrando; confunde sobre qué es parte del sistema visual.

### C. Reutilizar `Particles` en el nuevo diseño
- Pros: conserva un efecto ya escrito.
- Contras: choca con «grano animado» excluido, con la restricción de movimiento (solo `transform`/`opacity`) y con `prefers-reduced-motion`; añade coste de GPU en móviles de gama baja; no lo pide el contrato visual.

## Decisión
**Opción A (aceptada por la persona el 2026-10-27).** Retirar `src/components/Particles.tsx` y quitar `ogl` de `package.json` y del lockfile, sin sustituto. Es la única opción coherente con la spec 002 y no pierde nada en uso.

## Consecuencias
- Más fácil: un bundle y un árbol de dependencias más pequeños; menos ruido en auditorías.
- Más difícil: reintroducir WebGL requerirá un nuevo ADR.
- Verificación: AC-18 (sin archivo, sin dependencia, sin referencias) y AC-21/NF-1 (JS de primera carga no mayor que `master`); `node scripts/tc-verify.mjs --all` en verde.
- Reversión: `git revert` del commit de retiro restaura archivo y dependencia sin costo.
- Revisión: no requiere; se reabre solo si aparece un requisito visual que pida WebGL.
- Los textos que aún mencionan `Particles`/`ogl` en `.claude/skills/portfolio/references/` se actualizan con REQ-21.
