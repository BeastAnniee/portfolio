---
type: spec
id: 001
title: Portafolio v3 — capa de contenido bilingüe y nueva arquitectura de información
aliases: ["001 · Portafolio v3 contenido bilingüe + IA"]
status: validated
risk: R2
created: 2026-10-27
owner: Jostin Aldair Nava
approved_by: Jostin Aldair Nava
approved_at: 2026-10-27
---

<!-- Fuentes: [[specs/001-portfolio-v3/strategy]] (análisis y decisiones §8), [[design/DESIGN]] (restricciones), CV EN 2026 y CV ES 2026 (Jostin_Nava_CV_EN_26.pdf / _ES_26.pdf, fuera del repo; autoridad de datos y de la traducción). Entrevista 2026-10-27. -->

## 1. Contexto y problema
aldair.me es la herramienta con la que un reclutador o líder técnico (casi siempre en móvil, una sola visita, poca atención) decide si contactar a Jostin. Hoy el sitio contradice al CV 2026 y esconde su trabajo real:

- **D1** vende «Data Analyst & Automation Developer» y no menciona SoftBank; el CV abre como «Full Stack and automation developer».
- **D2** el nombre es «Aldair Nava» en sitio/metadata/footer y «Jostin Nava» en el CV.
- **D3** About afirma «Physics and Mechatronics Engineering»; el CV dice Física (incompleta), Técnico/Associate en Mecatrónica Industrial e Ing. en Software en curso.
- **D4** no hay sección de experiencia; **D5** el único proyecto «featured» es el propio portafolio y 7 de 8 proyectos usan `404.png`; **D6** en < 1024 px no hay navegación ni acceso al CV.
- **D8** `<html lang="es">` con copy en inglés; sin `metadataBase` ni OG; `viewport` dentro de `metadata`. **D10** `Contact.tsx` usa `!` sobre variables de entorno. **D12** la guía de contenido prohíbe listar Power BI/Fortran, que el CV sí lista.
- No existe versión en español, y el contenido vive disperso en los componentes, que es la causa raíz de que sitio y CV diverjan.

Si no se hace, el enlace del portafolio sigue restando en cada postulación. Esta spec cubre **contenido, idioma e información** (qué se dice, en qué idiomas, en qué orden y con qué navegación). La identidad visual «póster brutalista» de `docs/design/DESIGN.md` queda **fuera** y tendrá su spec 002: aquí el contenido se renderiza con el sistema visual actual, funcional pero sin pulir.

## 2. Objetivos y no-objetivos
**Objetivos**
- Sitio bilingüe EN/ES con URL propia por idioma, SEO correcto y selector de idioma.
- Una sola fuente de contenido tipada; datos factuales definidos una vez; el sitio no puede volver a divergir del CV sin que se note en la revisión.
- Corregir D1–D3, D5, D6, D8, D10, D12 y presentar la experiencia real (SoftBank, PlayOut Kids, GH2 Systems).
- Nueva estructura de información: Hero → Now → Experience → Projects (Spotlight) → Stack → Achievements → Education → Lab → Contact, con navegación también en móvil.

**Fuera de alcance (explícito)**
- Identidad visual póster/brutalista, nuevos tokens y tipografías, rediseño del sello (spec 002 + contrato `/tc-design`).
- Paleta de comandos ⌘K (queda como candidata para una spec posterior).
- Retirar `Particles.tsx` y la dependencia `ogl` (requiere ADR; fase propia).
- Construir proyectos nuevos (Demand Forecasting, Automation Engine, landing de Caustix) y un tercer spotlight; el layout solo debe admitirlo.
- Reemplazar `public/resume.pdf` (espera el PDF con LinkedIn corregido, a entregar por la persona).
- Cambiar el proveedor o el flujo de envío (EmailJS) más allá de estados, accesibilidad y fallo seguro.
- Capturas o código de SoftBank o del MES industrial; la afirmación «único equipo mexicano en ganar el Chairman's Award».
- Persistencia de idioma (cookies/localStorage): la URL es la única fuente de verdad.

## 3. Requisitos

