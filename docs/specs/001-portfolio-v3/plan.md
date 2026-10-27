---
type: plan
spec: "[[specs/001-portfolio-v3/spec]]"
approved_by: Jostin Aldair Nava
approved_at: 2026-10-27
---
<!-- plan.md — debe ser AUTOSUFICIENTE: un agente sin contexto previo tiene que poder ejecutarlo. Las tareas usan el formato `- [x] **T1** — título` y una línea `Cubre: REQ-1, AC-1` (lo leen tc-status y el lint). `approved_by` lo rellena el humano que aprueba el plan. -->
# Plan · 001-portfolio-v3

**Riesgo:** R2 · **Rama:** `feat/001-portfolio-v3` · **Commits:** convencionales (`feat(i18n): …`), uno por tarea, sin rastro de IA.

## 1. Enfoque

Convertir el sitio de una sola página en inglés con texto dentro de los componentes en un sitio **bilingüe `/en` · `/es`** cuyo contenido vive en una capa tipada y cuyos componentes solo lo renderizan. Sin dependencias nuevas.

**Arquitectura elegida**

1. **Rutas.** Un único segmento dinámico `src/app/[lang]/` que es el **layout raíz** (`<html lang={lang}>`), con `generateStaticParams` (`en`, `es`) y `dynamicParams = false`: ambas páginas se generan estáticas en el build (el HTML ya trae el contenido: NF-2). `src/middleware.ts` solo atiende `/` (matcher `['/']`) y redirige 307 según `Accept-Language`. La 404 es `src/app/not-found.tsx` con su propio `<html>`/`<body>`.
2. **Contenido.** `src/content/`: `facts.ts` (datos sin idioma: empresas, periodos, cifras, tecnologías, URLs), `types.ts` (interfaz `Dictionary`), `en.ts` y `es.ts` (`: Dictionary`, misma forma), `index.ts` (`getDictionary`). Una clave faltante en `es` rompe `tsc`; además una prueba recorre ambos diccionarios y compara forma, longitudes de arrays, cadenas no vacías y tokens numéricos.
3. **Lógica en módulos puros** (`src/lib/*.ts`) probados con el ejecutor integrado de Node: negociación de idioma, vigencia de Now, vista de proyecto, validación y envío del formulario. Los componentes son delgados.
4. **Now se evalúa en el cliente** con la fecha de la visita. El HTML servido (estático) trae el estado seguro «Última actualización: <fecha>»; tras hidratar, si `updatedAt` es válido y ≤ 90 días, pasa a «Actualizado».

**Evidencia del prototipo (descartable, 2026-10-27, Next 15.5.23, `next build` + `next start` sobre una copia del repo, ya borrada).** Con `app/[lang]/layout.tsx` como raíz + `dynamicParams=false` + `middleware.ts` + `app/not-found.tsx` con `<html>`: `/en` → 200 `<html lang="en">`; `/es` → 200 `<html lang="es">`; `/fr`, `/en/x`, `/es/x/y` → **404 con la página 404 propia**; `/` con `es-MX,es;q=0.9` → 307 `Location: /es` + `Vary: Accept-Language`; sin cabecera → 307 `/en`. Además `export const viewport` compila sin avisos y los imports con extensión `.ts` pasan `tsc`, `next build` y `next lint` con `allowImportingTsExtensions`. Observación: `/EN` responde 200 (Next compara sin distinguir mayúsculas); el canonical de cada página apunta a la ruta en minúsculas, así que no hay duplicado indexable.

**Alternativas descartadas**

| Alternativa | Por qué no |
|---|---|
| `next-intl` / `next-i18next` | Dependencia nueva (ADR, NF-1, P8) para dos idiomas y una página; el enrutado y los diccionarios propios caben en ~100 líneas. |
| `app/layout.tsx` fijo + idioma por cabecera leída en el layout | Vuelve dinámico todo el sitio (pierde generación estática) y es frágil con caché; el segmento `[lang]` da `lang` correcto por construcción. |
| Redirigir todo el tráfico desde middleware (`/` → `/en`, rutas sin prefijo…) | Más superficie de fallo; el spec solo pide decidir en `/`. Middleware limitado a `/`. |
| Vitest/Jest + Testing Library | Dependencias nuevas (ADR). Con *type stripping* de Node el JSX no se ejecuta; por eso la lógica va en `.ts` puros y el HTML renderizado se comprueba sobre `next start` (ver §4). |
| Evaluar la vigencia de Now en el servidor/build | Violaría REQ-16 (un build viejo diría «vigente»). |
| Datos y prosa mezclados en el diccionario | Repite cifras/URLs en dos idiomas (REQ-7). Los hechos van una vez en `facts.ts`; el diccionario solo trae prosa y rótulos. |

**Decisiones del plan que necesitan tu visto bueno al aprobarlo**

- **D-A.** Sin ADR: no hay dependencia nueva ni cambio de protocolo; la decisión de rutas/contenido queda aquí y en `docs/architecture.md` (T16). Si prefieres un ADR, hazlo con `/tc-adr` antes de T7.
- **D-B.** AC-18 pide «prueba automatizada del render»: se cumple con una prueba de la **vista de proyecto** (`resolveProjectMedia`) + un escaneo del HTML servido (`href="#"`, `404.png`). No hay pruebas de componentes (requerirían dependencias).
- **D-C.** La 404 pasa a ser **bilingüe** (muestra EN y ES, con enlaces a `/en` y `/es`) porque no conoce el idioma, y **sin animación de entrada** (queda fuera del `MotionProvider`). Los textos salen de los diccionarios.
- **D-D.** Los idiomas (Español nativo · Inglés B1, REQ-8) se muestran como una línea dentro de Education; el spec no define sección propia.
- **D-E.** `hreflang="x-default"` apunta a `/en` (no a `/`, que redirige).
- **D-F.** T17 también corrige `SKILL.md` (líneas 34–35, que vuelven a fijar el pitch «Data Analyst»), no solo `positioning.md`: sin eso la guía seguiría incoherente (REQ-11).
- **D-G.** T1 edita `.tc/config.json` (`commands.test`), que está en `askPaths`: **requiere tu confirmación** en ese momento.

## 2. Contexto técnico que el implementador necesita

