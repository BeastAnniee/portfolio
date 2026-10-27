# Arquitectura y glosario

## Vista general
Sitio Next.js 15 (App Router, TypeScript, Tailwind 4) bilingüe y estático:

- `src/app/[lang]/` es el **layout raíz** (`<html lang>`), con `generateStaticParams` (`en`, `es`) y `dynamicParams = false`: `/en` y `/es` se generan en el build; cualquier otra ruta responde con `src/app/not-found.tsx`.
- `src/middleware.ts` solo atiende `/` y redirige (307, `Vary: Accept-Language`) según `negotiateLocale` (`src/lib/locale.ts`).
- `src/content/` es la capa de contenido: `facts.ts` (datos sin idioma, una sola vez), `en.ts` / `es.ts` (prosa, tipados con `Dictionary` de `types.ts`) e `index.ts` (`getDictionary`, `SECTION_IDS`). Los componentes solo renderizan.
- `src/lib/*.ts` son módulos puros probados con el ejecutor de Node (`npm test`); sin alias `@/`, imports relativos con extensión `.ts`.

## Límites y responsabilidades
- El texto visible nunca vive en un componente: sale del diccionario. Una clave que falta en `es` rompe `tsc` y la prueba de paridad.
- Cifras, fechas, empresas, URLs y tecnologías se declaran solo en `facts.ts`.
- Now evalúa su vigencia en el navegador con la fecha de la visita (`now-status.ts`); el HTML servido trae el estado seguro «última actualización».
- El formulario de contacto usa EmailJS con `NEXT_PUBLIC_EMAILJS_*`; si faltan o falla, muestra un error persistente con el correo directo (`contact.ts`).

## Datos e interfaces críticas
- Orden de secciones y anclas: `hero, now, experience, projects, stack, achievements, education, lab, contact`.
- Contenido derivado del CV: la autoridad es el CV EN 2026 (EN) y el CV ES 2026 (ES).
- `facts.cv` apunta ambos idiomas a `/resume.pdf` hasta que lleguen los CV corregidos.

## Cómo añadir
- **Proyecto:** una entrada en `facts.projects.spotlight` (o `lab`) con `id`, `name`, `href`, `tech` y, opcional, `image`; y su `description`/`result` en `en.ts` y `es.ts`. No se toca ningún componente.
- **Idioma:** añadirlo a `LOCALES`, crear su diccionario con `Dictionary` y registrarlo en `index.ts`; revisar `metadata.ts` y el selector.
- **Sección:** ampliar `SECTION_IDS`, `Dictionary` y los dos diccionarios a la vez.

## Glosario del dominio
- **WMS / PDA / POP:** sistema de gestión de almacén / terminal portátil de captura / punto de operación en planta (término dado por la persona para el MES).
- **MES:** sistema de ejecución de manufactura (proyecto actual, sin cliente nombrado).
- **Archive:** repositorio común de trabajos científicos de estudiantes.

## Entornos y despliegue
Vercel despliega desde `master`; los PR tienen preview. Verificar en el preview: redirección de `/`, 404, `/resume.pdf` y un envío real del formulario.
