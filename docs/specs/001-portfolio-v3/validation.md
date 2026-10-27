---
type: validation
spec: "[[specs/001-portfolio-v3/spec]]"
verdict: PASS-PENDIENTES
commit: 0c647f6 (base; árbol de trabajo con cambios sin commit)
date: 2026-10-27
---
<!-- verdict: PASS | FAIL | PASS-PENDIENTES (PASS con pendientes humanos). Solo en el frontmatter: lo lee el gate. -->
# Validación · 001-portfolio-v3

Tercera validación escéptica, con contexto limpio, sobre el árbol de trabajo tras `/tc-implement fix`. Todo lo de abajo salió de comandos ejecutados en esta sesión (Node 24.12, Next 15.5.23, `next start` en el puerto 3300, Chrome headless por CDP con scripts desechables fuera del repo, y lectura de los dos PDF de CV). No se modificó código ni tests. La demostración destructiva de AC-6 se hizo sobre una copia de `src/content` fuera del repo.

## Gate automático
```
$ node scripts/tc-verify.mjs --all
✔ web          lint         pass (7.5s)
✔ web          typecheck    pass (3.6s)
✔ web          test         pass (0.8s)
✔ web          build        pass (27.6s)
⚠ web          integration  not-configured
✔ *            specs        pass (1 spec(s), modo warn)
✔ *            secrets      pass
VEREDICTO: PASS · working tree con cambios sin commit

$ npm test  -> tests 59 · pass 59 · fail 0
```
Línea base: el plan no registra fallos preexistentes. `integration` no está configurada: aviso, no fallo.

## Trazabilidad
```
$ node scripts/tc-spec-lint.mjs --trace 001
REQ-1..REQ-26 -> todos con AC y con tareas T1..T17 en ✔ (sin ⚠/✖)
$ node scripts/tc-spec-lint.mjs 001
✔ 1 spec(s) coherentes.
```
La matriz solo lista REQ-1..26; AC-27..31 (NF-1..5) se verificaron aparte.