**Estado actual (todo en `src/`)**
- `app/layout.tsx` (html `lang="es"`, fuentes Inter y Bricolage, `SpeedInsights`, `MotionProvider`, `metadata` con `viewport` dentro), `app/page.tsx` (`'use client'`, renderiza Header, Hero, About, Projects, Contact, Footer), `app/not-found.tsx` (cliente, framer-motion, texto en inglés), `app/globals.css` (tokens `--color-bento-*`, `@media (prefers-reduced-motion)`, `animate-fade-in`).
- `components/`: `Header.tsx` (`hidden lg:block`, botones con `scrollIntoView`, enlace `/resume.pdf`), `Hero.tsx` (copiar correo, redes, foto `profile.jpg`), `About.tsx` (afirma «Physics and Mechatronics Engineering»; se elimina), `Projects.tsx` (1 featured + 8 con `404.png`; se reemplaza), `Contact.tsx` (EmailJS con `process.env.NEXT_PUBLIC_EMAILJS_*!`), `Footer.tsx`, `SignatureBadge.tsx`, `MotionProvider.tsx` (`MotionConfig reducedMotion="user"`: **conservar**), `Particles.tsx` (no se usa; **no tocar**, ni quitar `ogl`).
- Solo `app/page.tsx` importa esos componentes; `Hero` importa `SignatureBadge`. No hay grafo de código (`provider: none`); el impacto se midió con búsquedas acotadas.
- Estilo existente: Tailwind 4 con tokens `bento-*`, `font-display`/`font-body`, foco con `focus-visible:ring-2`. **Esta spec no cambia la identidad visual** (spec 002): reutiliza clases y tokens existentes, no añade tokens ni fuentes. No existe `design.md` para esta spec (el contrato visual es de la 002).
- Sin `.env*` en el repo; en local el formulario correrá sin variables (sirve para probar el camino «sin configuración»).

**Fuentes de contenido (fuera del repo, autoridad de datos y de traducción)**
- `C:\Users\josti\Downloads\Jostin_Nava_CV_EN_26.pdf` (EN) y `…\Jostin_Nava_CV_ES_26.pdf` (ES). Copiar los bullets **tal cual**. **No** copiar teléfono ni LinkedIn del CV (el LinkedIn del CV es otro: `jostin-aldair-nava`; el válido es `aldair-nava-dev`). Si los PDF no están accesibles, **para y avisa**.
- Resumen EN/ES del CV → base del `hero.summary` (2–3 líneas). El texto exacto del hero y de las tarjetas de Now lo redacta el agente a partir de las fuentes y lo revisa la persona en el PR; **si falta un dato de hecho, se omite, no se inventa**.
- Datos confirmados de Achievements, Now, Maya y Caustix: `spec.md` §6 (copiar de ahí).

**Forma de los datos (guía; los nombres exactos los decide el implementador)**
```ts
// src/lib/locale.ts           LOCALES = ['en','es'] as const; type Locale; DEFAULT_LOCALE = 'en'; isLocale(); negotiateLocale(header)
// src/content/facts.ts        profile{name,email,github,linkedin} · cv{en,es → '/resume.pdf'} · experience[] · education[] · languages[]
//                             stack{development,dataAutomation,tools: string[]} · now{updatedAt,cards[]} · projects{spotlight[],lab[]} · achievements[]
// src/content/types.ts        interface Dictionary { meta, nav, hero, footer, common, notFound, now, experience, education, stack,
//                                                    achievements, projects, lab, contact, techLabels }
// src/content/{en,es}.ts      export const en: Dictionary = {…}   (ES = misma forma)
// src/content/index.ts        getDictionary(locale): Dictionary   (solo se usa desde componentes de servidor)
```
- Ids de sección y de ancla: `hero`, `now`, `experience`, `projects`, `stack`, `achievements`, `education`, `lab`, `contact`.
- `techLabels` (en el diccionario): traducciones de los pocos nombres de tecnología que difieren entre CV EN y ES (p. ej. *Advanced Excel* / *Excel avanzado*, *automated testing* / *pruebas automatizadas*, *MCP server* / *servidor MCP*); los componentes usan `techLabels[nombre] ?? nombre`. Los nombres propios se declaran una vez en `facts.ts`.

**Reglas de los módulos probados con Node (`src/lib/*.ts`, `src/content/*.ts`)**
- Imports **relativos con extensión `.ts`** entre módulos con valores (`import { x } from './y.ts'`); tipos con `import type`; **sin** alias `@/`, sin `enum`, sin JSX, sin APIs de Next/React. Los componentes (`.tsx`) sí pueden importar `@/lib/x.ts`.
- Pruebas colocadas junto al módulo: `x.test.ts` con `node:test` + `node:assert/strict`.

**Comandos** (Windows; en PowerShell usa `curl.exe`, no el alias `curl`)
- `npm test` · `npx tsc --noEmit` · `npm run lint` · `node scripts/tc-verify.mjs --fast` (lint+tipos+secretos; también lo corre el pre-commit) · `node scripts/tc-verify.mjs` (gate completo con `test` y `build`).
- HTML servido: `npm run build` y `npx next start -p 3000`; luego `curl.exe -s http://localhost:3000/en`.
- Estado/trazabilidad: `node scripts/tc-status.mjs` · `node scripts/tc-spec-lint.mjs --trace 001`.

**Trampas conocidas**
- `next lint` imprime un aviso de deprecación: es ruido conocido, no un fallo.
- En código de cliente, Next solo sustituye `process.env.NEXT_PUBLIC_X` si se escribe **literal** (no `process.env[name]`).
- En Next 15, `params` es una **Promesa** (`const { lang } = await params`).
- Los componentes de cliente no pueden leer `window`/`new Date()` durante el primer render si eso cambia el HTML (hidratación): estado inicial determinista y `useEffect`.
- `.tc/config.json`, `scripts/tc-verify.mjs`, `docs/constitution.md` están en `askPaths`: pedir confirmación; no buscar rodeos.
- `public/resume.pdf` **no se toca** (spec REQ-23). `public/404.png` y `story.pdf` se dejan sin referencias; no se borran en esta spec.
- Los componentes nuevos no deben introducir texto con opacidad (`text-bento-black/70`) ni pares de color nuevos: usar los ya presentes (negro o grafito sobre `container`/`page`/tonos) para no abrir riesgo de contraste (AC-30).

