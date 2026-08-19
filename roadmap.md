# Roadmap: Actualización del portafolio (aldair.me)

**Objetivo:** convertir el portafolio en una herramienta que sume a la búsqueda de empleo activa,
no que reste puntos — alineando posicionamiento con la experiencia real y reemplazando los
proyectos académicos mostrados por 2 proyectos nuevos que demuestren su nivel real como Data
Analyst / Automation / BI con capacidad full-stack.

**Contexto de fondo:** hay una búsqueda de empleo urgente en curso (ver
`C:\Proyectos Personales\tech-consultant\projects\trabajo\roadmap.md`, objetivo ≤15 días desde
2026-08-13). Esto importa para la secuencia: **no bloquear las aplicaciones esperando a que los
2 proyectos nuevos estén listos.** El triage de contenido (Fase 1) toma horas, no días, y debe
salir ya; los proyectos nuevos corren en paralelo y se suben en cuanto cada uno esté listo.

## Diagnóstico (detalle en `CLAUDE.md`)

1. Posicionamiento desalineado — copy actual vende "Scientific Programmer / Física", la
   experiencia real y la búsqueda actual son Data Analyst / Automation / BI.
2. Proyectos mostrados (`Projects.tsx`) son mayoritariamente ejercicios académicos — nada
   demuestra el trabajo real de datos/automatización/dashboards.
3. Plantilla visual muy reconocible (clon cercano de brittanychiang.com) — decisión pendiente:
   personalizar o rediseñar.
4. Bug menor en `About.tsx` (elemento vacío en el array `technologies`).

## Las tres pistas de trabajo

```
Track A — Refresco visual        (opcional / puede ir después)
Track B — Contenido/posicionamiento  (urgente, primero, rápido)
Track C — 2 proyectos nuevos     (en paralelo, ~1 semana cada uno)
```

---

## Track B — Contenido y posicionamiento (hacer PRIMERO — horas, no días)

**Por qué primero:** es lo que resuelve la discrepancia entre CV y portafolio, y no depende de
que los proyectos nuevos existan. Un reclutador puede visitar el sitio esta semana.

- [ ] Reescribir `Hero.tsx`: título/subtítulo pasa de "Scientific Programmer & Junior Data
      Analyst" a algo alineado con la Variante A de `positioning.md` (Data Analyst /
      Automation / BI con capacidad full-stack). No copiar el resumen del CV literal — adaptarlo
      a formato de una-dos líneas para hero.
- [ ] Reescribir `About.tsx`: el párrafo actual centra física/métodos numéricos como el eje. Debe
      centrar datos/automatización, mencionar física/mecatrónica como trasfondo que aporta rigor
      (tal como ya está redactado en `positioning.md`), y corregir el bug del array
      `technologies` (línea 19) reordenando la lista con Python/SQL/pandas/monday.com primero.
- [ ] Revisar `Footer.tsx` y metadata (`layout.tsx` — title/description para SEO/redes) por si
      repiten el mismo posicionamiento desalineado.
- [ ] En `Projects.tsx`: bajar de "featured" los proyectos académicos (Archive, Crypto Market
      Analytics CLI) mientras no hay reemplazo listo — no hace falta borrarlos, pueden bajar a
      "other" temporalmente. Dejar "Portfolio" (el sitio mismo) como featured está bien.
- [ ] QA rápido: `npm run lint`, revisar en local que nada se rompió, deploy a Vercel.

**Listo cuando:** el link del portafolio se puede mandar en una aplicación sin que contradiga el
CV.

---

## Track A — Refresco visual: rediseño a estética Bento Grid

**Decisión tomada (2026-08-19):** ya no es "personalizar vs. rediseñar" — Jostin encontró una
dirección de diseño concreta (estética bento grid tipo dashboard, colores planos, tipografía
Black/Heavy) y decidió rediseñar sobre esa base en vez de conservar el clon de
brittanychiang.com. El spec completo vive en
`.claude/skills/portfolio/references/bento-design-spec.md` — es la fuente de verdad para
paleta, tipografía, layout y componentes. Este bloque es el plan de ejecución sobre ese spec.