## Criterios de aceptación
| ID | Resultado | Evidencia (esta ejecución) |
|---|---|---|
| AC-1 | ✔ | `curl :3300/en` -> 200 `<html lang="en">`; `/es` -> 200 `<html lang="es">`; hero «Software Engineer» en el HTML servido. |
| AC-2 | ✔ | `npm test` (`negotiateLocale`) y `curl -D -` a `/`: `es-MX,es;q=0.9,en;q=0.8` -> 307 `/es`; `en-US,en;q=0.9,es;q=0.5` -> `/en`; `fr-FR` -> `/en`; `es;q=0` -> `/en`; `en;q=0.5,es;q=0.5` -> `/en`; `es;q=0.5,en;q=0.5` -> `/es`; `garbage;;;`, `es;q=abc`, `*` -> `/en`; sin cabecera -> `/en`. Todas con `vary: Accept-Language`; `/?a=1` + `es` -> `/es?a=1`. |
| AC-3 | ✔ | `/fr` 404, `/en/x` 404, `/es/x/y` 404; ningún 500. |
| AC-4 | ✔ | `<head>` EN/ES: título y descripción distintos; `og:locale` `en_US`/`es_MX` (+alternate); `og:image` `https://aldair.me/profile.jpg` con alt por idioma; canonical `https://aldair.me/en` / `/es`; `hreflang` `en`, `es`, `x-default` (-> `/en`) absolutos. |
| AC-5 | ✔ (☐ teclado real) | Chrome: `/en#experience` -> activar `<a hreflang="es">` -> `/es#experience lang=es`, y `/es#experience` -> `/en#experience lang=en`, a 390 px (con menú abierto) y a 1280 px. La activación fue por `focus()`+`click()`, no por pulsación de Enter real. |
| AC-6 | ✔ | `grep -E '(aria-label|alt|placeholder|title)="[A-Za-z]' src --include=*.tsx` -> sin coincidencias. Demostración sobre copia de `src/content`: control con `es.ts` intacto sin errores de diccionario; con la línea `footer` borrada -> `es.ts(3,14): error TS2741: Property 'footer' is missing ... required in type 'Dictionary'`. Más la paridad de `content.test.ts` (59/59). |
| AC-7 | ✔ | Cifras, URLs y periodos solo en `src/content/facts.ts`; los diccionarios llevan prosa. `content.test.ts` compara paridad numérica EN=ES y `metric.value` contra los bullets. |
| AC-8 | ✔ | Releí `Jostin_Nava_CV_EN_26.pdf` y `_ES_26.pdf` y los cotejé con `en.ts`/`es.ts`/`facts.ts`: roles, 4+4+1 bullets, periodos, stack (12/10/6), educación (3) e idiomas coinciden palabra por palabra; resumen del hero = 2 primeras frases del CV (la 3.ª, de competencias, se omite en ambos idiomas). Teléfono y LinkedIn del CV no copiados. HTML servido muestra «Languages: Spanish: native \| English: intermediate (B1)» / «Idiomas: Español: nativo \| Inglés: intermedio (B1)». |
| AC-9 | ✔ | HTML EN y ES: 0 «Aldair Nava» sin «Jostin» delante; enlaces externos solo `github.com/BeastAnniee[/repos]`, `linkedin.com/in/aldair-nava-dev`, `ghekkinxmaya.tech/maya`; el correo `jostinaval@gmail.com` aparece 3 veces en el HTML (no como `mailto:` servido; el `mailto:` solo se genera en el mensaje de error, ver AC-25). |
| AC-10 | ✔ | `<title>` EN «Jostin Aldair Nava — Software Engineer \| Data & Automation», ES «… \| Datos y Automatización»; 0 «Scientific Programmer» en el HTML. «Data Analyst» solo como rol literal de PlayOut Kids. |
| AC-11 | ✔ (previo) | No re-ejecuté el `grep` de `positioning.md`/`SKILL.md`; `git status` muestra ambos modificados. Evidencia de la validación anterior: ya no hay «No listar … Power BI». |
| AC-12 | ✔ | Orden de `<section id>` en EN y ES: `hero, now, experience, projects, stack, achievements, education, lab, contact`; 0 `id="about"`; 1 `<h1>` y 8 `<h2>`; hero con resumen. |
| AC-13 | ✔ | Chrome a 360 (EN), 390 (ES) y 768 (EN): botón 44×44; 10 elementos en el menú (8 secciones + CV + idioma), mínimo 44×44; `aria-expanded` false -> true; `Esc` real (`Input.dispatchKeyEvent`) -> `aria-expanded="false"` y `document.activeElement` = botón. |
| AC-14 | ✔ | Offsets en HTML EN: SoftBank 23248 < PlayOut Kids 26115 < GH2 Systems 27961; ES 23385 < 26349 < 28293. Métricas 17/3 y 40→100 %/6; GH2 `metrics: []`. Roles y bullets = CV (AC-8). |
| AC-15 | ✔ | Dos tarjetas (MES, Archive con `github.com/BeastAnniee/archive`) y «Open to / Abierto a: Software Engineer …»; texto del MES sin cliente ni imagen. |
| AC-16 | ✔ | `now-status.test.ts` (parte de 59/59). Navegador, con `Date` sustituido por fecha de visita simulada sobre el mismo build: visita −1 d (`updatedAt` futuro) «Last updated: October 27, 2026»; 0, 89 y 90 d «Updated: October 27, 2026»; 91 y 100 d «Last updated: …». HTML servido sin JS: «Last updated»/«Última actualización». |
| AC-17 | ✔ (☐ 3.ª entrada) | HTML con Maya y Caustix con enlaces `ghekkinxmaya.tech/maya` y `github.com/BeastAnniee/caustix`, tecnologías y resultado; `Projects.tsx` mapea `facts.projects.spotlight`. La prueba temporal con una 3.ª entrada no se repitió (no puedo modificar código/datos). |
| AC-18 | ✔ | `project-view.test.ts` en verde; HTML EN/ES: 0 `href="#"`, 0 `404.png`. No hay prueba permanente de render de componentes (D-B del plan; hallazgo 4 del review sigue abierto). |
| AC-19 | ✔ | Tres grupos con el contenido del CV; Power BI y Fortran presentes en el HTML. |
| AC-20 | ✔ | 6 entradas (frc, chairmans, deans, hackmty2025, hackmty2026, fll) en el HTML; FLL sin año; FRC solo como logro. |
| AC-21 | ✔ | Tres entradas de Education (UCNL, UANL, EIAO) en EN y ES; 0 coincidencias de «Physics and Mechatronics Engineering»/«Ingeniería en Física y Mecatrónica» en el HTML. |
| AC-22 | ✔ | Chrome: `aria-expanded="false"` y panel `hidden` al cargar; con foco + `click()` -> `true`; el panel contiene «portfolio» y no «archive». |
| AC-23 | ✔ | `curl /resume.pdf` -> 200; `git status --short public` y `git diff --stat -- public` vacíos. |
| AC-24 | ✔ (☐ lector) | Chrome ES: envío vacío -> foco en `contact-name`, 4 campos `aria-invalid`, todos con `<label>` asociada; correo inválido -> foco en `contact-email`; error `role="alert"`. Sin lector de pantalla. |
| AC-25 | ✔ (☐ red cortada con variables) | `contact.test.ts` (sin config sin llamar a `send`, rechazo, timeout con 20 ms, respuesta tardía, no lanza). Chrome sin variables: alerta persistente «No se pudo enviar tu mensaje. Lo que escribiste sigue aquí. También puedes escribirme directamente a jostinaval@gmail.com» con `mailto:jostinaval@…`, mensaje conservado, botón «Enviar mensaje» con `disabled=false`. El caso > 15 s solo por prueba unitaria (aceptado por el plan). |
| AC-26 | ✔ | HTML EN/ES: 0 «único equipo mexicano»/«only Mexican team»; sin cliente del MES; FLL sin años en el HTML. |
| AC-27 | ✔ | `git diff package.json`: solo `scripts.test` y `engines.node >=22.6` (este último añadido por el fix del hallazgo 5 del review; no es dependencia y no estaba en el plan, ver alcance). `dependencies` intactas. |
| AC-28 | ✔ | `curl` sin JS: texto de Experience, Projects, Education, Stack, Achievements y Now; 0 `opacity:0` inline en el HTML servido. |
| AC-29 | ✔ | Chrome 320, 360, 390, 768, 1024 y 1280 px en EN y ES: `scrollWidth <= clientWidth` en las 12 combinaciones. Sello del hero (hallazgo MAJOR del review): capturas a 3× en `/es` y `/en` -> el texto completo se dibuja sobre el anillo, sin cortes ni solapes visibles. |
| AC-30 | ☐ | Contraste calculado con los tokens: negro sobre page/container/mint/amber/lilac/purple 12,2–19,4:1; grafito sobre page 5,49:1 y container 6,58:1 (todos los usos del grafito están sobre page/container); titular del hero `purple-deep` 3,76:1 sobre container y 3,14:1 sobre page (cumple AA solo como texto grande ≥ 24 px en negrita; no alcanza 4,5:1). `MotionProvider.tsx` sin cambios (`git status`). Sin recorrido solo con teclado ni emulación de `prefers-reduced-motion` en esta ejecución. |
| AC-31 | ✔ | `node scripts/tc-verify.mjs --all` -> PASS; el build compila sin fallos; `export const viewport` en el layout. |