## 3. Tareas

- [x] **T1** — Ejecutor de pruebas integrado y negociación de `Accept-Language`
  - Archivos: `package.json` (solo `scripts.test`), `tsconfig.json` (`allowImportingTsExtensions: true`), `.tc/config.json` (`components[0].commands.test` → `"npm test"`; **askPaths: pedir confirmación**), `src/lib/locale.ts`, `src/lib/locale.test.ts`
  - Test primero: `locale.test.ts` con la tabla de AC-2 y bordes: `es-MX,es;q=0.9,en;q=0.8` → `es`; `en-US,en;q=0.9,es;q=0.5` → `en`; `fr-FR` → `en`; `undefined`/`null`/`''` → `en`; `es;q=0` → `en`; `en;q=0.5,es;q=0.5` → `en` (empate: el primero listado); `es,en` → `es`; `ES-mx` → `es`; `*` y `esperanto` no cuentan como `es`; entradas con `q` inválida (`es;q=abc`, `es;q=2`, `;;;`) se ignoran y, si no queda ninguna, `en`. Sin `locale.ts` la prueba falla.
  - Cambio: script `"test": "node --experimental-strip-types --disable-warning=ExperimentalWarning --disable-warning=MODULE_TYPELESS_PACKAGE_JSON --test \"src/**/*.test.ts\""` (el flag cubre Node 22 de CI; confirmar que funciona en Node 24.12 local); `allowImportingTsExtensions` en tsconfig; `commands.test = "npm test"`. `locale.ts` exporta `LOCALES`, `Locale`, `DEFAULT_LOCALE`, `isLocale` y `negotiateLocale(header: string | null | undefined): Locale` con las reglas de spec §6 (solo `es`/`en` y subetiquetas; `q` por defecto 1; `q=0` excluye; gana la mayor `q`; empate → el primero; ninguno → `en`).
  - Verificación: `npm test` → todas las pruebas pasan; `node scripts/tc-verify.mjs --fast` → PASS; `git diff package.json` → solo la línea `scripts.test`.
  - Cubre: REQ-2, AC-2, NF-1, AC-27

- [x] **T2** — Capa de contenido base: tipos, hechos del perfil, diccionario inicial y guardas
  - Archivos: `src/content/types.ts`, `src/content/facts.ts`, `src/content/en.ts`, `src/content/es.ts`, `src/content/index.ts`, `src/content/content.test.ts`
  - Test primero: `content.test.ts` (rojo mientras no existan los módulos): (a) **paridad** `en`/`es`: mismas rutas de clave, mismos tipos, arrays de igual longitud, cadenas no vacías; (b) **paridad numérica**: por cada cadena, el multiconjunto de tokens numéricos EN = ES; (c) **guardas de prohibidos** sobre todo el texto de ambos diccionarios y `facts`: ningún `Aldair Nava` sin `Jostin ` delante, ningún «único equipo mexicano»/«only Mexican team», ningún `404.png`, ninguna frase «Ingeniería en Física y Mecatrónica»/«Physics and Mechatronics Engineering»; `meta.title` y el titular del hero sin «Scientific Programmer» ni «Data Analyst» y con «Software Engineer»; (d) `facts.profile.name === 'Jostin Aldair Nava'` y los únicos enlaces son GitHub `BeastAnniee`, LinkedIn `aldair-nava-dev` y `mailto:jostinaval@gmail.com`; (e) `cv.en` y `cv.es` apuntan a un archivo que existe en `public/` (`fs.existsSync`).
  - Cambio: `Dictionary` con las rebanadas `meta` (título, descripción, keywords, `ogLocale`, alt de imagen), `nav` (marca, rótulos de sección, CV, menú abrir/cerrar, selector de idioma con textos de accesibilidad), `hero` (saludo, titular «Software Engineer» + calificador de datos y automatización, `summary` de 2–3 líneas derivado del resumen del CV, CTA, aria-labels de redes/copiar correo, `badge`), `footer`, `common` (correo copiado…), `notFound` y `techLabels`. `facts.profile` y `facts.cv = { en: '/resume.pdf', es: '/resume.pdf' }`. `index.ts`: `getDictionary(locale)`, `SECTION_IDS`. Las rebanadas posteriores (T3–T6, T15) **amplían `Dictionary` y los dos diccionarios a la vez**, de modo que la paridad siempre está en verde.
  - Verificación: `npm test` → pasa; demostración temporal: borrar una clave de `es.ts` → `npx tsc --noEmit` **falla** y la prueba de paridad **falla** (restaurar y dejar en verde); `node scripts/tc-verify.mjs --fast` → PASS.
  - Cubre: REQ-6, REQ-7, REQ-9, REQ-10, REQ-26, AC-6, AC-7, AC-9, AC-26

- [x] **T3** — Contenido derivado del CV: Experience, Education, idiomas y Stack
  - Archivos: `src/content/{types,facts,en,es}.ts`, `src/content/content.test.ts`
  - Test primero: ampliar `content.test.ts`: orden de `facts.experience` = [SoftBank, PlayOut Kids, GH2 Systems]; nº de bullets = 4, 4, 1 en EN y en ES; métricas destacadas solo en SoftBank (17 pantallas PDA, 3 idiomas) y PlayOut Kids (40→100 %, 6 departamentos) y ninguna en GH2; `education` con 3 entradas (UCNL en curso; UANL Física incompleta 2023–2025; EIAO–UANL Mecatrónica Industrial 2020–2023); `stack` con tres grupos que incluyen `Power BI` y `Fortran`; FRC TIGRES **no** está en `experience`. Rojo hasta implementar.
  - Cambio: `facts.experience[]` (`id`, empresa, periodo, métricas numéricas, `tech[]`), `facts.education[]`, `facts.languages[]`, `facts.stack`. Diccionarios: rol y bullets por empresa **copiados de los PDF** (EN del CV EN, ES del CV ES), rótulos de métricas, títulos de grado («Associate Degree in Industrial Mechatronics» / «Técnico Superior Universitario en Mecatrónica Industrial»), «In progress»/«En curso», línea de idiomas («Spanish: native | English: intermediate (B1)» / «Español: nativo | Inglés: intermedio (B1)») y entradas de `techLabels` que difieran entre CVs. **Chips de tecnología solo con tecnologías nombradas literalmente en esos bullets** (SoftBank: Express, NestJS, TypeScript, JWT, PM2, React, Vite, Capacitor; GH2: React, TypeScript, Next.js, React Router v7, Material UI, Vite, REST; PlayOut Kids: ninguna o solo ETL; **no** añadir monday.com).
  - Verificación: `npm test` → pasa; cotejo bullet por bullet contra ambos PDF (anotar la tabla para `validation.md`).
  - Cubre: REQ-7, REQ-8, AC-7, AC-8

