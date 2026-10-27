---
id: 001-portfolio-v3
type: strategy
status: draft — decisiones de §7 recibidas; pendientes en §8 y §9
track: venture/portfolio
risk: R2
date: 2026-10-27
---

# Portafolio v3 — análisis, estrategia y plan de integración

> Documento de estrategia previo a `/tc-spec`. No es spec ni plan aprobados: no hay código de producto hasta que existan ambos.
> Fuentes: código actual del repo, `Jostin_Nava_CV_EN_26.pdf`, `roadmap.md`, `.claude/skills/portfolio/references/*`.
> Todo lo que no tiene evidencia en esas fuentes se marca `[CONFIRMAR]` o `[SIN EVIDENCIA]`.

---

## 1. Estado actual (diagnóstico)

### 1.1 Qué ya está hecho (el `roadmap.md` está desactualizado)
El rediseño bento (Track A) y el cambio de copy a Data Analyst (Track B) **ya están aplicados** en `master` (commits `v2.0`/`v2.0vn`): tokens bento en `globals.css`, Bricolage Grotesque + Inter, contenedor cápsula, hero con foto en duotono + sello, tarjetas stat, `MotionConfig reducedMotion`. Solo Track C (proyectos nuevos) sigue sin entregarse.

### 1.2 Problemas encontrados

| # | Hallazgo | Evidencia | Gravedad |
|---|---|---|---|
| D1 | **Posicionamiento desfasado del CV nuevo.** El CV 2026 abre con «Full Stack and automation developer» y su experiencia más reciente es SoftBank (migración WMS Express→NestJS, integración ERP, app PDA Android). El sitio sigue vendiendo «Data Analyst & Automation Developer» y **no menciona SoftBank**. | `Hero.tsx:39`, `layout.tsx:15`, CV | Alta |
| D2 | **Identidad inconsistente:** CV = «Jostin Nava»; sitio, footer, header = «Aldair Nava»; GitHub = `BeastAnniee`; LinkedIn en CV = `jostin-aldair-nava`, en el sitio = `aldair-nava-dev`. Un reclutador que cruce CV ↔ sitio ve dos personas o un enlace roto. | `Hero.tsx:19,35`, `Footer.tsx:15,60`, CV | Alta |
| D3 | **Claim académico incorrecto:** About dice «Physics and Mechatronics Engineering». El CV dice Física (incompleta), Técnico/Associate en Mecatrónica Industrial y Ing. en Software en curso. | `About.tsx:59`, CV | Alta |
| D4 | **No existe sección de experiencia.** Hoy la experiencia solo aparece como prosa y 3 stats. El CV tiene 3 empleos con bullets cuantificados que no se muestran. | `page.tsx` | Alta |
| D5 | **Proyectos: 1 featured = el propio portafolio; 8 «other» académicos**, 7 con `404.png` como imagen. Nada demuestra el trabajo real. | `Projects.tsx:101-171` | Alta |
| D6 | **Sin navegación en móvil:** el header es `hidden lg:block`; en <1024 px no hay menú ni acceso a Resume. | `Header.tsx:36` | Alta |
| D7 | `resume.pdf` probablemente no es el CV 2026 `[CONFIRMAR]`; `story.pdf` sin uso aparente. | `public/` | Media |
| D8 | `<html lang="es">` con todo el copy en inglés; `viewport` dentro de `metadata` (deprecado en Next 15); sin OG image / `metadataBase`. | `layout.tsx` | Media |
| D9 | Código muerto: `Particles.tsx` + dependencia `ogl` no se usan. | grep | Baja |
| D10 | `page.tsx` marcado `'use client'` sin necesidad; `Contact.tsx` con `!` sobre env vars (si faltan, falla en runtime) y sangría rota; Header usa `shadow-sm` (el spec bento prohíbe sombras). | varios | Baja |
| D11 | Sin estados vacío/carga/error de contenido (la regla del componente web los exige en cada vista cuando haya datos dinámicos). Hoy todo es estático, así que aplica solo al formulario. | `AGENTS.md` | Baja |
| D12 | Guardrail del skill `portfolio` dice «no listar Power BI», pero el CV 2026 sí lo lista; Fortran idem. Hay que decidir cuál manda. | `positioning.md:62` vs CV | Media |

