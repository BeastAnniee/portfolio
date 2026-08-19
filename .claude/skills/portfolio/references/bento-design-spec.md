# Spec de diseño objetivo — Bento Grid

> Fuente de verdad para el rediseño visual (Track A del roadmap). Reemplaza a
> `design-system.md` como sistema objetivo — `design-system.md` queda como referencia del
> sistema ANTERIOR (navy/teal, clon de brittanychiang.com), útil solo para saber qué se está
> reemplazando.

Dirección de diseño dada por Jostin (parafraseada, no copiar literal ningún bento portfolio
existente — usar como dirección, no como plantilla a clonar):

> Estética bento grid moderna, inspirada en un estilo bento box tipo dashboard/portfolio.

## Paleta (colores planos, uno por tarjeta — sin degradados salvo un halo decorativo puntual)

| Token | Hex | Uso previsto |
|---|---|---|
| `bg-page` | `#E2E2E2` | fondo de la página, detrás del contenedor cápsula |
| `bg-container` | `#F6F6F6` | fondo del contenedor cápsula / tarjetas neutras |
| `purple-primary` | `#8184D2` | tarjetas de acento primario, CTAs |
| `purple-deep` | `#8E6FBE` | variación de acento, evitar usarlo junto a `purple-primary` en la misma vista sin separación clara |
| `mint` | `#A9D9D7` | tarjetas secundarias, tags de tech |
| `amber` | `#FEC267` | tarjetas "stat", alertas visuales, highlights |
| `graphite` | `#585858` | texto secundario sobre fondos claros |
| `black` | `#000000` | texto principal, alto contraste |
| `lilac-accent` | `#EFAEFF` | acento puntual — halos decorativos detrás de fotos, NO como fondo grande de texto sin verificar contraste |

**Regla dura del spec:** un color plano por tarjeta. Sin degradados, excepto el halo decorativo
descentrado detrás de fotos (ese sí puede tener un blur/gradiente suave).

## Tipografía

- **Display/títulos:** sans-serif geométrica, peso Black/Heavy, tracking ajustado.
  - Recomendado para implementación rápida: **Bricolage Grotesque** (Google Fonts, OFL, carga
    directa vía `next/font/google`, tiene ejes variables incluyendo peso Black).
  - Alternativas del spec original (Clash Display, General Sans Black) están en Fontshare —
    licencia gratis para uso comercial pero requieren auto-hospedar los archivos de fuente. Dejar
    como mejora opcional post-lanzamiento, no bloquear el rediseño por esto.
- **Body/UI:** grotesca neutra.
  - Recomendado para implementación rápida: **Inter** (Google Fonts, ya common en el ecosistema
    Next.js, cero fricción).
  - Alternativas del spec (General Sans, Satoshi) — mismo tema de auto-hosting que arriba.
- **Números/stats:** peso más pesado disponible de la fuente display, con un label pequeño debajo
  en la fuente body — patrón a implementar en las tarjetas "stat" (ver Componentes).

## Layout

- **Contenedor cápsula único:** envuelve todo el diseño, `border-radius` grande (~32-40px).
- **Grid bento asimétrico interno:** tarjetas de tamaños desiguales, radio ~20-24px, gutter
  constante entre tarjetas.
- **Sin sombras realistas:** la jerarquía viene del contraste de color plano entre tarjetas, no de
  elevación/`box-shadow`. Esto es un cambio explícito respecto al sistema anterior, que sí usaba
  glow/shadow en hover.

## Componentes

- **Glifo ↗ en círculo:** esquina superior derecha de tarjetas interactivas/con link — reemplaza
  el ícono de GitHub como affordance de "clickeable" en `ProjectCard`.
- **Fotos en duotono/escala de grises:** recortadas en círculo, con halo de color descentrado
  detrás (usar `lilac-accent` o `mint` como candidatos para el halo).
- **Sello/badge circular con texto curvo:** elemento firma del diseño — usar con moderación, un
  único elemento así por vista, no repetirlo en cada tarjeta.
- **Tarjeta "stat":** número enorme arriba (peso Black/Heavy), label pequeño debajo, fondo de
  color plano de la paleta. Usar con métricas reales de
  `references/positioning.md` (ej. "6 departamentos", "40%→100% concordancia de datos") — nunca
  con números de relleno.

## Requisitos no negociables

- Responsive hasta mobile — el grid bento debe colapsar a algo legible en pantallas chicas, no
  solo "encogerse".
- Focus visible por teclado en todo elemento interactivo.
- Respetar `prefers-reduced-motion` — las animaciones de Framer Motion existentes deben
  desactivarse/reducirse cuando el usuario lo pide a nivel de sistema/navegador.

## Cómo usar este spec en una sesión de desarrollo

1. Leer este archivo completo antes de tocar cualquier componente visual.
2. (Opcional pero recomendado) Usar el skill `design` de Claude Code para maquetar el grid bento
   como canvas antes de escribir Tailwind/React — más rápido iterar visualmente que por
   prueba-y-error en el navegador.
3. Para las tarjetas "stat", el skill `dataviz` de Claude Code tiene guías de forma/color para
   stat tiles y KPI — útil incluso fuera de contexto de gráficas, aplica directo al patrón
   "número enorme + label".
4. Seguir el checklist de ejecución en `roadmap.md` (Track A) — no saltarse el paso de mapear qué
   tarjeta usa qué color antes de codear.

## Nota sobre skills de terceros para bento grid

Existen plugins/skills de terceros en marketplaces de la comunidad de Claude Code enfocados en
bento grids (búsqueda hecha 2026-08-19): un skill de "Layout and Composition" con patrones de CSS
Grid/bento en mcpmarket.com, un generador de tarjetas bento estilo Apple
(`hubeiqiao/apple-bento-grid` en GitHub), un skill "bento" de TypeUI, y paquetes más amplios como
`ui-ux-pro-max` que incluyen bento entre 50 estilos. Ninguno se instaló aquí: son skills de
terceros no verificados por Anthropic, y un skill instalado puede inyectar instrucciones que se
siguen en cada sesión — instalar solo si Jostin revisa el código fuente primero y decide que vale
el riesgo. Con el skill `design` + `dataviz` (ambos first-party, ya disponibles) alcanza para
ejecutar este spec sin depender de una skill de terceros.