- [x] **T4** — Now: contenido y lógica de vigencia
  - Archivos: `src/lib/now-status.ts`, `src/lib/now-status.test.ts`, `src/content/{types,facts,en,es}.ts`
  - Test primero: `now-status.test.ts` con fecha de visita inyectada (`today: Date`): `updatedAt` a 0, 89 y 90 días → `fresh`; 91 días → `stale`/`old`; `undefined`, `''`, `'abc'`, `'2026-02-30'` → `stale`/`missing|invalid`; 1 día en el futuro → `stale`/`future`; `updatedAt` es fecha de calendario `YYYY-MM-DD` (sin desfase por zona horaria; días naturales).
  - Cambio: `nowStatus(updatedAt, today)` puro. `facts.now = { updatedAt: '2026-10-27', cards: [mes, archive] }` con el enlace de Archive (`https://github.com/BeastAnniee/archive`). Diccionario `now`: título, tarjeta MES (genérica, **sin cliente**: registro de líneas de producción, control de almacén, conexión con POPs y PDA), tarjeta Archive (repositorio común de trabajos científicos de estudiantes), línea «Abierto a: Software Engineer con enfoque en datos y automatización», rótulos «Actualizado»/«Última actualización» y «fecha no disponible».
  - Verificación: `npm test` → pasa.
  - Cubre: REQ-6, REQ-15, REQ-16, AC-16

- [x] **T5** — Projects y Lab: contenido y vista de proyecto
  - Archivos: `src/lib/project-view.ts`, `src/lib/project-view.test.ts`, `src/content/{types,facts,en,es}.ts`, `src/content/content.test.ts`
  - Test primero: `resolveProjectMedia(p)` → `{ image: string | null, href: string | null }`: `image` ausente, `''` o `'/404.png'` → `null`; `href` ausente, `''` o `'#'` → `null`; valores válidos se conservan. En `content.test.ts`: `spotlight` tiene exactamente `maya` y `caustix`; `lab` no contiene `archive` y sí `portfolio`; cada id tiene entrada en ambos diccionarios; ninguna imagen referencia `404.png`.
  - Cambio: `facts.projects.spotlight` — Maya (TypeScript, React, MCP server, A2UI; `https://ghekkinxmaya.tech/maya`) y Caustix v1.0.0 (Python, NumPy, Fortran; `https://github.com/BeastAnniee/caustix`); sin `image` (no hay capturas: no se inventan). `facts.projects.lab`: portfolio (`/portfolio.png`), Crypto Market Analytics CLI (`/cma_image.png`), Curve Fitting, Numerical Methods, Blackjack CLI Game, Root Finding, Python & Physics, Fortran & Physics, con sus repos actuales (tomarlos de `src/components/Projects.tsx`). Diccionarios: descripción y **resultado verificable** de cada spotlight (Maya: 3.er lugar, Open Innovation de Banorte, Hack MTY 2026; Caustix: v1.0.0 + verificador independiente RK4 en Fortran que vive solo en GitHub) y descripciones del Lab traducidas sin añadir afirmaciones.
  - Verificación: `npm test` → pasa.
  - Cubre: REQ-17, REQ-18, REQ-22, AC-17, AC-18

- [x] **T6** — Achievements: contenido
  - Archivos: `src/content/{types,facts,en,es}.ts`, `src/content/content.test.ts`
  - Test primero: entre 4 y 6 entradas; cada `id` pertenece a la lista confirmada de spec §6; la entrada FLL no tiene año y ninguno de sus textos (EN/ES) contiene un año (`/\b(19|20)\d{2}\b/`); el Chairman's Award es 2022, nivel división, Championship Houston; Dean's List Semi-finalist 2022; ningún texto contiene «único equipo mexicano»/«only Mexican team».
  - Cambio: `facts.achievements` (6 entradas: FRC TIGRES 6652 2021–2023 con Mundiales y sedes Monterrey/Torreón/Houston/Alabama; Chairman's Award 2022; Dean's List Semi-finalist 2022; Hack MTY 2025 3.er lugar (equipo Ghekkin); Hack MTY 2026 3.er lugar (Maya); FIRST LEGO League en una línea sin años) y su prosa en los dos diccionarios.
  - Verificación: `npm test` → pasa.
  - Cubre: REQ-20, REQ-26, AC-20, AC-26