### Idioma y rutas
- **REQ-1.** CUANDO un visitante solicita `/en` o `/es`, EL SISTEMA DEBERÁ servir la página completa en ese idioma con el atributo `lang` del documento igual al idioma de la ruta.
- **REQ-2.** CUANDO un visitante solicita `/`, EL SISTEMA DEBERÁ redirigirlo (temporal, no permanente) a `/es` si el encabezado `Accept-Language` otorga a `es` una prioridad (`q`) mayor que a `en`, y a `/en` en cualquier otro caso (encabezado ausente, malformado, sin `es`/`en`, o con `q=0`); a igualdad de `q` gana el idioma listado primero.
- **REQ-3.** SI la ruta de primer nivel no es `en` ni `es` ENTONCES EL SISTEMA DEBERÁ responder con la página 404, nunca con un error 500.
- **REQ-4.** EL SISTEMA DEBERÁ emitir, por idioma, título, descripción y metadatos Open Graph (`og:locale`, `og:title`, `og:description`, imagen existente) propios, con `metadataBase` `https://aldair.me`, URL canónica y alternates `hreflang` para `en`, `es` y `x-default`.
- **REQ-5.** EL SISTEMA DEBERÁ mostrar en todos los anchos un selector de idioma operable con teclado que, al activarse, lleve a la misma página en el otro idioma conservando el ancla (`#sección`) activa, e indique el idioma actual de forma no solo visual.

### Capa de contenido
- **REQ-6.** EL SISTEMA DEBERÁ obtener todo texto visible o leído por tecnologías de asistencia (incluidos `alt`, `aria-label`, estados del formulario y metadatos) de diccionarios tipados `en` y `es` con idéntica estructura de claves, de modo que una clave faltante en cualquiera de los dos idiomas haga fallar el gate antes de llegar a producción.
- **REQ-7.** EL SISTEMA DEBERÁ definir una sola vez, independientemente del idioma, los datos factuales (empresas, periodos, cifras, nombres de eventos, tecnologías, URLs), y los textos traducibles no DEBERÁN introducir cifras, fechas, nombres ni afirmaciones ausentes del contenido fuente.
- **REQ-8.** EL SISTEMA DEBERÁ presentar el contenido derivado del CV (experiencia, educación, stack, idiomas) conforme al CV EN 2026 en la versión EN y al CV ES 2026 en la versión ES.
- **REQ-9.** EL SISTEMA DEBERÁ usar «Jostin Aldair Nava» como nombre público en encabezado, hero, pie, metadatos, autoría y `alt` de la foto, y enlazar solo a GitHub `BeastAnniee`, LinkedIn `aldair-nava-dev` y el correo jostinaval@gmail.com.
- **REQ-10.** EL SISTEMA DEBERÁ expresar en el titular del hero y en el `title` de cada idioma el rol «Software Engineer» con énfasis en datos y automatización, sin «Scientific Programmer» ni «Data Analyst» como título principal.
- **REQ-11.** EL SISTEMA DEBERÁ mantener la guía de contenido (`.claude/skills/portfolio/references/positioning.md`) coherente con el sitio: sin la prohibición de Power BI y Fortran y con el rol objetivo vigente.

