# Sistema de diseño ANTERIOR (legado — en proceso de reemplazo)

> **2026-08-19 — Superado por el rediseño bento grid.** Track A del roadmap ya no es "conservar
> vs. rediseñar": se decidió rediseñar con la dirección visual documentada en
> `bento-design-spec.md`, que es ahora la fuente de verdad para trabajo visual nuevo. Este
> archivo se conserva solo como referencia de qué se está reemplazando (útil para no dejar
> restos del sistema anterior a medias — colores navy/teal, sombras con glow, etc.).

Documentado a partir del código real (`src/components/*.tsx`) tal como estaba antes del rediseño.

## Paleta

| Token | Hex | Uso |
|---|---|---|
| Fondo base | `#0a192f` | body, fondo de secciones |
| Fondo de tarjeta | `#112240` | cards, inputs |
| Borde | `#1e2a4a` / `#233554` | bordes de cards, separadores |
| Acento | `#64ffda` | links, hover, CTAs, badges de tech, números de sección |
| Texto principal | `#ccd6f6` | headings, nombres |
| Texto secundario | `#8892b0` | body copy, descripciones |
| Error | `#ff4d4f` | toast de error en el form de contacto |

## Tipografía

- Sans-serif para body copy (default de Tailwind/Next).
- `font-mono` para: acentos ("Hi, my name is", números de sección "01.", "02.", badges de tech,
  labels de formulario) — es el mismo patrón que brittanychiang.com y la mayoría de sus clones.

## Patrones de layout

- Secciones full-width con `max-w-4xl` o `max-w-6xl` centrado, padding `px-6 lg:px-8`.
- Header de sección: número monoespaciado + título + línea horizontal (`01. About Me ————`).
- Cards con `border` sutil que se ilumina a `border-[#64ffda]/50` en hover, más
  `-translate-y-1.5` y sombra con glow del acento.
- Animaciones de entrada con Framer Motion: `opacity 0→1`, `y: 20→0`, disparadas por
  `whileInView` con `viewport={{ once: true }}` — patrón consistente en todas las secciones.
- Fondo de partículas animadas (`Particles.tsx`, basado en `ogl`) solo en el Hero.

## Componentes reutilizables existentes

- `ProjectCard` (dentro de `Projects.tsx`) — dos variantes: `featured` (grande, con imagen) y
  normal (grid de 3 columnas). Reutilizar esta lógica para los 2 proyectos nuevos en vez de crear
  un componente paralelo.

## Riesgo a decidir conscientemente

Esta paleta + tipografía + estructura de secciones es una réplica muy cercana del portafolio de
Brittany Chiang (brittanychiang.com), uno de los templates de dev-portfolio más clonados que
existen — cualquier reclutador técnico o dev que revise muchos portafolios lo va a reconocer al
instante. Opciones (desarrolladas en `roadmap.md` Track A):

1. **Conservar la estructura, personalizar lo suficiente** (paleta propia, tipografía propia,
   micro-interacciones distintas) — más rápido, sigue siendo un sistema probado.
2. **Rediseño con identidad propia** — más tiempo, mayor diferenciación.

**Decisión ya tomada:** se va con rediseño (bento grid). Ver `bento-design-spec.md` y
`roadmap.md` Track A para la ejecución. No mezclar patrones de este sistema anterior (sombras con
glow, paleta navy/teal) con el nuevo sistema durante la migración — auditar y quitar, no apilar.