- [x] **T7** — Rutas por idioma, metadatos, redirección de `/` y 404
  - Archivos: `src/app/fonts.ts` (nuevo; Inter y Bricolage compartidas), `src/app/[lang]/layout.tsx`, `src/app/[lang]/page.tsx` (movido desde `src/app/page.tsx`; sigue renderizando los componentes actuales, sin quitar `'use client'` de ellos), eliminar `src/app/layout.tsx` y `src/app/page.tsx`, `src/middleware.ts`, `src/app/not-found.tsx`, `src/lib/metadata.ts`, `src/lib/metadata.test.ts`
  - Test primero: `metadata.test.ts` para `buildMetadata(locale, dict)` (puro, `import type` de `next`): título y descripción distintos por idioma; `metadataBase` = `https://aldair.me`; `alternates.canonical` = `/en`|`/es`; `alternates.languages` = `{ en: '/en', es: '/es', 'x-default': '/en' }`; `openGraph.locale` = `en_US`|`es_MX`, `alternateLocale`, imagen `/profile.jpg` con alt; autores = Jostin Aldair Nava. Y, antes de tocar rutas, registrar el estado de partida: `curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/es` → **404** (hoy no existe).
  - Cambio: `[lang]/layout.tsx` = layout raíz: `<html lang={lang}>`, fuentes de `fonts.ts`, `globals.css`, `SpeedInsights`, `MotionProvider`; `export const dynamicParams = false`; `generateStaticParams` desde `LOCALES`; `export const viewport` (sale de `metadata`); `generateMetadata` usa `buildMetadata`. `[lang]/page.tsx` solo se mueve (aún sin pasar el diccionario a los componentes; cada tarea posterior lo cablea para evitar variables sin uso en lint). `middleware.ts`: `matcher: ['/']`, `negotiateLocale(request.headers.get('accept-language'))`, `NextResponse.redirect` **307** a `/{locale}` conservando query y con `Vary: Accept-Language`. `not-found.tsx`: servidor, con su `<html lang="en"><body>` y fuentes/`globals.css`, bilingüe (bloque ES con `lang="es"`), textos de `en.notFound`/`es.notFound`, enlaces a `/en` y `/es`, sin framer-motion (D-C).
  - Verificación: `npm run build` → compila sin aviso de `viewport` y lista `/[lang]` con `/en` y `/es`; `npx next start -p 3000` y `curl.exe`: `/en` → 200 con `<html lang="en">`; `/es` → 200 con `<html lang="es">`; `/fr` y `/en/x` → **404** (nunca 500); `/` con `Accept-Language` de la tabla de AC-2 → 307 con `Location` esperada y `Vary`; `<head>` de cada idioma con título/descripción distintos, `og:locale`, `og:image`, canonical y tres `hreflang` absolutos de `aldair.me`; `npm test` → pasa.
  - Cubre: REQ-1, REQ-2, REQ-3, REQ-4, AC-1, AC-2, AC-3, AC-4, AC-31, NF-5

- [x] **T8** — Header, selector de idioma, menú móvil y enlace al CV
  - Archivos: `src/components/Header.tsx` (reescrito), `src/components/LocaleSwitch.tsx`, `src/lib/locale.ts` (+ `switchLocaleHref`), `src/lib/locale.test.ts`, `src/app/[lang]/page.tsx`
  - Test primero: en `locale.test.ts`, `switchLocaleHref(current, hash)`: `('en','#experience')` → `/es#experience`; `('es','')` → `/en`; un hash que no cumple `^#[a-z-]+$` (p. ej. `#<script>`, `#a b`) se descarta → `/en` o `/es` sin ancla. Falla hasta implementar.
  - Cambio: cabecera visible en **todos** los anchos; marca con el nombre público; enlaces `<a href="#id">` reales (se elimina `scrollToSection`); ≥ 1024 px, navegación en línea; < 1024 px, botón con `aria-expanded`/`aria-controls`/`aria-label` (del diccionario) que abre un panel con secciones + CV + selector; `Esc` lo cierra y devuelve el foco al botón; elegir un enlace lo cierra; objetivos táctiles `min-h-11 min-w-11` (≥ 44 px). `LocaleSwitch`: dos opciones `EN`/`ES`; la actual con `aria-current="true"` y marca no solo de color; la otra es un `<a href="/otro" hreflang lang>` cuyo `onClick` navega a `switchLocaleHref(current, window.location.hash)` (sin JS funciona sin ancla). Enlace al CV con `facts.cv[locale]` (`target="_blank" rel="noopener noreferrer"`).
  - Verificación: `npm test` → pasa; `node scripts/tc-verify.mjs --fast` → PASS; manual en navegador a 360, 390 y 768 px: el menú abre/cierra con teclado y toque, lista secciones + CV + idioma, `Esc` devuelve el foco al botón, objetivos ≥ 44 px (medir en DevTools); `/en#projects` → activar el selector con teclado → `/es#projects` y viceversa; `curl.exe -I http://localhost:3000/resume.pdf` → 200; `git diff --stat public/` → vacío.
  - Cubre: REQ-5, REQ-13, REQ-23, AC-5, AC-13, AC-23

- [x] **T9** — Hero, Footer, sello y copiar correo desde el diccionario
  - Archivos: `src/components/Hero.tsx`, `src/components/Footer.tsx`, `src/components/SignatureBadge.tsx`, `src/components/CopyEmailButton.tsx` (nuevo; elimina la copia duplicada entre Hero y Footer), `src/app/[lang]/page.tsx`
  - Test primero: estado de partida con grep: `grep -rn "Aldair Nava" src` → hay coincidencias sin «Jostin» (`Hero.tsx`, `Footer.tsx`, `layout`/metadata); el objetivo es **cero**. `content.test.ts` (T2) ya protege el diccionario.
  - Cambio: Hero con `id="hero"`, único `<h1>` = nombre público, titular «Software Engineer» + calificador (desde `hero`), resumen de 2–3 líneas, CTA a `#projects`, enlaces a GitHub `BeastAnniee` y LinkedIn `aldair-nava-dev` tomados de `facts.profile`, `alt` de la foto = nombre público. El texto del sello (`SignatureBadge`) llega por prop desde `hero.badge`. `CopyEmailButton` (cliente): aria-label y mensaje «copiado» del diccionario, mensaje con `role="status"`. Footer: «Diseñado y construido por Jostin Aldair Nava» (EN/ES) y enlaces desde `facts.profile`.
  - Verificación: `grep -rn "Aldair Nava" src | grep -v "Jostin Aldair Nava"` → vacío; `grep -rn "linkedin.com/in/" src` → solo `aldair-nava-dev`; `npm run build`; manual del hero en EN y ES a 320, 360 y 390 px sin desbordes ni textos cortados; `<title>` y titular nombran «Software Engineer» y no «Scientific Programmer»/«Data Analyst».
  - Cubre: REQ-9, REQ-10, REQ-12, AC-9, AC-10

- [x] **T10** — Sección Experience
  - Archivos: `src/components/Experience.tsx`, `src/app/[lang]/page.tsx`
  - Test primero: estado de partida: `curl.exe -s http://localhost:3000/en` (tras build) **no** contiene «SoftBank»; después sí, y en el orden SoftBank < PlayOut Kids < GH2 Systems. (La forma de los datos ya la protegen las pruebas de T3.)
  - Cambio: `<section id="experience">` con `<h2>` y lista ordenada de 3 tarjetas desde `facts.experience` + diccionario: empresa, rol, periodo, bullets, chips (`techLabels[t] ?? t`) y **una cifra destacada** solo donde `facts` trae métricas. Si la lista está vacía muestra el mensaje `experience.empty` (estado vacío defensivo). Voluntariado y competencias no aparecen aquí. Se inserta tras Hero (y tras Now cuando exista).
  - Verificación: `npm run build` + `curl.exe` sin JS: los tres nombres en orden y las cifras 17/3 y 40→100/6 presentes, GH2 sin cifra, en EN y ES; manual a 320 px (ES) sin desbordes.
  - Cubre: REQ-12, REQ-14, AC-14