### Arquitectura de información y navegación
- **REQ-12.** EL SISTEMA DEBERÁ ordenar la página como Hero, Now, Experience, Projects, Stack, Achievements, Education, Lab y Contact, cada una con ancla estable y encabezado semántico, y el hero DEBERÁ incluir un resumen breve (2–3 líneas) derivado del resumen profesional del CV (la sección About deja de existir como tal).
- **REQ-13.** EL SISTEMA DEBERÁ ofrecer navegación a las secciones, enlace al CV y selector de idioma también por debajo de 1024 px (menú que se abre y cierra con teclado y con `Esc`, con el foco devuelto al control que lo abrió, objetivos táctiles ≥ 44 px).
- **REQ-14.** EL SISTEMA DEBERÁ mostrar en Experience, en orden cronológico inverso, SoftBank, PlayOut Kids y GH2 Systems con empresa, rol, periodo y los bullets del CV, una cifra destacada solo donde el CV la da (SoftBank: 17 pantallas PDA y 3 idiomas; PlayOut Kids: concordancia 40 %→100 % y 6 departamentos) y las tecnologías nombradas en esos bullets.
- **REQ-15.** EL SISTEMA DEBERÁ mostrar en Now dos tarjetas (MES industrial; repositorio de trabajos científicos de estudiantes = Archive, con su enlace) y una línea «Abierto a: Software Engineer con enfoque en datos y automatización», redactadas sin nombrar cliente y sin capturas ni código del MES.
- **REQ-16.** CUANDO el visitante abre la página, EL SISTEMA DEBERÁ evaluar la vigencia de Now contra la fecha de la visita (no la del despliegue): con `updatedAt` válido y de 90 días naturales o menos presentarlo como vigente con su fecha visible; en cualquier otro caso (más de 90 días, ausente, inválido o futuro) rotularlo como «última actualización: <fecha>» y nunca como actual.
- **REQ-17.** EL SISTEMA DEBERÁ mostrar en Projects exactamente los proyectos terminados con evidencia pública (Maya y Caustix) a partir de una lista de datos, con nombre, descripción, tecnologías, resultado verificable y enlace, y DEBERÁ admitir un tercer proyecto añadiendo solo una entrada de datos.
- **REQ-18.** SI un proyecto no tiene imagen o enlace ENTONCES EL SISTEMA DEBERÁ renderizarlo sin recurso de imagen roto ni `<a>` vacío (`href="#"`), y ningún proyecto visible DEBERÁ usar `404.png`.
- **REQ-19.** EL SISTEMA DEBERÁ agrupar el stack en Development, Data & Automation y Tools conforme al CV, incluyendo Power BI y Fortran.
- **REQ-20.** EL SISTEMA DEBERÁ mostrar en Achievements entre 4 y 6 entradas con evento, año y resultado, únicamente con los datos confirmados de §6, y el voluntariado y las competencias NO DEBERÁN aparecer dentro de Experience.
- **REQ-21.** EL SISTEMA DEBERÁ mostrar en Education las tres formaciones del CV (UCNL en curso; UANL Física incompleta, 2023–2025; EIAO–UANL Mecatrónica Industrial, 2020–2023) y NO DEBERÁ afirmar «Ingeniería en Física y Mecatrónica».
- **REQ-22.** EL SISTEMA DEBERÁ mostrar en Lab los proyectos académicos y el propio portafolio colapsados por defecto, expandibles con teclado y con estado anunciado, sin repetir Archive (que vive en Now).

### Contacto y CV
- **REQ-23.** EL SISTEMA DEBERÁ ofrecer en cada idioma el enlace al CV apuntando a un archivo existente en `public/` (sin 404), y NO DEBERÁ reemplazar `public/resume.pdf` hasta que la persona entregue los CV corregidos.
- **REQ-24.** CUANDO el visitante envía el formulario de contacto, EL SISTEMA DEBERÁ mostrar estados de cargando, éxito y error en el idioma de la página, con etiquetas asociadas a cada campo, mensajes anunciados a tecnologías de asistencia y el foco llevado al primer campo inválido o al mensaje de error.
- **REQ-25.** SI el envío falla, excede 15 s o faltan las variables de configuración del servicio de correo ENTONCES EL SISTEMA DEBERÁ mostrar un error persistente que incluya el correo directo, conservar lo escrito por la persona, no quedarse en «cargando» y no interrumpir el renderizado de la página.

### Contenido no confirmado
- **REQ-26.** EL SISTEMA NO DEBERÁ publicar «único equipo mexicano…», años de FLL, nombre de cliente del MES, ni capturas/código de SoftBank o del MES; las entradas FLL aparecen en una línea sin años.

**No funcionales**
- **NF-1.** Sin dependencias nuevas de runtime; cualquier librería de i18n o de pruebas requiere ADR (P8).
- **NF-2.** El contenido principal de cada idioma está presente en el HTML servido (sin depender de JavaScript para leerlo).
- **NF-3.** Sin desbordamiento horizontal desde 320 px hasta 1280 px en ambos idiomas; los textos en ES (más largos) no se cortan ni solapan.
- **NF-4.** Accesibilidad básica sin regresión: foco visible, teclado completo, `MotionConfig reducedMotion` conservado, jerarquía de encabezados y landmarks correctos, contraste AA en los textos nuevos con los tokens actuales.
- **NF-5.** `node scripts/tc-verify.mjs` pasa, y la compilación no emite avisos de metadata deprecada (`viewport`).