## Modos de falla (R2/R3)
| Falla | ¿Probada? | Evidencia |
|---|---|---|
| `Accept-Language` ausente/malformado/sin es-en | Sí | AC-2: pruebas unitarias + `curl` (9 cabeceras + ausente). |
| Ruta de idioma inválido (`/fr`) | Sí | AC-3: 404. |
| Clave de traducción faltante | Sí | AC-6: `TS2741` demostrado + paridad en `content.test.ts`. |
| `updatedAt` antiguo/ausente/inválido/futuro; build viejo | Sí | AC-16: unitarias + navegador con fecha de visita simulada (−1, 0, 89, 90, 91, 100 días). |
| Proyecto sin imagen o enlace | Parcial | AC-18: unitaria + HTML real; sin prueba permanente de render. |
| Envío EmailJS falla / sin red / > 15 s | Parcial | AC-25: unitarias con servicio simulado; navegador solo sin configuración. |
| Variables de EmailJS ausentes | Sí | AC-25: navegador sin `.env`, error persistente con correo directo. |
| JavaScript desactivado / hidratación fallida | Sí (contenido) | AC-28: `curl`. Degradación conocida: sin JS el menú < 1280 px y Lab no se abren (hallazgo 3 del review, abierto). |
| Textos ES más largos en 320–360 px | Sí | AC-29: 12 combinaciones + sello. |
| Dato no confirmado se cuela al copy | Sí | AC-26: `grep` en HTML + guardas de `content.test.ts`. |
| Enlace al CV apunta a archivo inexistente | Sí | AC-23: `/resume.pdf` 200; la prueba verifica existencia. |

