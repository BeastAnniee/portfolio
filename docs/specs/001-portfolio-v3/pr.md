# feat(web): portafolio v3 con contenido bilingüe y nueva arquitectura de información

## Qué y por qué
El sitio contradecía al CV 2026 en posicionamiento y nombre. Este PR añade una capa de contenido EN/ES alineada con el CV, rutas `/[lang]` con redirección por `Accept-Language`, y las secciones Experience, Now, Projects, Lab, Stack, Education, Achievements y Contact.

**Spec:** `docs/specs/001-portfolio-v3/spec.md` · **Riesgo:** R2 · **Componentes:** web

## Evidencia
- Gate: `node scripts/tc-verify.mjs --all` → **PASS** (lint, typecheck, 59/59 tests, build, specs, secretos; integración no configurada). Detalle en `validation.md`.
- Validación por criterio: `docs/specs/001-portfolio-v3/validation.md` (PASS-PENDIENTES)
- Review independiente: `docs/specs/001-portfolio-v3/review.md` → APPROVE, sin BLOCKER/MAJOR abiertos

## Gates manuales pendientes
- [ ] Revisar el copy ES y el término «POPs»
- [ ] Confirmar «Semifinalista con FRC TIGRES 6652»
- [ ] Probar `Accept-Language` y que el CDN respete `Vary` en el preview de Vercel
- [ ] Envío real del formulario y prueba con la red cortada
- [ ] Recorrido con teclado y lector de pantalla; emular `prefers-reduced-motion`
- [ ] Decidir sobre el contraste del titular del hero (3,76:1 / 3,14:1; cumple como texto grande)
- [ ] Comprobar `textLength` sobre `<textPath>` en Safari y Firefox
- [ ] Reemplazar `public/resume.pdf` cuando existan los CV corregidos

## MINOR abiertos de la review
- `<Footer>` dentro de `<main>` (sin landmark `contentinfo`)
- `README.md:51` menciona `About.tsx`
- Sin JavaScript, el menú móvil y Lab no abren
- Sin tests de `ProjectCard` ni del middleware
- Reenvío tras timeout de EmailJS puede duplicar el mensaje
- `public/404.png` y `public/story.pdf` sin uso

## Despliegue y vuelta atrás
Vercel despliega al hacer merge; el preview de la rama sirve para validar antes. Rollback: revertir el merge o promover el deployment anterior.

## Revisores requeridos por riesgo
R2: 1 revisor humano + review de IA (hecha).

## Checklist del autor
- [x] Sin secretos ni TODO/debug residuales · [x] Docs al día · [x] Divergencias del plan anotadas