## 4. Criterios de aceptación
| ID | Requisito | Dado / Cuando / Entonces | Verificación |
|---|---|---|---|
| AC-1 | REQ-1 | Dado el build de producción, cuando se piden `/en` y `/es`, entonces el HTML trae `<html lang="en">` y `<html lang="es">` respectivamente y el texto del hero en ese idioma. | Inspección del HTML servido (`next start` + `curl`) |
| AC-2 | REQ-2 | Dado `/`, cuando `Accept-Language` es `es-MX,es;q=0.9,en;q=0.8` → redirección temporal a `/es`; `en-US,en;q=0.9,es;q=0.5` → `/en`; `fr-FR` → `/en`; ausente → `/en`; `es;q=0` → `/en`; `en;q=0.5,es;q=0.5` → el primero listado. | Prueba automatizada de la función de decisión + `curl` a `next start` |
| AC-3 | REQ-3 | Dado `/fr` y `/en/x`, cuando se piden, entonces responden 404 (no 500). | `curl -I` en `next start` |
| AC-4 | REQ-4 | Dado el HTML de cada idioma, cuando se inspecciona `<head>`, entonces hay título y descripción distintos por idioma, `og:locale`, `og:image`, canonical propio y `hreflang` `en`/`es`/`x-default` con URLs absolutas de `aldair.me`. | Inspección del HTML servido |
| AC-5 | REQ-5 | Dado `/en#experience` en 390 px y en 1280 px, cuando se activa el selector con teclado, entonces se abre `/es#experience`; el selector indica el idioma actual con texto/`aria-current`, no solo color. | Manual en navegador (EN→ES y ES→EN) |
| AC-6 | REQ-6 | Dado el árbol de componentes, cuando se busca texto literal visible, `alt` o `aria-label` fuera de los diccionarios, entonces no hay ninguno; y cuando se borra una clave de `es`, entonces el typecheck falla. | `grep` + `npx tsc --noEmit` con la clave borrada (demostración temporal) |
| AC-7 | REQ-7 | Dado el contenido, cuando se comparan cifras, años y URLs entre EN y ES y contra los datos factuales, entonces coinciden y solo se declaran en un lugar. | Revisión de código + tabla de cotejo en `validation.md` |
| AC-8 | REQ-8 | Dado cada idioma, cuando se coteja Experience, Education, Stack e idiomas con el CV EN/ES 2026, entonces no hay diferencias de hecho ni afirmaciones añadidas. | Manual: tabla de cotejo en `validation.md` |
| AC-9 | REQ-9 | Dado el repositorio y el HTML servido, cuando se busca «Aldair Nava» sin «Jostin» delante y enlaces a LinkedIn/GitHub, entonces no hay coincidencias de nombre y los únicos enlaces son `BeastAnniee`, `aldair-nava-dev` y el correo. | `grep` en `src/` y en el HTML |
| AC-10 | REQ-10 | Dado el hero y el `<title>` de cada idioma, cuando se leen, entonces nombran «Software Engineer» con datos/automatización y no contienen «Scientific Programmer» ni «Data Analyst» como título. | Manual + `grep` |
| AC-11 | REQ-11 | Dado `positioning.md`, cuando se busca, entonces ya no prohíbe Power BI/Fortran y refleja el rol objetivo. | `grep` + revisión |
| AC-12 | REQ-12 | Dado cada idioma, cuando se listan los encabezados y anclas del HTML, entonces están en el orden Hero, Now, Experience, Projects, Stack, Achievements, Education, Lab, Contact; no existe `#about`; el hero contiene el resumen. | Inspección del HTML servido |
| AC-13 | REQ-13 | Dado 360, 390 y 768 px, cuando se abre el menú con teclado y táctil, entonces lista secciones + CV + idioma, objetivos ≥ 44 px, `Esc` lo cierra y el foco vuelve al botón. | Manual en navegador (viewport emulado) |
| AC-14 | REQ-14 | Dado Experience, cuando se lee en EN y ES, entonces aparecen las tres empresas en el orden SoftBank, PlayOut Kids, GH2 Systems con rol, periodo, bullets del CV y solo las dos cifras indicadas; GH2 no tiene cifra. | Manual (cotejo con CV) |
| AC-15 | REQ-15 | Dado Now, cuando se lee, entonces hay exactamente dos tarjetas (MES, Archive con enlace) y «Abierto a», sin nombre de cliente, sin imagen del MES. | Manual + `grep` |
| AC-16 | REQ-16 | Dado la fecha de visita simulada, cuando `updatedAt` está a 0, 89 y 90 días → vigente con fecha; a 91 días, ausente, inválida o futura → «última actualización», sin texto de vigencia. Y cuando se sirve un build de hace > 90 días, entonces la evaluación usa la fecha de la visita. | Prueba automatizada con fecha inyectada + verificación manual cambiando la fecha del navegador |
| AC-17 | REQ-17 | Dado Projects, cuando se renderiza, entonces hay exactamente Maya y Caustix con descripción, tecnologías (Maya: TypeScript, React, servidor MCP, A2UI; Caustix: Python, NumPy, Fortran), resultado y enlace (`ghekkinxmaya.tech/maya`, `github.com/BeastAnniee/caustix`); y cuando se añade una tercera entrada de datos, aparece sin tocar componentes. | Manual + prueba temporal de la 3.ª entrada |
| AC-18 | REQ-18 | Dado un proyecto sin `image` y otro sin enlace, cuando se renderizan, entonces no hay `<img>` roto ni `<a href="#">`/vacío; y no queda referencia a `404.png` en componentes ni datos visibles. | Prueba automatizada del render + `grep` |
| AC-19 | REQ-19 | Dado Stack, cuando se lee, entonces hay tres grupos conforme al CV e incluye Power BI y Fortran. | Manual (cotejo con CV) |
| AC-20 | REQ-20 | Dado Achievements, cuando se lee, entonces hay 4–6 entradas con evento·año·resultado, todas del §6, y FRC no aparece en Experience. | Manual + revisión |
| AC-21 | REQ-21 | Dado Education, cuando se lee en ambos idiomas, entonces son tres entradas conforme al CV y la frase «Ingeniería en Física y Mecatrónica» / «Physics and Mechatronics Engineering» no existe. | Manual + `grep` |
| AC-22 | REQ-22 | Dado Lab, cuando se carga la página, entonces está colapsado; con teclado se expande/colapsa con `aria-expanded`; Archive no aparece y el portafolio sí. | Manual |
| AC-23 | REQ-23 | Dado cada idioma, cuando se sigue el enlace al CV, entonces el PDF carga (200); y `public/resume.pdf` conserva el contenido previo mientras no se entregue el CV corregido. | `curl -I` + `git diff` sobre `public/` |
| AC-24 | REQ-24 | Dado el formulario, cuando se envía vacío, con correo inválido y válido, entonces se ven los estados cargando/éxito/error en el idioma, el foco va al primer error y los mensajes se anuncian (`role="alert"`/`status`). | Manual con teclado y lector (o inspección de roles) |
| AC-25 | REQ-25 | Dado un envío con red cortada, con respuesta > 15 s y con variables de entorno ausentes, cuando se envía, entonces aparece error persistente con el correo directo, el texto escrito se conserva, el botón sale de «cargando» y la página no falla. | Prueba automatizada con el servicio simulado + manual |
| AC-26 | REQ-26 | Dado el repositorio y el HTML servido, cuando se busca «único equipo mexicano», años de FLL, nombre de cliente del MES y capturas de SoftBank/MES, entonces no hay coincidencias; FLL es una línea sin años. | `grep` + revisión |
| AC-27 | NF-1 | Dado el diff, cuando se compara `package.json`, entonces no hay dependencias nuevas de runtime. | `git diff package.json` |
| AC-28 | NF-2 | Dado `next start`, cuando se pide cada idioma con `curl` (sin JS), entonces el HTML contiene el texto de Experience, Projects y Education. | Inspección del HTML servido |
| AC-29 | NF-3 | Dado 320, 360, 390 y 1280 px en EN y ES, cuando se recorre la página, entonces no hay scroll horizontal ni texto cortado o solapado. | Manual en navegador |
| AC-30 | NF-4 | Dado teclado, `prefers-reduced-motion` y los textos nuevos, cuando se recorre la página, entonces el foco es visible, no hay trampas, las animaciones se reducen y los pares texto/fondo nuevos alcanzan 4,5:1. | Manual + cálculo de contraste en `validation.md` |
| AC-31 | NF-5 | Dado el árbol final, cuando se ejecuta el gate, entonces termina con éxito y el build no muestra avisos de `viewport`. | `node scripts/tc-verify.mjs` (salida vista) |