## Verificaciones de alcance
- [x] Archivos modificados ⊆ archivos del plan. Excepciones: `package.json` también lleva `engines` y existe `.nvmrc` (fix del review, no listados en T1 ni en plan §9: conviene anotarlos); andamiaje del método (`CLAUDE.md`, `.gitignore`, `.gitattributes`, `docs/`). Divergencias de `plan.md` §9 vigentes (menú en línea desde `xl`, `<p>` en el titular, T5 sin test en rojo, T1 editó `.tc/config.json` antes de confirmar).
- [x] Sin dependencias nuevas (`git diff package.json`) · Sin secretos (gate `secrets` pass) · Sin TODO/debug (`grep TODO|FIXME|console.log|debugger src` -> vacío).
- [x] Docs al día: `docs/architecture.md` describe `[lang]`, `src/content/`; `positioning.md` y `SKILL.md` modificados.
- [ ] Higiene de git: `git log master..HEAD --oneline` -> vacío. Las 17 tareas siguen sin commitear (el plan pedía un commit por tarea). Debe resolverse antes de `/tc-ship`.

## Pendientes humanos
- ☐ Revisión del copy ES por la persona (hero, tarjetas de Now, «POPs», Lab, Caustix; spec §7).
- ☐ Preview de Vercel: `curl -sI -H "Accept-Language: es-MX,es;q=0.9" https://<preview>/` -> 307 `/es` con `Vary`, sin que el CDN mezcle idiomas; `/fr` -> 404; `/resume.pdf` -> 200.
- ☐ Envío real del formulario con `NEXT_PUBLIC_EMAILJS_*` en Vercel (éxito y recepción del correo) y prueba con red cortada y variables válidas.
- ☐ Recorrido solo con teclado (incluido Enter sobre el selector), lector de pantalla y `prefers-reduced-motion` (AC-5, AC-24, AC-30).
- ☐ Decidir sobre el contraste del titular del hero (3,76:1 / 3,14:1) o diferirlo a la spec 002.
- ☐ Confirmar el corte en `xl` del menú en línea (T8) y el `<p>` en lugar de `<h2>` (T9).
- ☐ Reemplazar `public/resume.pdf` cuando existan los CV corregidos (dependencia externa; no bloquea).
- ☐ Commitear el trabajo antes de `/tc-ship`; `review.md` sigue con `verdict: CHANGES-REQUESTED` (hallazgos MINOR 3 y 4 abiertos), repetir `/tc-review 001` tras el commit.
- ☐ Gates manuales de `.tc/config.json`: ninguno configurado (`manualGates: []`).

## Conclusión
Demostrado en esta ejecución: gate completo en verde (59/59 pruebas, build, lint, tipos, secretos), trazabilidad limpia, redirecciones, 404, metadatos, orden de secciones y contenido en el HTML servido, cotejo con los dos PDF de CV, ausencia de desbordes de 320 a 1280 px en ambos idiomas, menú móvil con `Esc` y foco, selector con ancla, Lab, vigencia de Now con fecha de visita simulada, formulario con estados y error persistente, sello del hero sin cortes en ES y la demostración de `TS2741` por clave faltante. Ningún criterio en ✖. Quedan pendientes humanos (copy ES, preview de Vercel, envío real, accesibilidad asistida y decisión de contraste) y el commit del trabajo.