**Por qué vale la pena pese a la urgencia:** es un cambio de identidad visual real (no un ajuste
de hex), pero acotado — no es un rediseño desde cero de la arquitectura de información (siguen
siendo las mismas secciones: Hero/About/Projects/Contact), así que cabe en unos días, no semanas.
Se secuencia DESPUÉS de Track B (el contenido no puede esperar al rediseño) y puede correr en
paralelo a Track C (los proyectos nuevos no dependen del sistema visual).

### Preparación (antes de tocar componentes)

- [ ] Leer `references/bento-design-spec.md` completo.
- [ ] Fuentes: **Bricolage Grotesque** (display/títulos, pesos Black/Heavy) está en Google Fonts
      con licencia OFL — cargar vía `next/font/google`, cero fricción. **Clash Display** y
      **General Sans** (las otras opciones del spec) están en Fontshare, licencia gratis para uso
      comercial, pero requieren auto-hospedar los archivos (no están en Google Fonts) — para no
      perder tiempo en la primera pasada, usar **Inter** (ya en Google Fonts, grotesca neutra) como
      body/UI en vez de General Sans/Satoshi, y dejar el swap a Fontshare como mejora opcional
      posterior si el resultado visual lo justifica.
- [ ] (Opcional, recomendado) Usar el skill `design` de Claude Code para maquetar el bento grid
      como canvas visual antes de tocar código — permite iterar el layout/paleta/tipografía a
      mano (clic para seleccionar, edición inline) sin gastar ciclos de desarrollo en ajustes de
      spacing por prueba y error. Traducir a Tailwind/React una vez el mockup esté aprobado.
- [ ] Definir el mapeo de color por tarjeta ANTES de codear (evita "parchar" colores sobre la
      marcha): qué sección/tarjeta usa `purple-primary`, cuál `mint`, cuál `amber`, etc. — un
      color plano por tarjeta, sin degradados salvo el halo decorativo puntual del spec.

### Implementación