## 5. Modos de falla y estado seguro
| Falla | Efecto | Detección | Estado seguro / respuesta | Criterio |
|---|---|---|---|---|
| `Accept-Language` ausente, malformado o sin es/en | Redirección indefinida o 500 | Prueba de la función de decisión | Redirige a `/en` | AC-2 |
| Ruta con idioma inválido (`/fr`) | 500 o contenido de otro idioma | `curl -I` | 404 | AC-3 |
| Clave de traducción faltante | Texto `undefined`/vacío en producción | Typecheck en el gate | El gate falla; no se despliega | AC-6, AC-31 |
| `updatedAt` de Now antiguo, ausente, inválido o futuro; build viejo en caché | Dato viejo presentado como actual (viola AGENTS.md web) | Prueba con fecha inyectada | «Última actualización: <fecha>»; evaluación a la fecha de visita | AC-16 |
| Proyecto sin imagen o sin enlace | Imagen rota o enlace muerto | Prueba de render + `grep` | Se renderiza sin ese elemento | AC-18 |
| Envío EmailJS falla / sin red / > 15 s | Visitante cree que contactó cuando no | Prueba con servicio simulado | Error persistente con correo directo; datos conservados | AC-25 |
| Variables de entorno de EmailJS ausentes | Fallo en runtime al cargar o enviar | Prueba sin variables | El formulario muestra error al enviar; la página sigue funcionando | AC-25 |
| JavaScript desactivado o hidratación fallida | Página vacía | `curl` sin JS | Contenido presente en el HTML servido | AC-28 |
| Textos ES más largos que EN en 320–360 px | Desbordamiento o solape | Revisión manual | Reflow sin scroll horizontal | AC-29 |
| Dato no confirmado se cuela al copy (años FLL, «único equipo mexicano», cliente del MES) | Afirmación falsa o indiscreción | `grep` en revisión | No se publica; se omite hasta confirmar | AC-26 |
| Enlace al CV apunta a archivo inexistente | 404 en la acción más valiosa del reclutador | `curl -I` | Apunta a un archivo existente; el reemplazo espera al CV corregido | AC-23 |