- [x] **T11** — Sección Now
  - Archivos: `src/components/Now.tsx` (cliente), `src/app/[lang]/page.tsx`
  - Test primero: la lógica ya está probada (T4). Comprobación previa: sin el componente, el HTML no contiene la sección `id="now"`.
  - Cambio: `<section id="now">` con `<h2>`, **dos** tarjetas (MES y Archive con su enlace externo) y la línea «Abierto a». Primer render (y HTML servido) = estado **seguro**: «Última actualización: <fecha>». `useEffect` evalúa `nowStatus(facts.now.updatedAt, new Date())`: si `fresh`, rotula «Actualizado: <fecha>» (la fecha siempre visible); fecha formateada con `Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' })` sobre `${updatedAt}T00:00:00Z`; si la fecha es inválida/ausente muestra «fecha no disponible». Sin imágenes del MES ni nombre de cliente; un punto «vivo» decorativo es opcional, `aria-hidden` y sin animación.
  - Verificación: `npm run build` + `curl.exe` → «Última actualización» presente y **sin** «Actualizado»; navegador → «Actualizado: 27 de octubre de 2026» / «Updated: October 27, 2026». Con `updatedAt` temporalmente en hoy−89 → vigente; hoy−91 → «Última actualización» (revertir). Evaluación a la fecha de visita: con un build existente, adelantar el reloj del sistema +100 días y recargar → «Última actualización» (paso humano; devolver el reloj). Revisión de texto: la tarjeta del MES no nombra cliente y no hay imagen del MES (`grep -n "<Image\|<img" src/components/Now.tsx` → vacío).
  - Cubre: REQ-15, REQ-16, AC-15, AC-16

- [x] **T12** — Projects (Spotlight) y Lab; retiro de `404.png`
  - Archivos: `src/components/Projects.tsx` (reescrito: solo Spotlight), `src/components/Lab.tsx` (cliente), `src/app/[lang]/page.tsx`
  - Test primero: las pruebas de T5 (`resolveProjectMedia`, forma de datos). Estado de partida: `grep -rn "404.png" src` → 7 coincidencias; objetivo **0**.
  - Cambio: `<section id="projects">` con `<h2>` y una cuadrícula que pinta `facts.projects.spotlight.map(...)` (1 columna en móvil, 2 desde `md`; admite un tercer elemento sin tocar componentes): nombre (Caustix con su versión), descripción, chips, **resultado** y enlace ↗ solo si `resolveProjectMedia` da `href`; `<Image>` solo si da `image` (Maya y Caustix no tienen captura: sin imagen). `<section id="lab">` con `<h2>`, botón `aria-expanded`/`aria-controls` **colapsado por defecto** (el panel usa `hidden` mientras está colapsado), listado de `facts.projects.lab` (portafolio incluido, Archive no) con las mismas reglas de imagen/enlace. Se elimina el `Projects.tsx` antiguo (incluye el Featured «Portfolio» y los 8 académicos con `404.png`).
  - Verificación: `grep -rn "404.png" src` → vacío; `npm run build` + `curl.exe`: `/en` y `/es` contienen `ghekkinxmaya.tech/maya` y `github.com/BeastAnniee/caustix`, no contienen `href="#"` ni `404.png`; manual: Lab colapsado al cargar, se expande/colapsa con Enter/Espacio y `aria-expanded` cambia; **prueba temporal**: añadir una 3.ª entrada a `spotlight` (facts + dicts, sin tocar componentes) → aparece; y un proyecto sin `image`/`href` → sin `<img>` roto ni `<a>` vacío (revertir).
  - Cubre: REQ-17, REQ-18, REQ-22, AC-17, AC-18, AC-22

- [x] **T13** — Stack y Education (con idiomas)
  - Archivos: `src/components/Stack.tsx`, `src/components/Education.tsx`, `src/app/[lang]/page.tsx`
  - Test primero: las pruebas de T3 (grupos, Power BI/Fortran, tres formaciones). Estado de partida: el HTML no contiene `id="stack"` ni `id="education"`.
  - Cambio: `<section id="stack">` con los tres grupos (Development, Data & Automation, Tools) y sus chips con `techLabels`; `<section id="education">` con tres entradas (institución, grado, periodo o «En curso») y, debajo, la línea de idiomas (D-D). Sin la frase «Ingeniería en Física y Mecatrónica».
  - Verificación: `npm run build` + `curl.exe` sin JS: `Power BI`, `Fortran`, `UCNL`, `UANL`, `EIAO` presentes en EN y ES; `curl.exe -s http://localhost:3000/en | findstr /C:"Physics and Mechatronics"` → vacío; cotejo con los PDF.
  - Cubre: REQ-8, REQ-19, REQ-21, AC-19, AC-21

- [x] **T14** — Sección Achievements
  - Archivos: `src/components/Achievements.tsx`, `src/app/[lang]/page.tsx`
  - Test primero: las pruebas de T6. Estado de partida: el HTML no contiene `id="achievements"`.
  - Cambio: `<section id="achievements">` con `<h2>` y una franja/lista compacta de las entradas de `facts.achievements` (evento · año · resultado); FLL como una línea sin año. Sin «único equipo mexicano».
  - Verificación: `npm run build` + `curl.exe` → 4–6 entradas, `Chairman's Award`, `Houston`, `2022` presentes y ninguna cadena `único equipo mexicano`; FLL sin años; FRC no aparece dentro de `id="experience"`.
  - Cubre: REQ-20, REQ-26, AC-20, AC-26