- [ ] **Contenedor cápsula:** envolver el layout en un contenedor único con `border-radius`
      grande (~32-40px) sobre `bg-page` (#E2E2E2), con el contenido en `bg-container` (#F6F6F6).
- [ ] **Grid bento del Hero/About:** reemplazar el layout de secciones apiladas actual por un
      grid asimétrico de tarjetas (radio ~20-24px, gutter constante) — nombre/título, foto en
      duotono con halo de color descentrado, y 2-3 tarjetas "stat" (número enorme + label chico)
      con las métricas reales de `references/positioning.md` (ej. "6 departamentos", "40%→100%
      concordancia de datos") en vez de placeholders.
- [ ] **Projects como bento:** convertir `ProjectCard` a tarjetas de tamaños desiguales dentro del
      mismo grid, con el glifo ↗ en círculo en la esquina superior derecha de las tarjetas con
      link — reemplaza el ícono de GitHub actual como affordance principal de "esto es
      clickeable".
- [ ] **Badge/sello circular:** un elemento de firma (texto curvo alrededor de un círculo, ej.
      "AVAILABLE FOR WORK ↗" o su nombre) — usarlo con moderación, es un acento, no debe repetirse
      en cada tarjeta.
- [ ] **Eliminar sombras realistas:** la jerarquía visual viene del contraste de color plano entre
      tarjetas, no de `box-shadow`/elevación — auditar y quitar las sombras tipo
      `hover:shadow-xl hover:shadow-[#64ffda]/10` del sistema actual.
- [ ] **Accesibilidad (no negociable, viene en el spec):** estados de foco visibles por teclado en
      todo elemento interactivo (tarjetas, links, form), y respetar `prefers-reduced-motion`
      envolviendo las animaciones de Framer Motion actuales (`whileInView`, `whileHover`) para que
      se desactiven o reduzcan cuando el usuario lo pida a nivel SO/navegador.
- [ ] **Responsive:** el grid bento debe colapsar a una columna legible en mobile — no es un nice
      to have, está en los requisitos del spec.

### QA de cierre

- [ ] Contraste de color (WCAG AA) entre texto y fondo en cada combinación de tarjeta —
      `graphite`/`black` sobre los fondos claros del spec deberían pasar, pero verificar
      explícitamente antes de dar por cerrado, especialmente `lilac-accent` como fondo de texto.
- [ ] `npm run lint` + `npm run build` limpios.
- [ ] Deploy a Vercel, comparar visualmente contra el spec original.

**Listo cuando:** el sitio completo (Hero, About, Projects, Contact) usa el sistema bento grid de
forma consistente, sin restos visuales del sistema navy/teal anterior, y pasa el checklist de
accesibilidad de arriba.

---

## Track C — Dos proyectos nuevos para el portafolio (~1 semana cada uno)

**Criterio de selección:** ambos deben (1) ser construibles en ~1 semana solo, (2) costar $0,
(3) mapear directo a las keywords núcleo de `banco-keywords.md` (Data Analyst, BI, Automation),
(4) usar datos públicos o simulados — nunca datos confidenciales de PlayOut Kids, y (5) ser algo
de lo que pueda hablar con detalle en una entrevista sin inflar nada, porque son proyectos reales
que construyó, no reformulaciones de su trabajo.

**Secuencia recomendada:** construir el Proyecto 1 primero (pega más directo al título "Data
Analyst", que es el núcleo de sus keywords) y subirlo en cuanto esté listo — no esperar a tener
los dos para actualizar el portafolio. El Proyecto 2 arranca apenas termine el 1, o en paralelo
si el tiempo alcanza.

### Proyecto 1 — Demand & Inventory Forecasting Dashboard

**Por qué este:** es el espejo directo (con datos públicos) de lo que ya hizo en PlayOut Kids
—bases de datos de control maestro estructuradas para forecasting de demanda + dashboards
adoptados por 6 departamentos. Demuestra el mismo tipo de pensamiento con un dataset que
cualquier reclutador puede verificar.

**Qué construye:** pipeline de datos que limpia y agrega ventas históricas, genera un forecast de
demanda a nivel SKU/categoría, y lo sirve en un dashboard web con alertas de restock — el mismo
patrón "datos → forecast → alerta operativa" que ya construyó en su trabajo.

**Stack (100% gratis):**
| Capa | Herramienta |
|---|---|
| Dataset | Uno público de Kaggle: "Store Item Demand Forecasting" o el dataset de e-commerce de Olist (evitar datasets con licencia restrictiva para uso comercial/portafolio) |
| ETL / limpieza | Python, pandas |
| Forecasting | Empezar simple: media móvil / suavizado exponencial (statsmodels). Si sobra tiempo: Prophet |
| Salida | JSON/CSV estático — no hace falta backend con DB para un portafolio |
| Frontend | Next.js + TypeScript (mismo stack del portafolio) + Recharts o similar para las gráficas |
| Deploy | Vercel (gratis) |

**Desglose día a día (5-7 días):**
1. **Día 1:** elegir dataset, definir la pregunta de negocio concreta ("¿qué SKUs necesitan
   restock en los próximos 30 días?"), armar el script de limpieza/agregación (diario → semanal).
2. **Día 2:** modelo de forecast, validado contra un periodo de holdout (medir error real, ej.
   MAPE) — esto es lo que da la métrica de resultado para el case study.
3. **Día 3-4:** dashboard en Next.js — gráfica de tendencia + forecast superpuesto, tabla de
   SKUs en riesgo de quiebre de stock, badges de alerta.
4. **Día 5:** pulir UI (loading/empty states, responsive), escribir el README como case study
   (problema → approach → resultado con número real, ej. "% de error de forecast vs. baseline
   ingenuo").
5. **Día 6:** deploy, agregarlo a `Projects.tsx` como featured, capturar screenshot/GIF.
6. **Día 7 (buffer):** QA, sección "cómo lo extendería" en el README (demuestra pensamiento de
   producto, no solo ejecución).

**Mapea directo a keywords:** forecasting, demand forecasting, ETL, data pipeline, dashboard,
BI, Python, pandas, data cleaning.

### Proyecto 2 — Workflow Automation & Alerting Engine

**Por qué este:** espejo del trabajo de automatización en monday.com (alertas inteligentes,
auto-asignación, triggers de estado) pero como herramienta original con reglas configurables —
sin depender de la config confidencial de PlayOut Kids.

**Qué construye:** motor de reglas que ingiere "tickets" u "órdenes" (CSV), aplica reglas de
negocio configurables (asignar dueño por categoría/región, escalar si se rompe un SLA, taggear
estado) y dispara alertas reales a un webhook de Discord/Slack (gratis), con un dashboard de
salud de la cola (SLA cumplido vs. roto, distribución por estado).

**Stack (100% gratis):**
| Capa | Herramienta |
|---|---|
| Motor de reglas | Node.js/TypeScript o Python — reglas como JSON (condición → acción) |
| Ingesta | Upload de CSV (simula el feed de tickets/órdenes) |
| Alertas | Webhook de Discord o Slack (ambos tienen tier gratis para esto) |
| Frontend | Next.js + TypeScript — tabla de cola, % de cumplimiento de SLA, editor/visor de reglas activas |
| Deploy | Vercel (frontend + funciones serverless si el motor corre server-side) |

**Desglose día a día (5-7 días):**
1. **Día 1:** definir el escenario (ej. triage de tickets de soporte) y el esquema de reglas
   (condición → acción).
2. **Día 2:** motor de reglas (asignar, escalar, taggear) + ingesta de CSV, probado con datos de
   ejemplo.
3. **Día 3:** alertas vía webhook cuando se rompe un SLA, simulación de paso de tiempo para poder
   hacer una demo sin esperar horas reales.
4. **Día 4-5:** dashboard — tabla de cola, % de cumplimiento de SLA, filtros, vista de reglas
   activas.
5. **Día 6:** pulir, escribir README como case study cuantificando el resultado (ej. "cola
   simulada de 500 tickets, X% auto-asignados correctamente, Y alertas de SLA disparadas en
   tiempo real").
6. **Día 7 (buffer):** deploy, agregar a `Projects.tsx`, screenshot/GIF de la demo.

**Mapea directo a keywords:** workflow automation, process automation, alerting, trigger-based
workflows, cross-functional automation.

### Bonus opcional (no forma parte del compromiso de 2 proyectos, evaluar si sobra tiempo)

**Job Application Tracker con matching de keywords:** versión pulida del sistema de búsqueda de
empleo que ya está usando (tracker + banco de keywords) — pega una vacante, compara contra
`positioning.md` y marca qué keywords faltan. Doble beneficio: resuelve un problema real suyo
*y* es un tercer proyecto de portafolio con storytelling fuerte ("construí esto porque lo
necesitaba"). Se deja como bonus explícitamente para no comprometer tiempo que hace falta para
Track B y los Proyectos 1-2.

---

## Riesgos y decisiones clave

- **No dejar que "construir 2 proyectos" bloquee las aplicaciones.** Track B sale primero y ya
  desbloquea el portafolio para uso inmediato; Track C corre en paralelo a seguir aplicando.
- **2 proyectos × ~1 semana = ~2 semanas**, más que la ventana original de 15 días de la búsqueda
  de empleo. Es una inversión consciente más allá del sprint inicial — vale la pena porque un
  portafolio con 2 proyectos reales de datos/automatización sube la tasa de respuesta en
  aplicaciones futuras, pero no debe ser la razón para pausar aplicaciones mientras se construyen.
- **No usar datos ni configuración real de PlayOut Kids** en ninguno de los 2 proyectos —
  confidencialidad. Ambos usan datos públicos o simulados por diseño.
- **Decisión de Track A (personalizar vs. rediseñar) pendiente de confirmar con Jostin** antes de
  tocar estilos — no asumir.