## 6. Interfaces y datos

**Rutas.** `/` (decisión de idioma, redirección temporal, respuesta `Vary: Accept-Language`) · `/en` · `/es` · cualquier otra → 404 existente.

**Reglas de `Accept-Language`.** Se consideran solo `es` y `en` (con subetiquetas, p. ej. `es-MX`); `q` por defecto 1; `q=0` excluye; gana la mayor `q`; empate → el primero listado; ninguno → `en`.

**Contenido (descripción, no implementación).**
- *Datos factuales, sin idioma:* perfil (nombre, correo, enlaces), experiencia (empresa, periodos, cifras, tecnologías), proyectos (nombre, URLs, tecnologías, imagen opcional), stack, logros (evento, año), educación, Now (`updatedAt`).
- *Diccionarios EN/ES:* toda la prosa y los rótulos. Para el contenido derivado del CV, la fuente de redacción es el CV EN 2026 (EN) y el CV ES 2026 (ES); el resto de ES se traduce del EN sin añadir afirmaciones y lo revisa la persona en el PR.

**Datos confirmados de Achievements (únicos publicables).**
- FRC TIGRES 6652, 2021–2023: coordinador administrativo y miembro; llegada a Mundiales; **Chairman's Award, nivel división, FIRST Championship Houston 2022**; **Dean's List Semi-finalist, 2022**; competencias en Monterrey, Torreón, Houston y Alabama.
- Hack MTY 2025 (Open Innovation de Banorte): 3.er lugar, equipo Ghekkin.
- Hack MTY 2026 (Open Innovation de Banorte): 3.er lugar con Maya.
- FIRST LEGO League, **una línea sin años**: premio a mejor programación y nominación a Global Innovation Award; CDMX, Monterrey, LEGOLAND California.

