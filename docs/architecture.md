# Arquitectura y glosario

## Vista general
Sitio Next.js 15 (App Router, TypeScript, Tailwind 4) bilingüe y estático:

- `src/app/[lang]/` es el **layout raíz** (`<html lang>`, con el `Header` y el `Footer` compartidos), con `generateStaticParams` (`en`, `es`) y `dynamicParams = false`. Hay **tres páginas** por idioma, cada una con su `<main>` y sus metadatos: `/[lang]` (Home: Hero, cinta, proyectos destacados, cifras, stack, contacto), `/[lang]/work` (Trabajo: proyectos, Now y Lab) y `/[lang]/about` (Sobre mí: experiencia, logros, educación y contacto). Se generan 6 rutas en el build; cualquier otra responde con `src/app/global-not-found.tsx`.
- `src/middleware.ts` solo atiende `/` y redirige (307, `Vary: Accept-Language`) según `negotiateLocale` (`src/lib/locale.ts`).
- `src/content/` es la capa de contenido: `facts.ts` (datos sin idioma, una sola vez), `en.ts` / `es.ts` (prosa, tipados con `Dictionary` de `types.ts`), `pages.ts` (las páginas, sus secciones `PAGE_SECTIONS`, la página siguiente, `legacyTarget` para las anclas antiguas y `switchLocalePath`) e `index.ts` (`getDictionary`). Los componentes solo renderizan.
- `src/lib/*.ts` son módulos puros probados con el ejecutor de Node (`npm test`); sin alias `@/`, imports relativos con extensión `.ts`.
- `src/animation/` es el movimiento (GSAP + ScrollTrigger): `config.ts`, `specs.ts` (las animaciones como datos), `hero.ts`, `reveal.ts`, `lab.ts`, `curtain.ts`, `intent.ts`, `probe.ts`. Solo `PageMotion.tsx` (cliente, sin UI, una vez por página) los carga con `import()` dinámico y todo va dentro de `gsap.matchMedia()` con `mm.revert()` al desmontar. **Regla: el contenido es visible por defecto**; el único estado oculto lo pone el CSS bajo `html[data-gsap='wait']` y se libera al arrancar, ante un error o a los 1200 ms.

## Límites y responsabilidades
- El texto visible nunca vive en un componente: sale del diccionario. Una clave que falta en `es` rompe `tsc` y la prueba de paridad.
- Cifras, fechas, empresas, URLs y tecnologías se declaran solo en `facts.ts`.
- Now evalúa su vigencia en el navegador con la fecha de la visita (`now-status.ts`); el HTML servido trae el estado seguro «última actualización».
- El formulario de contacto usa EmailJS con `NEXT_PUBLIC_EMAILJS_*`; si faltan o falla, muestra un error persistente con el correo directo (`contact.ts`).

## Datos e interfaces críticas
- Secciones y anclas por página (`PAGE_SECTIONS`): Home `featured, numbers, stack, contact`; Trabajo `projects, now, lab`; Sobre mí `experience, achievements, education, contact`. La ficha `[NN]` es la posición dentro de su página. Las anclas de la antigua página única (`#now`, `#experience`, `#projects`, `#stack`, `#achievements`, `#education`, `#lab`) las resuelve el cliente (`LegacyAnchors`) hacia su página nueva.
- Contenido derivado del CV: la autoridad es el CV EN 2026 (EN) y el CV ES 2026 (ES).
- `facts.cv` apunta a `/Jostin_Nava_CV_EN_26.pdf` (EN) y `/Jostin_Nava_CV_ES_26.pdf` (ES) en `public/`; `public/resume.pdf` queda sin enlazar.

## Cómo añadir
- **Proyecto:** una entrada en `facts.projects.spotlight` (o `lab`) con `id`, `name`, `href`, `tech` y, opcional, `image`; y su `description`/`result` en `en.ts` y `es.ts`. Un `spotlight` aparece en Home como resumen y en Trabajo como tarjeta completa; un `lab`, solo en el Lab de Trabajo. No se toca ningún componente.
- **Idioma:** añadirlo a `LOCALES`, crear su diccionario con `Dictionary` y registrarlo en `index.ts`; revisar `metadata.ts` y el selector.
- **Sección:** añadir su id a `PAGE_SECTIONS` de la página que corresponda (`src/content/pages.ts`), montarla en esa `page.tsx` respetando el orden y las reglas de bloques (máx. 2 invertidos por página, no consecutivos), y ampliar `Dictionary` y los dos diccionarios a la vez.
- **Animación:** describirla como datos en `src/animation/specs.ts` (solo `transform`, `opacity` y `--p`), marcar el DOM con `data-enter`, `data-reveal` o `data-reveal-item` (nunca sobre un nodo con transform CSS propio) y mantener el contenido visible sin JS.

## Glosario del dominio
- **WMS / PDA / POP:** sistema de gestión de almacén / terminal portátil de captura / punto de operación en planta (término dado por la persona para el MES).
- **MES:** sistema de ejecución de manufactura (proyecto actual, sin cliente nombrado).
- **Archive:** repositorio común de trabajos científicos de estudiantes.

## Entornos y despliegue
Vercel despliega desde `master`; los PR tienen preview. Verificar en el preview: redirección de `/`, 404, los dos CV y un envío real del formulario.