### 1.3 Qué conservar
Sistema bento (paleta plana, cápsula, radios, sin sombras), fuentes, accesibilidad (focus visible, reduced-motion), stack (Next 15 + Tailwind 4 + Framer Motion + lucide). Es una base sólida: **la estrategia es evolucionar, no rehacer.**

---

## 2. Referencias de diseño

Búsqueda web hecha el 2026-10-27: devolvió **plantillas y ejemplos sueltos, no listados de premios** (no pude confirmar ganadores de Awwwards 2026). Lo que sí aparece y es útil como dirección:

| Patrón | Ejemplo encontrado | Qué tomar |
|---|---|---|
| Bento editorial con overlays | [Bentory (Framer)](https://www.framer.com/marketplace/templates/bentory/) — About/Services/FAQ como overlays sobre una sola home | Mantener home compacta; detalle en panel/overlay |
| Bento hecho a mano (cuaderno) | [Astro theme bento-grid-portfolio](https://astro.build/themes/details/bento-grid-portfolio/) y temas tipo cuaderno | Textura humana, no plantilla fría |
| Mundo interactivo | Bruno Simon (3D, jeep) — citado en [Elementor](https://elementor.com/blog/best-web-developer-portfolio-examples/) | Referencia de «memorable», **fuera de alcance** (costo/riesgo altos) |
| Neo-brutalista + paleta de comandos ⌘K | [Portfolio v3 de hatimelhassak](https://hatimelhassak.is-a.dev/work/portfolio-v3) (Next + Framer Motion) | Atajo ⌘K para saltar a secciones/proyectos |
| Terminal / CRT | [DevTerminalProfile](https://21st.dev/@ruhith369/components/dev-terminal-profile.md) | Solo como guiño (p. ej. línea «now» en mono), no como layout |
| Logros de hackathon | [Tufts Careers](https://careers.tufts.edu/blog/2024/10/28/how-to-include-hackathons-on-your-resume/) | Cada logro: evento, fecha, rol, 1 frase de problema, link; si cabe, qué recortaste y por qué |
| Sección «Now» | Sin ejemplos sólidos encontrados (solo un [Notion «get to know me»](https://helpful-stetson-0e4.notion.site/Get-to-know-me-a883ee3aee71418ab7266dc3903a5952) con «qué construyo / qué aprendo / con quién colaborar») | Estructura de 3 casillas + fecha de actualización (ver nota de datos) |

> Si quieres referencias verificadas de premios, el siguiente paso es revisar Awwwards/CSS Design Awards directamente en el navegador y elegir 3-5 sitios contigo; no lo hice para no inventar.

### 2.1 Tres direcciones (recomiendo A)

- **A · Bento evolucionado (recomendada).** Mantiene el sistema actual; el «salto creativo» viene de: tarjeta *Now* con punto vivo, línea de tiempo de experiencia como tarjetas encadenadas, spotlight con capturas reales y glifo ↗, ⌘K, y un sello/firma coherente. Costo bajo, cero dependencias nuevas, riesgo bajo.
- **B · Editorial/neo-brutalista.** Cambio de identidad (bordes gruesos, mono, color saturado). Más memorable, pero tira el trabajo de v2.0 y exige re-hacer tokens y QA de contraste.
- **C · Terminal/CRT como hero.** Muy distintivo para perfil dev, pero choca con la audiencia (reclutadores/BI/operaciones) y con accesibilidad si se abusa.

---

## 3. Arquitectura de información propuesta

Orden pensado para un reclutador (≈30 s de escaneo): quién → qué hago ahora → dónde he trabajado → pruebas → resto.

```
0. Header         nombre · About · Work · Projects · Now · Contact · Resume (+ menú móvil)  [corrige D6]
1. Hero           nombre + 1 línea de posicionamiento + 2 CTAs + foto/sello + chips «disponible»
2. Now            tarjeta «En qué trabajo ahora» (ver 3.2)
3. Experience     SoftBank · PlayOut Kids · GH2 Systems (ver 3.1)
4. Spotlight      3 proyectos terminados y visibles (ver 3.3)
5. Stack          agrupado: Development · Data & Automation · Tools (del CV)
6. Achievements   franja compacta: robótica + hackathones (ver 3.4)
7. Education      3 líneas (UCNL en curso · UANL Física incompleta · EIAO Mecatrónica)
8. More / Lab     los proyectos académicos colapsados (no desaparecen, bajan de rango)
9. Contact        formulario + email/LinkedIn/GitHub
```

### 3.1 Experience (fuente: CV, bullets sin inflar)
Tarjetas cronológicas inversas, cada una con: empresa, rol, periodo, 2-3 bullets, chips de tech, y **una cifra destacada** como tarjeta stat.

| Empresa | Rol | Periodo | Cifra destacada | Notas |
|---|---|---|---|---|
| SoftBank | Full Stack Developer — WMS/PDA (integración ERP) | 2026 | **17 pantallas PDA · 3 idiomas (ES/EN/KO)** | Migración Express→NestJS con paridad verificada por contract tests; JWT por PIN + roles; app Android React/Vite + Capacitor. `[CONFIRMAR]` si el nombre del cliente y los detalles son públicos (NDA). |
| PlayOut Kids | Data Analyst & Automation Developer | 2025–2026 | **40→100 %** concordancia · **6** departamentos | Dato nuevo vs sitio actual: el CV ya lo da como 2025–2026 (cerrado), el sitio dice «presente» en `positioning.md`. `[CONFIRMAR]` fechas. |
| GH2 Systems | Frontend Developer | 2025 | — (sin cifra; no inventar) | React/TS/Next/RR7 SSR, precios en tiempo real. |

Reglas: **voluntariado nunca mezclado** con empleo (guardrail del skill `portfolio`). Stats de «1000s de registros» se mantienen solo si siguen siendo ciertos `[CONFIRMAR]`; los huecos de `positioning.md` (volumen ETL, % QA) siguen abiertos.

### 3.2 «En qué trabajo ahora»
- Un bloque de 3 casillas: **Construyendo · Aprendiendo · Abierto a**.
- Datos en `src/content/now.ts` con campo `updatedAt` visible («Actualizado oct 2026»). Regla de la constitución (dato en vivo con marca temporal): **si `updatedAt` > 90 días, el componente muestra «Última actualización: …» en vez de presentarse como actual**.
- Contenido real `[SIN EVIDENCIA]`: necesito de ti qué construyes hoy (¿estudios UCNL? ¿un side project? ¿búsqueda de rol?). No lo invento.

### 3.3 Spotlight (3 proyectos terminados y visibles)
Criterio de entrada (checklist del skill): terminado · URL o repo público con README tipo case study (problema → qué hice → resultado) · captura/GIF real · tags reales.

Candidatos, con su estado según la evidencia que tengo:

| Candidato | Estado | Observación |
|---|---|---|
| Demand & Inventory Forecasting Dashboard (roadmap P1) | `[SIN EVIDENCIA]` de que exista | Se mapea directo a PlayOut Kids; datos públicos |
| Workflow Automation & Alerting Engine (roadmap P2) | `[SIN EVIDENCIA]` de que exista | Espejo de la automatización monday.com |
| WMS/PDA (SoftBank) como *case study* sin código | Posible si NDA lo permite | Es tu trabajo más fuerte; se puede mostrar como arquitectura + capturas anonimizadas |
| Crypto Market Analytics CLI | Existe (tiene captura) | Académico; sirve de relleno, no de spotlight |
| Este portafolio | Existe | Meta-proyecto; mejor como nota al pie que como spotlight |

> **Bloqueo:** no puedo elegir los 3 sin saber cuáles están terminados y son públicos (no tengo `gh` ni acceso a tu GitHub desde esta sesión). Ver pregunta 2 en §7.

Diseño del spotlight: 1 tarjeta grande + 2 medianas (asimétrico bento), imagen/GIF real, 1 cifra de resultado, link ↗ a demo y a repo. Sin imágenes `404.png` en ningún proyecto visible.

### 3.4 Achievements (franja pequeña)
- Formato: fila de «chips-trofeo» o mini-timeline horizontal, 4-6 entradas máx., cada una: **evento · año · rol/resultado**.
- Dato disponible hoy: **FRC TIGRES 6652 (2021–2023)** — coordinador administrativo y miembro; logística, presupuesto, programación de control en competencias internacionales.
- Dato faltante: **hackathones** (nombre, año, resultado/premio) y logros de robótica (premios del equipo, regionales). `[SIN EVIDENCIA]`: nada de esto está en el CV ni en el repo.
- Guardrail: sin premios inventados; si no hubo premio, se muestra la participación y el aprendizaje.

---

## 4. Estrategia de contenido y marca

1. **Una identidad.** Decidir nombre público único (Jostin / Aldair) y alinear: sitio, CV, LinkedIn, GitHub display name, metadata.
2. **Pitch.** Propuesta (a validar en spec): *«Full-stack & automation developer — de datos a producto»*. Subtítulo en una línea que una SoftBank (software de operación) + PlayOut (datos/automatización). Evita «Scientific Programmer» (guardrail) y evita Power BI/ML salvo decisión explícita (D12).
3. **Idioma.** El CV es EN y el copy del sitio es EN; ajustar `lang="en"` o añadir ES/EN real. Recomiendo `lang="en"` ahora y ES como fase opcional.
4. **CV descargable** = el mismo PDF 2026, reemplazando `public/resume.pdf`.
5. **Fuente única de contenido:** `src/content/{profile,experience,projects,now,achievements,stack}.ts` tipados; los componentes solo renderizan. Evita que copy y CV vuelvan a divergir (causa raíz de D1-D3).

---

## 5. Plan de integración por fases

Etapa `portfolio` + riesgo **R2** (reestructura de página, sin auth ni datos): spec-lite + plan breve, review desde R2. Una fase por sesión, `/clear` entre fases.

| Fase | Spec | Contenido | Riesgo | Depende de |
|---|---|---|---|---|
| **0 · Decisiones** | — | Responder §7 (nombre, spotlight, now, logros, NDA) | — | Tú |
| **1 · Capa de contenido y correcciones** | `001-content-model` | `src/content/*`; corregir D1-D3, D7, D8, D12; metadata/OG; `resume.pdf` nuevo; borrar `Particles`+`ogl` (requiere ADR por tocar dependencias) | R1-R2 | Fase 0 |
| **2 · Navegación + esqueleto de IA** | `002-ia-shell` | Header con menú móvil, anclas, orden de secciones, ⌘K (sin dependencias nuevas), contenedor | R2 | 1 |
| **3 · Experience + Now + Achievements** | `003-experience-now-achievements` | Tres componentes nuevos con estados vacío/obsoleto; stat tiles | R2 | 1, 2 |
| **4 · Spotlight + More** | `004-spotlight-projects` | 3 tarjetas con medios reales, «More» colapsado, retirar `404.png` | R2 | 0 (qué proyectos), assets |
| **5 · Pulido, a11y y despliegue** | `005-polish-release` | Contraste AA por tarjeta, teclado, reduced-motion, Lighthouse, mobile 360/390, deploy | R1 | 3, 4 |

Diseño: `/tc-design contexto` (rellena `docs/design/DESIGN.md`, hoy todo `TC:FILL`) antes de la Fase 2; `/tc-design contrato` por spec visual; auditoría antes de cada `/tc-review`.

**Camino rápido si hay urgencia de empleo:** Fases 1 + 3(solo Experience) → ya contradice cero con el CV y muestra SoftBank. Spotlight y Now pueden entrar después.

### Gate de cada fase
`node scripts/tc-verify.mjs` (lint + typecheck + build) con salida vista antes de decir «terminado». **Nota: no he ejecutado el gate en esta sesión** (solo análisis, sin cambios de código).

---

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| NDA con SoftBank/PlayOut Kids | Mostrar arquitectura y cifras anonimizadas; pedir OK antes de publicar nombre del cliente |
| Spotlight sin proyectos terminados | Priorizar 1-2 reales + 1 case study del trabajo; construir los del roadmap solo si hay tiempo (no bloquear Fase 1) |
| Sección «Now» obsoleta | `updatedAt` + degradación visible tras 90 días |
| Logros no verificables | Solo lo que puedas respaldar; sin premios sin fuente |
| Sobre-diseño | Dirección A; sin dependencias nuevas; ⌘K opcional (cae si se complica) |
| Divergencia CV ↔ sitio recurrente | Capa de contenido única + revisión de CV al actualizar |

---

## 7. Decisiones que necesito de ti (bloquean la spec)

1. **Nombre público:** ¿Jostin, Aldair o «Jostin Aldair Nava»? Y confirma URL real de LinkedIn (`jostin-aldair-nava` del CV vs `aldair-nava-dev` del sitio) y si el GitHub `BeastAnniee` sigue siendo el tuyo.
2. **Spotlight:** ¿cuáles 3 proyectos están **terminados y con enlace público/demo**? Para cada uno: nombre, URL/repo, 1 resultado medible, y si hay capturas. ¿Puedo mostrar SoftBank WMS como case study (¿NDA?).
3. **Now:** qué estás construyendo/aprendiendo hoy y qué tipo de rol buscas (empleo, freelance, colaboración).
4. **Logros:** lista de hackathones (evento, año, resultado) y logros de FRC TIGRES 6652 (premios, regionales).
5. **Pitch:** ¿«Full-stack & automation» (CV nuevo) o mantener «Data Analyst» (guardrail anterior)? ¿Permito listar Power BI y Fortran como en el CV?
6. **Dirección visual:** ¿A (recomendada), B o C?
7. **Idioma:** ¿solo EN, o EN/ES?
8. **¿Es `public/resume.pdf` el CV 2026?** Si no, ¿lo reemplazo por `Jostin_Nava_CV_EN_26.pdf`?

## 8. Decisiones recibidas (2026-10-27) y su efecto en el plan

| # | Decisión | Efecto |
|---|---|---|
| 1 | Nombre público **Jostin Aldair Nava**; dominio aldair.me; GitHub `BeastAnniee` y LinkedIn **del sitio** (`aldair-nava-dev`) son los correctos | El **CV tiene un LinkedIn distinto** (`jostin-aldair-nava`): hay que corregir el CV o confirmar cuál es válido antes de publicarlo como `resume.pdf` |
| 2 | SoftBank WMS **no** entra como proyecto (trabajo industrial, discreción) | Aparece solo en Experience con los bullets del CV, sin capturas ni nombre de cliente si no estás cómodo `[CONFIRMAR]`. Sale de los candidatos a spotlight |
| 2 | Spotlight 1: **Maya — asistente financiero con IA** (3.er lugar Hack MTY) | Falta: enlace/repo/demo, stack, resultado medible, capturas `[SIN EVIDENCIA]` |
| 2 | Spotlight 2: **Caustix v1.0.0** (librería Python) + landing en Astro en GitHub Pages | La landing es un **repo/sitio aparte**, no entra en este portafolio ni añade dependencias aquí. Falta: qué hace, resultado medible, URL de PyPI/repo `[SIN EVIDENCIA]` |
| 2 | Spotlight 3: **sin definir** | Ver §8.1 |
| 3 | Rol objetivo: **Software Engineer con análisis de datos** | Hero y `<title>` giran a ese eje; Now = «Abierto a: software engineering con enfoque en datos». Qué construyes hoy sigue `[SIN EVIDENCIA]` (borrador en §8.2) |
| 4 | Logros: FRC TIGRES 6652 como protagonista; FLL como una sola línea; 2 hackathones (3.er lugar, 2025 y 2026) | Ver §8.3 |
| 5 | Pitch: aplica a los 3 perfiles; **sí listar Power BI y Fortran** | Se anula la regla de `positioning.md:62` para esas dos; actualizar ese archivo en Fase 1 |
| 6 | Dirección **B**, «como un póster neobrutalista de concierto», muy impactante | **Reemplaza el sistema bento** (`bento-design-spec.md` queda obsoleto). Ver §8.4 |
| 7 | **EN + ES** | Nueva capacidad (i18n). Ver §8.5 |
| 8 | Reemplazar `public/resume.pdf` por el CV EN 2026 | Pendiente de corregir LinkedIn del CV (fila 1) y de decidir si hay CV en ES |

### 8.1 Tercer spotlight (opciones, recomiendo la 1)
1. **Mostrar 2 spotlight reales + 1 ranura «En construcción»** con fecha. Honesto, no bloquea la Fase 1, y refuerza la sección Now. Se llena cuando exista el tercero.
2. Construir el *Demand & Inventory Forecasting Dashboard* del roadmap (≈1 semana, datos públicos): el que más se alinea con «software engineer + data analysis».
3. Ampliar `crypto_market_analytics_cli`: coincido contigo en que es básico; solo como último recurso.
Los proyectos académicos pasan a «Lab/More» colapsado o se retiran.

### 8.2 Borrador de Now (para que lo corrijas, no es dato verificado)
- Construyendo: landing de Caustix · este portafolio v3 `[CONFIRMAR]`
- Aprendiendo: `[SIN EVIDENCIA]`
- Abierto a: Software Engineer con enfoque en datos y automatización.

### 8.3 Achievements — datos recibidos y advertencias
Entradas (máx. 4-6, franja compacta):
- **FRC TIGRES 6652 (2021–2023):** llegada a Mundiales; Dean's List nominee/finalist 2021–22 `[CONFIRMAR término exacto]`; Chairman's Award en el mundial; competencias en Monterrey, Torreón, Houston y Alabama.
- **Hackathones:** 3.er lugar **Banorte Open Innovation** 2025 y 2026 (equipo Ghekkin); Maya fue 3.er lugar en Hack MTY `[CONFIRMAR si Hack MTY y Banorte Open Innovation son el mismo evento o son dos]`.
- **FLL (una línea):** premio a mejor programación y nominación a Global Innovation Award; CDMX, Monterrey y LEGOLAND California `[CONFIRMAR años]`.

Advertencias: (a) «único equipo mexicano en ganar el Chairman's Award en el mundial» es una afirmación fuerte y verificable: necesito el **año y el nivel** (Championship vs. división) y una fuente (TBA/FIRST) antes de publicarla tal cual; (b) estos logros **no están en tu CV**: conviene añadirlos al CV también; (c) el voluntariado/competencias siguen separados de la experiencia profesional.

### 8.4 Dirección B «póster neobrutalista de concierto» — implicaciones
- **Es un cambio de identidad**, no un ajuste: se re-hacen tokens, tipografía y composición; el bento v2.0 se archiva. Lo trato como spec visual propia (R2) tras `/tc-design contexto` + `/tc-design contrato`.
- Lenguaje: tipografía gigante condensada que sangra del marco, bordes negros gruesos, sombras duras sin blur, 2-3 colores saturados sobre papel crema/negro, etiquetas rotadas, «cartel de line-up» (stack como cartelera), fechas/«tour» (experiencia como gira), sellos y cinta tipo ticket. Experience = «tour dates»; Achievements = «line-up/awards»; Now = «ahora en escena».
- Fuentes gratuitas vía `next/font/google` (p. ej. una display condensada + una mono): sin dependencias nuevas.
- **Límites no negociables que el póster no puede romper:** contraste AA, foco visible, `prefers-reduced-motion`, objetivo táctil ≥44 px, legibilidad móvil 360/390 px, texto real (no texto dentro de imágenes). El impacto viene de composición y escala, no de sacrificar lectura.
- Riesgo: el neobrutalismo mal medido se lee como plantilla. Mitigación: un solo gesto memorable (sugerencia: el nombre a escala de póster con el «tour» de experiencia) y revisión visual iterativa en canvas (`pencil`) antes de codificar.

### 8.5 Bilingüe EN/ES
- Estructura: diccionario tipado `src/content/{en,es}.ts` + rutas `/en` y `/es` (o toggle con persistencia). Con Next 15 se puede sin librería; `next-intl` sería dependencia nueva → `/tc-adr` antes.
- `<html lang>` dinámico, `hreflang`, metadata por idioma. Dato crítico: la traducción **no puede introducir afirmaciones nuevas**; ES se deriva del mismo contenido.
- CV: se publica EN; un `resume-es.pdf` requiere que exista (`[SIN EVIDENCIA]`).

### 8.6 Plan actualizado
| Fase | Cambia |
|---|---|
| 0 · Decisiones | Quedan abiertas: Maya/Caustix (links, resultados), 3.º spotlight, Now, CV LinkedIn, Hack MTY vs Banorte, datos Chairman's |
| 1 · Contenido | Añade i18n de contenido (`en/es`), corrección D1-D3, Power BI/Fortran, nombre «Jostin Aldair Nava», LinkedIn |
| **1b · Diseño (nueva)** | `/tc-design contexto` → mockup del póster en canvas → contrato de diseño aprobado; sustituye `bento-design-spec.md` |
| 2 · Shell | Navegación + selector de idioma + ⌘K, ya con el nuevo sistema visual |
| 3 · Experience/Now/Achievements | Como «tour / en escena / line-up» |
| 4 · Spotlight | Maya + Caustix + ranura 3 |
| 5 · Pulido y despliegue | Igual, más QA bilingüe |

### 8.7 Resuelto (2026-10-27)
- LinkedIn correcto: `linkedin.com/in/aldair-nava-dev` (el del sitio). El CV se corrige por tu parte; **`public/resume.pdf` no se toca hasta recibir el PDF corregido**.

### 8.8 Resuelto (2026-10-27, segunda ronda)
- **Spotlight = 2 proyectos, sin ranura vacía.** El layout se diseña para 2 y admite un 3.º cuando exista (decisión tuya; reemplaza la recomendación de §8.1).
- **Maya:** stack TypeScript + React + servidor MCP + A2UI. Resultado verificable: **3.er lugar, Open Innovation de Banorte, Hack MTY 2026**. Enlace: `[SIN EVIDENCIA]` (no me diste la URL).
- **Caustix v1.0.0:** librería de física en Python (NumPy) + verificador RK4 en Fortran que vive **solo en GitHub**, no en el paquete publicado. No hay métrica numérica: el «resultado» honesto es *v1.0.0 publicada + verificador independiente RK4*. Enlace: la landing (Astro + GitHub Pages) **aún no existe**, así que Caustix no es «visible» hasta publicarla; hasta entonces enlaza al repo `[CONFIRMAR URL]`.
- **Hack MTY = Banorte Open Innovation:** es un solo evento (el reto de Banorte dentro de Hack MTY). Participaste en 2025 y 2026. Maya es el de 2026. Queda una duda: dijiste «en los 3 nos llevamos tercer lugar»; antes dijiste 2 victorias (2025 y 2026). **¿Son 2 o 3 participaciones?**
- **Chairman's Award:** 2022, nivel división, FIRST Championship Houston. Se publica **con esa precisión** («Chairman's Award, división, Championship Houston 2022»). **Sin** «único equipo mexicano» hasta verificarlo contra una fuente (TBA/FIRST); retirado del copy.
- **Now (contenido recibido):** (1) sistema MES industrial: registro de líneas de producción, control de almacén, conexión con POPs y PDA; (2) repositorio común para publicación de trabajos científicos de estudiantes. Pendiente «Aprendiendo».
  - Riesgo: el MES es trabajo industrial; aplica la misma discreción que SoftBank. Se redacta en genérico («MES industrial…») sin cliente, y **`[CONFIRMAR]` si puede mencionarse y si es el mismo proyecto de SoftBank**. El repositorio científico debería enlazarse si es público.
  - Nota de coherencia: Archive (en `Projects.tsx`) ya es una plataforma para estudiantes; `[CONFIRMAR]` si el repositorio nuevo es su evolución para no presentarlos como dos cosas distintas.

### 8.9 Resuelto (2026-10-27, tercera ronda)
- Maya: https://ghekkinxmaya.tech/maya · Caustix: https://github.com/BeastAnniee/caustix (la landing, cuando exista, sustituye al repo como enlace principal).
- **Hackathones: solo dos** (Hack MTY 2025 y 2026, Open Innovation de Banorte, ambos 3.er lugar; 2026 = Maya).
- **MES industrial:** se puede mencionar, **no mostrar código ni capturas**. Se presenta como descripción en texto.
- **Archive = el repositorio científico** de «Now»: una sola entrada, no dos proyectos.
- **Sin sección «Aprendiendo»**: Now queda en 2 tarjetas (MES, Archive) + «Abierto a».
- Nuevo requisito: **animaciones acordes al estilo neobrutalista**, con referencias investigadas → ver `docs/design/DESIGN.md`.

## 9. Siguiente paso
Cerrar los pendientes de §8.6/Fase 0 que bloqueen la spec (lo mínimo: nombre ya cerrado; faltan links de Maya y Caustix, qué hacer con el 3.er spotlight, y el LinkedIn del CV) → `/clear` → `/tc-spec "Portafolio v3: capa de contenido bilingüe + nueva arquitectura de información"` → aprobación → `/tc-design contexto`.