**Proyectos de Spotlight.**
- *Maya* — asistente financiero con IA; TypeScript, React, servidor MCP, A2UI; 3.er lugar, Open Innovation de Banorte, Hack MTY 2026; https://ghekkinxmaya.tech/maya.
- *Caustix v1.0.0* — librería de física en Python (NumPy) con verificador independiente RK4 en Fortran que vive solo en GitHub (no en el paquete publicado); resultado: v1.0.0 + verificador RK4; https://github.com/BeastAnniee/caustix (la landing, cuando exista, sustituye al repositorio como enlace principal).

**Now.** MES industrial (registro de líneas de producción, control de almacén, conexión con POPs y PDA; texto genérico, sin cliente); repositorio común de trabajos científicos de estudiantes = Archive (https://github.com/BeastAnniee/archive); «Abierto a: Software Engineer con enfoque en datos y automatización». `updatedAt` inicial: 2026-10-27. Umbral de vigencia: 90 días naturales (≤ 90 vigente).

**Formulario de contacto.** Campos nombre, correo, asunto, mensaje; envío vía EmailJS con tiempo máximo de 15 s; configuración por variables `NEXT_PUBLIC_EMAILJS_*` (sin secretos en el repositorio).

## 7. Supuestos, dependencias y riesgos
- **Decisiones de la persona (entrevista 2026-10-27):** alcance = contenido + IA, visual en spec 002 · rutas `/en` y `/es` con `/` por `Accept-Language` · SoftBank aparece **con nombre**, como en el CV, sin capturas ni código · FLL sin años; Dean's List Semi-finalist 2022 · EN+ES · rol objetivo Software Engineer con datos · Power BI y Fortran se listan · dirección visual en `DESIGN.md`.
- **Dependencia (no bloquea esta spec):** CV corregido (LinkedIn `aldair-nava-dev`) en EN y ES, a entregar por la persona; hasta entonces `public/resume.pdf` queda intacto y ambos idiomas enlazan a un archivo existente.
- **Supuesto:** el texto exacto del hero, del resumen y de las tarjetas de Now (incluido el término «POPs», dado por la persona) lo redacta el agente a partir de las fuentes y lo revisa la persona en el PR; si el hueco es de hecho (no de redacción), se omite en vez de inventarse.
- **Supuesto:** el repositorio no tiene ejecutor de pruebas (`test: null`). Las verificaciones automatizadas marcadas en §4 requieren uno; el plan decide entre el ejecutor integrado de Node (sin dependencia) o un ADR si se requiere una librería.
- **Supuesto:** el MES de Now y el WMS de SoftBank se presentan como descripciones independientes y sin afirmar si son el mismo proyecto; nada del MES nombra cliente.
- **Riesgo:** con `Accept-Language` la redirección de `/` depende de cómo se sirva el sitio (despliegue en Vercel); el plan debe comprobarlo.
- **Riesgo:** reescribir ES sin añadir afirmaciones depende de revisión humana; mitigado con la tabla de cotejo (AC-8).
- **Riesgo:** el sistema visual actual (bento) se reemplazará en la spec 002; el trabajo de estructura de esta spec debe sobrevivir al cambio (los datos y diccionarios no dependen de estilos).
- **Dependencia de datos en el CV:** Education usa «Associate Degree» (EN) y «Técnico Superior Universitario» (ES) tal como los dos CV.

## 8. Preguntas abiertas
_(ninguna)_

## 9. Decisiones relacionadas
- [[specs/001-portfolio-v3/strategy]] — análisis, decisiones §8 y plan por fases (esta spec reúne las fases 1, 2 y 3–4 de contenido).
- [[design/DESIGN]] — contexto de diseño; el contrato visual irá en la spec 002.
- Posible ADR en el plan: ejecutor de pruebas (solo si exige dependencia).