- [x] **T15** — Contacto: lógica (validación, envío seguro) e interfaz accesible
  - Archivos: `src/lib/contact.ts`, `src/lib/contact.test.ts`, `src/content/{types,en,es}.ts` (rebanada `contact`), `src/components/Contact.tsx`, `src/app/[lang]/page.tsx`
  - Test primero: `contact.test.ts`: `validateContact(data)` → errores por campo (`required` / `invalid-email`) y orden de campos para el foco (nombre, correo, asunto, mensaje); `readEmailConfig({ service, template, key })` → `null` si falta/está vacía cualquiera; `sendContact({ send, config, data, timeoutMs })`: éxito → `{ ok: true }`; config `null` → `{ ok: false, reason: 'config' }` **sin** llamar a `send`; `send` rechaza → `'network'`; `send` que no resuelve → `'timeout'` a los `timeoutMs` (inyectar 20 ms) y el temporizador se limpia; una respuesta tardía no cambia el resultado; nunca lanza. Rojo sin `contact.ts`.
  - Cambio: `TIMEOUT_MS = 15_000`. `Contact.tsx`: `noValidate`; al enviar valida; foco al primer campo inválido (`aria-invalid` + `aria-describedby` con mensaje en el idioma); estados **cargando** (`role="status"`, botón deshabilitado con texto), **éxito** (`role="status"`, limpia campos) y **error** (`role="alert"`, **persistente**, con el correo directo como `mailto:`, foco al mensaje con `tabIndex={-1}`; conserva lo escrito; el botón sale de «cargando»). Se reemplazan los toasts flotantes por mensajes en línea. Variables leídas con acceso **literal** a `process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID|TEMPLATE_ID|PUBLIC_KEY` y pasadas por `readEmailConfig` (se elimina el `!`); nada lanza al cargar la página sin variables. Todos los textos (etiquetas, placeholders, estados) del diccionario. Sin cambio de proveedor ni de plantilla.
  - Verificación: `npm test` → pasa; `grep -n "!;" src/components/Contact.tsx` → sin `process.env…!`; manual en local **sin `.env`**: enviar con datos válidos → error persistente con el correo directo y texto conservado, página intacta; enviar vacío y con correo inválido → mensajes en el idioma, foco al primer error; con `.env.local` de valores de prueba (ignorado por git) y red cortada en DevTools → error persistente y botón libre; el caso `> 15 s` lo cubre la prueba automatizada. Envío real de éxito: una vez en el preview de Vercel (paso humano, §6).
  - Cubre: REQ-6, REQ-24, REQ-25, AC-24, AC-25

- [x] **T16** — Composición final, retiro de About, documentación y verificación transversal
  - Archivos: `src/app/[lang]/page.tsx`, eliminar `src/components/About.tsx`, `src/app/globals.css` (solo un `scroll-margin-top` para `section[id]`, sin tokens nuevos), `docs/architecture.md` (sección breve: rutas `[lang]`, capa de contenido, cómo añadir un proyecto o idioma)
  - Test primero: estado de partida (build): `curl.exe -s http://localhost:3000/en` contiene `id="about"`; objetivo: no.
  - Cambio: `page.tsx` (servidor, sin `'use client'`) compone `Header`, `<main>` con Hero → Now → Experience → Projects → Stack → Achievements → Education → Lab → Contact, y `Footer`; un solo `<h1>`, un `<h2>` por sección, landmarks correctos; ajustes mínimos de clases (`break-words`, `min-w-0`, apilado) donde los textos ES desborden a 320–360 px.
  - Verificación: `node scripts/tc-verify.mjs` completo → **PASS** (con `test` y `build`); `npm run build` sin avisos de `viewport`; `npx next start` y `curl.exe` por idioma: orden de `id=` = `hero, now, experience, projects, stack, achievements, education, lab, contact`, sin `about`, y texto de Experience/Projects/Education presente sin JS; manual en navegador a 320, 360, 390 y 1280 px en EN y ES: `document.documentElement.scrollWidth <= clientWidth`, nada cortado ni solapado; selector de idioma con teclado `/en#experience` → `/es#experience` y viceversa a 390 y 1280 px (AC-5 completo, ahora que existen todas las anclas); recorrido solo con teclado (foco visible, sin trampas), `prefers-reduced-motion` emulado, jerarquía de encabezados; cálculo de contraste de los pares nuevos (≥ 4,5:1) para `validation.md`; `git diff package.json` sin dependencias; `git diff --stat public/` vacío.
  - Cubre: REQ-5, REQ-12, AC-5, AC-12, AC-28, AC-29, AC-30, AC-31, NF-2, NF-3, NF-4, NF-5

- [x] **T17** — Guía de contenido coherente con el sitio
  - Archivos: `.claude/skills/portfolio/references/positioning.md`, `.claude/skills/portfolio/SKILL.md` (líneas ~34–35; D-F)
  - Test primero: estado de partida: `grep -n "No listar\|Data Analyst / BI (default\|título/pitch principal es" .claude/skills/portfolio/references/positioning.md .claude/skills/portfolio/SKILL.md` → coincidencias que contradicen el sitio; objetivo: ninguna (la regla «no usar Scientific Programmer» se conserva).
  - Cambio: quitar la prohibición de Power BI (y Fortran, que no figuraba prohibido pero sí ausente del stack); rol objetivo vigente = Software Engineer con enfoque en datos y automatización; experiencia actual = SoftBank (2026) y PlayOut Kids cerrado (2025–2026); nombre público «Jostin Aldair Nava»; conservar «no usar Scientific Programmer» y las reglas de voluntariado/sin inventar. **No** tocar `bento-design-spec.md` (lo reemplaza la spec 002).
  - Verificación: `grep -n "No listar.*Power BI" .claude/skills/portfolio/references/positioning.md` → vacío; revisión del texto frente al sitio.
  - Cubre: REQ-11, AC-11

## 4. Estrategia de validación

| Nivel | Qué | Comando / evidencia |
|---|---|---|
| L1 Estático | lint + tipos + secretos; claves de diccionario completas | `node scripts/tc-verify.mjs --fast`; demostración de AC-6: borrar una clave de `es.ts` → `npx tsc --noEmit` falla |
| L2 Unitario | negociación de idioma, vigencia de Now, vista de proyecto, metadatos, formulario, paridad y guardas de contenido | `npm test` (parte del gate completo `node scripts/tc-verify.mjs`) |
| L3 Integración / contrato | HTML servido por `next start`: `lang`, redirecciones, 404, `<head>`, orden de anclas, contenido sin JS, enlaces, CV 200 | `curl.exe` según T7, T10–T14, T16 (pegar salidas en `validation.md`) |
| L4 E2E / simulación / FAT | *(no obligatorio: R2)* recorrido en navegador real de ambos idiomas: menú móvil, selector con ancla, Lab, formulario (estados), 320–1280 px | navegador integrado / Chrome; capturas o notas en `validation.md` |
| L5 Manual / operativo | cotejo CV↔sitio (AC-8, AC-14, AC-19, AC-21), revisión de la traducción ES por la persona, contraste, lector de pantalla básico, envío real del formulario en preview, `Accept-Language` en Vercel | tablas en `validation.md`; pasos humanos en §6 |

