# aldair.me — Portfolio de Jostin Aldair Nava López

Repo del portafolio personal, en actualización activa como parte de una búsqueda de empleo
urgente. El contexto completo de esa búsqueda (CV maestro, banco de keywords, tracker de
aplicaciones) vive en un workspace separado:
`C:\Proyectos Personales\tech-consultant\projects\trabajo\`. Este archivo resume lo que una
sesión de Claude Code en ESTE repo necesita saber sin tener que abrir ese otro workspace.

## Quién es Jostin

- **Data Analyst & Automation Developer @ PlayOut Kids** (2025–presente, empresa de reventa de
  equipamiento para parques): lideró recuperación de datos históricos de ventas (40%→100% de
  concordancia), diseñó bases de datos de control maestro (embarques, inventario, ventas,
  finanzas) para forecasting de demanda, construyó dashboards adoptados por 6 departamentos
  (comercial, operaciones, e-commerce, web, finanzas, liderazgo), automatizó workflows en
  monday.com (alertas inteligentes, auto-asignación, triggers de estado), y montó pipelines ETL
  en Python + QA automatizado para el sitio de e-commerce.
- **Junior Frontend Developer @ GH2 Systems** (2025): React, TypeScript, Next.js, React Router 7,
  SSR, lógica de precios en tiempo real, APIs REST, Material UI, Vite.
- Formación: Ingeniería de Software (en curso, UCNL), Física (incompleta, UANL), Técnico Superior
  en Mecatrónica Industrial (EIAO-UANL).
- Voluntariado: FIRST Robotics FRC TIGRES 6652 — coordinación administrativa (no es experiencia
  profesional, no debe mezclarse en el copy del sitio como si lo fuera).
- **Objetivo inmediato:** conseguir empleo remoto (pagado en USD) como Data Analyst / BI /
  Automation Analyst lo antes posible — es la motivación detrás de esta actualización.

Detalle completo (bullets cuantificados, variantes de resumen profesional, keywords ATS) en
`.claude/skills/portfolio/references/positioning.md`.

## Qué es este repo

Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + Framer Motion. Portafolio de una sola
página (`/`) con secciones Hero → About → Projects → Contact, formulario de contacto vía EmailJS.
Deploy en Vercel: https://aldairdev.vercel.app

## Diagnóstico actual (por qué se está actualizando)

1. **Posicionamiento desalineado.** El copy actual (`Hero.tsx`, `About.tsx`) lo presenta como
   *"Scientific Programmer & Junior Data Analyst"* enfocado en física y métodos numéricos. Su
   experiencia real y su búsqueda actual apuntan a Data Analyst / BI / Automation. Un reclutador
   que lea el portafolio y luego el CV va a notar la discrepancia — y el portafolio es lo que
   pierde, porque el CV es lo más fuerte que tiene ahora mismo.
2. **Los proyectos mostrados no representan su nivel real.** De los 9 proyectos listados en
   `Projects.tsx`, la mayoría son ejercicios académicos (curve fitting, root finding, Blackjack
   CLI, scripts de Fortran) — nada muestra su trabajo real de datos, automatización o dashboards,
   que es justo lo que un reclutador de estos roles quiere ver.
3. **Plantilla muy reconocible → ya en rediseño.** El sistema visual original (fondo `#0a192f`,
   acento `#64ffda`, tarjetas `#112240`, tipografía mono para acentos) era una réplica cercana del
   portafolio de Brittany Chiang. Decisión tomada (2026-08-19): rediseño con estética **bento
   grid** (colores planos, tipografía Black/Heavy, contenedor cápsula). Spec completo en
   `.claude/skills/portfolio/references/bento-design-spec.md`, plan de ejecución en `roadmap.md`
   Track A.
4. **Bug menor:** `About.tsx` tiene un elemento vacío al final del array `technologies` (línea 19).

Ver `roadmap.md` para el plan completo.

## Reglas de trabajo en este repo

- Antes de escribir código, confirma que el cambio está contemplado en `roadmap.md` o pregunta si
  no lo está — no lo trates como una sesión libre de "código lo que se te ocurra".
- No inventes métricas ni proyectos que no existan. Todo dato cuantitativo en el copy debe salir
  de `.claude/skills/portfolio/references/positioning.md` o ser confirmado con Jostin primero.
- Mantén el build verde: corre `npm run lint` (y `npm run build` para cambios grandes) antes de
  dar por terminado un cambio de código.
- Cambios de contenido/copy y cambios de diseño/lógica van en commits separados cuando sea
  razonable — facilita revertir si el copy necesita otra vuelta.
- No agregues dependencias nuevas sin justificarlo: el stack se mantiene ligero y con hosting
  gratuito (Vercel free tier), sin presupuesto para servicios de pago.

## Dónde está cada cosa

- `roadmap.md` — plan de actualización: triage inmediato de contenido, refresco visual, y los 2
  proyectos nuevos que se van a construir para reforzar el portafolio.
- `.claude/skills/portfolio/SKILL.md` — skill activa para trabajar en este repo (sistema de
  diseño actual, checklist para agregar un case study, guardrails de contenido).
- `.claude/skills/portfolio/references/positioning.md` — versión condensada del CV maestro y
  banco de keywords, para tailorear copy sin depender del otro workspace.
- `.claude/skills/portfolio/references/bento-design-spec.md` — spec del rediseño visual objetivo
  (paleta, tipografía, layout, componentes) — fuente de verdad para Track A.
- `.claude/skills/portfolio/references/design-system.md` — sistema visual anterior (legado), solo
  como referencia de qué se está reemplazando.
