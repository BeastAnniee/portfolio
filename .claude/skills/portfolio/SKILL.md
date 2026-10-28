---
name: portfolio
description: >
  Guía de trabajo para actualizar el portafolio personal de Jostin Nava (aldair.me) — un repo
  Next.js/TypeScript/Tailwind real, no un ejercicio de planeación. ALWAYS activate cuando se
  trabaje en este repo: cambios de copy/posicionamiento, actualización o adición de proyectos
  mostrados, cambios visuales/de diseño, o cuando se abra este proyecto y se pida continuar el
  roadmap. Cubre: guardrails de contenido (qué se puede afirmar sobre su experiencia y qué no),
  el sistema de diseño actual, y el checklist para agregar un proyecto nuevo como case study.
---

# Portfolio de Jostin Nava — Guía de trabajo

Este repo es el producto final, no un documento de planeación. A diferencia del workspace
tech-consultant (donde el output es siempre un roadmap), aquí SÍ se escribe código — pero
siempre en función de lo acordado en `roadmap.md`, nunca improvisando alcance nuevo a mitad de
sesión sin decirlo primero.

## Antes de tocar nada

1. Lee `CLAUDE.md` (contexto de quién es Jostin y diagnóstico actual) si no lo tienes ya en
   contexto.
2. Lee `roadmap.md` para saber en qué fase está el trabajo.
3. Si el pedido no calza claramente con una tarea del roadmap, pregunta antes de improvisar
   alcance nuevo.

## Guardrails de contenido (lo más importante de este skill)

- Todo bullet, cifra o claim sobre experiencia profesional sale de
  `references/positioning.md` — no de la memoria del modelo ni de inferencia genérica.
- Si un dato cuantitativo no está en `positioning.md` (ej. "¿cuántos registros procesa el ETL?"),
  NO lo inventes — pon un placeholder visible tipo `[CONFIRMAR: volumen del ETL]` y pregúntale a
  Jostin, o dilo explícitamente en la respuesta.
- El título/pitch principal es **Software Engineer con enfoque en datos y automatización** — no
  "Scientific Programmer" ni "Data Analyst" como título, ni física como eje central.
  Física/mecatrónica van en "background", no en el hero.
- El voluntariado (FIRST Robotics) nunca se mezcla con experiencia profesional — sección aparte
  si aparece.

## Sistema de diseño

El sistema vigente es el **póster oscuro** de la spec 002 (carbón, hueso y un solo acento rosa;
Anton + Work Sans + IBM Plex Mono; marcos de línea fina, sin sombras ni degradados). La fuente de
verdad es `docs/design/DESIGN.md` y el contrato `docs/specs/002-poster-visual/design.md`;
`references/design-system.md` los resume. Cualquier trabajo visual nuevo respeta esos tokens y
pasa por `/tc-design`; no mezcles restos de sistemas anteriores.

- Usa el skill `dataviz` de Claude Code para visualizaciones de datos si aparecen.
- No instales skills de terceros para diseño sin que Jostin revise el código fuente primero: un
  skill de terceros puede inyectar instrucciones que se siguen en cada sesión.

## Checklist para agregar un proyecto nuevo a `Projects.tsx`

Cuando uno de los 2 proyectos nuevos del roadmap (o cualquier proyecto futuro) esté listo para
mostrarse:

1. **Case study, no changelog.** La descripción debe seguir problema → qué hiciste → resultado
   medible. Nunca una lista de features.
2. **Tech tags reales** — solo lo que efectivamente se usó, en el mismo formato que las tarjetas
   existentes (`tech: string[]`).
3. **Imagen o GIF real del proyecto funcionando** en `public/`, nunca un placeholder tipo
   `404.png` en un proyecto featured — si no hay screenshot todavía, no se sube a "featured".
4. **Link a GitHub con README propio** que cuente la misma historia (problema → approach →
   resultado), porque el reclutador que hace clic en "View Code" va a leer el README antes que el
   código.
5. **Decide featured vs. other:** los 2 proyectos nuevos del roadmap deben terminar como
   `featured` (reemplazando a los actuales que son ejercicios académicos). Los proyectos
   académicos existentes bajan a "other" o se retiran — no se agregan proyectos nuevos sin quitar
   nada, o la sección vuelve a diluirse.

## Reglas de calidad de código

- `npm run lint` limpio antes de cerrar cualquier cambio de código.
- No romper el build (`npm run build`) en cambios que toquen componentes compartidos o config.
- No agregar dependencias nuevas sin justificar por qué no alcanza con lo ya instalado
  (Next, React, Tailwind, Framer Motion, lucide-react ya cubren la mayoría de necesidades de UI).