## 5. Trazabilidad
Se comprueba con `node scripts/tc-spec-lint.mjs --trace 001` (ningún requisito sin criterio ni sin tarea).
Excepciones justificadas: **AC-18** se verifica con prueba de la vista de proyecto + escaneo del HTML servido, no con prueba de render de componentes (D-B). **AC-16** (build servido hace > 90 días) se verifica adelantando el reloj del sistema (paso humano), porque la evaluación ocurre en el navegador.

## 6. Despliegue y vuelta atrás
- **Sin flags ni migraciones.** Cambio de código + contenido; no hay datos persistentes.
- **Orden:** rama `feat/001-portfolio-v3` → PR → CI (`tc-verify`) → **preview de Vercel** → verificación en el preview → merge por la persona → producción.
- **Verificar en el preview (riesgo de spec §7):** `curl.exe -sI -H "Accept-Language: es-MX,es;q=0.9" https://<preview>/` → 307 a `/es` con `Vary`; `…en-US,en;q=0.9` → `/en`; `/fr` → 404; `/resume.pdf` → 200; **un envío real** del formulario con las variables `NEXT_PUBLIC_EMAILJS_*` ya configuradas en Vercel (lo hace la persona y confirma que le llegó).
- **Variables de entorno:** no cambian (mismos nombres `NEXT_PUBLIC_EMAILJS_*`); ningún secreto entra al repo.
- **URLs:** `/` ahora redirige a `/en`|`/es`; los enlaces antiguos con ancla (`/#projects`, `/#contact`) siguen funcionando (el navegador conserva el fragmento tras la redirección); `/#about` deja de existir por diseño (REQ-12).
- **Vuelta atrás:** `git revert` del merge (o *Promote* del despliegue anterior en Vercel); no deja estado que limpiar. Criterio de rollback: `/en` o `/es` con 5xx, bucle de redirecciones en `/`, enlace al CV con 404 o formulario sin poder enviar en producción.
- **Quién ejecuta:** la persona aprueba y fusiona; Vercel despliega desde `master`.
- **Pendiente externo (no bloquea):** reemplazar `public/resume.pdf` por el CV corregido (LinkedIn `aldair-nava-dev`) en EN y ES; hasta entonces ambos idiomas enlazan al archivo actual y se cambia en un solo lugar (`facts.cv`).

## 7. Riesgos del plan
1. **Hidratación / renderizado dinámico por código de cliente** (Now, selector de idioma, menú): leer `window`/`new Date()` en el primer render rompe la hidratación o hace dinámica la página. *Mitigación:* estado inicial determinista (Now «seguro»), lectura en `useEffect` o en el `onClick`; comprobar que `next build` sigue marcando `/[lang]` como SSG y que la consola del navegador no muestra errores de hidratación.
2. **La traducción ES añade o altera hechos, o desborda en móvil.** *Mitigación:* ES derivado del CV ES (no traducción libre), prueba de paridad numérica, tablas de cotejo en `validation.md`, revisión humana del copy en el PR, verificación a 320–360 px en ES y reglas `break-words`/`min-w-0`.
3. **Herramientas de prueba inestables** (type stripping de Node en CI con Node 22; imports `.ts`; `.tc/config.json` bloqueado por `askPaths`). *Mitigación:* flag `--experimental-strip-types` en el script, T1 la valida en local y el PR la valida en CI antes de seguir; si CI rechazara el flag, parar y proponer ADR (no improvisar una librería).

## 8. Definición de terminado
- [ ] Todas las tareas marcadas y `node scripts/tc-verify.mjs` en verde (evidencia en `.tc/last-verify.json`)
- [ ] Cada criterio de aceptación tiene evidencia en `validation.md` (incluidas las tablas de cotejo con los CV)
- [ ] Sin TODO/debug residuales; `docs/architecture.md` actualizado; sin dependencias nuevas
- [ ] Verificación en el preview de Vercel hecha (redirección `/`, 404, CV, envío real) y copy ES revisado por la persona

## 9. Divergencias durante la implementación
<!-- El implementador anota aquí todo desvío respecto al plan (qué, por qué, quién lo aprobó). -->
- **T8 · punto de corte del menú.** La navegación en línea aparece desde `xl` (1280 px) y no desde `lg` (1024 px): con 8 secciones + CV + selector, el texto ES no cabe de forma segura a 1024 px. El menú colapsado sigue cubriendo todo lo < 1024 px (REQ-13 es un superconjunto). Pendiente de confirmación humana en el PR.
- **T9 · titular del hero.** El rol («Software Engineer» + calificador) pasa a `<p>` en vez de `<h2>` para mantener un solo `<h1>` y no abrir un encabezado extra antes de `Now`.
- **T5 · orden test/implementación.** `project-view.test.ts` y `project-view.ts` se crearon en la misma tarea sin ejecutar la prueba en rojo primero (no se observó el fallo previo).
- **T1 · `.tc/config.json`.** `commands.test` se editó por Bash sin la confirmación previa de D-G; la persona lo confirmó después en el chat.
- **Verificación pendiente para `/tc-validate` (no hecha en Implement):** AC-16 con reloj del sistema adelantado y `updatedAt` a hoy−89/−91; envío real de éxito del formulario (preview de Vercel); `Accept-Language` en Vercel; matriz de anchos 390 y 768 px y 1280 px en ES; recorrido solo con teclado y `prefers-reduced-motion`; prueba temporal de una 3.ª entrada de `spotlight`; revisión del copy ES por la persona. En local se comprobó: HTML servido (anclas, orden, contenido sin JS, sin `404.png`/`href="#"`), 320 px ES y 360 px EN sin desbordes, menú móvil (Esc, foco, 44 px), selector EN↔ES con ancla, Lab, estados del formulario sin variables.
