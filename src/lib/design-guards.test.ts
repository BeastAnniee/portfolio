import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()

/** Pruebas que citan los patrones prohibidos como literales para poder buscarlos. */
const SELF = new Set(['src/lib/design-guards.test.ts', 'src/lib/design-css.test.ts'])

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const sources = walk(join(root, 'src'))
  .map((path) => relative(root, path).replace(/\\/g, '/'))
  .filter((path) => /\.(ts|tsx|css)$/.test(path) && !SELF.has(path))
  .map((path) => ({ path, text: readFileSync(join(root, path), 'utf8') }))

const hits = (pattern: RegExp) => sources.filter((s) => pattern.test(s.text)).map((s) => s.path)

test('sin rastro del sistema bento en src/', () => {
  assert.deepEqual(hits(/bento/i), [])
})

test('sin sombras, degradados, ring, backdrop ni transition-all', () => {
  const forbidden =
    /box-shadow|(^|[^a-z-])shadow(-|\b)|drop-shadow|gradient|(^|[^a-z-])ring(-|\b)|backdrop-|transition-all|transition:\s*all|outline-none/
  assert.deepEqual(hits(forbidden), [])
})

test('sin utilidades transition de Tailwind (el hover es instantáneo)', () => {
  assert.deepEqual(hits(/(^|[\s"'`])(\w+:)*transition(-(colors|shadow|opacity))?(?=[\s"'`])/), [])
})

test('las tarjetas invertidas no usan text-accent ni text-bone-2', () => {
  const byPath = (p: string) => sources.find((s) => s.path === p)?.text ?? ''
  assert.doesNotMatch(byPath('src/components/Projects.tsx'), /text-(accent|bone-2)\b/)
  const card = byPath('src/components/ProjectCard.tsx')
  const arms = [...card.matchAll(/inverted \? '([^']*)'/g)].map((m) => m[1])
  assert.ok(arms.length >= 2, 'ProjectCard sin ramas inverted')
  for (const arm of arms) assert.doesNotMatch(arm, /text-(accent|bone-2)\b/, arm)
})

test('el acento anterior no sobrevive en src/', () => {
  assert.deepEqual(hits(/F29BB0/i), [])
})

test('sobre bg-accent el texto es carbon: ninguna línea mezcla bg-accent con text-bone, text-bone-2 o text-accent', () => {
  const bad = sources.flatMap((s) =>
    s.text
      .split('\n')
      .filter((l) => /(^|[\s"'`])bg-accent\b/.test(l) && /(^|[\s"'`])text-(bone|bone-2|accent)\b/.test(l))
      .map((l) => `${s.path}: ${l.trim()}`),
  )
  assert.deepEqual(bad, [])
})

test('Particles, ogl, story.pdf y 404.png solo aparecen en las guardas de project-view y de contenido', () => {
  const allowed404 = ['src/lib/project-view.ts', 'src/lib/project-view.test.ts', 'src/content/content.test.ts']
  assert.deepEqual(hits(/Particles|\bogl\b|story\.pdf/), [])
  assert.deepEqual(hits(/404\.png/).filter((p) => !allowed404.includes(p)), [])
})

test('Particles.tsx, 404.png y story.pdf ya no existen', () => {
  for (const file of ['src/components/Particles.tsx', 'public/404.png', 'public/story.pdf']) {
    assert.ok(!existsSync(join(root, file)), `${file} sigue existiendo`)
  }
})

test('package.json: sin ogl (retirada por el ADR de la 002)', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const all = { ...pkg.dependencies, ...pkg.devDependencies }
  assert.ok(!('ogl' in all), 'ogl no debe volver sin un ADR nuevo')
})

test('package-lock.json no contiene node_modules/ogl', () => {
  const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'))
  assert.ok(!('node_modules/ogl' in lock.packages))
})

// ───────────── T17: documentación coherente con el sistema póster ─────────────
const docFiles = (dir: string): string[] =>
  walk(join(root, dir)).map((p) => relative(root, p).replaceAll('\\', '/'))

test('README y skill portfolio no remiten al sistema anterior ni a componentes inexistentes', () => {
  const files = ['README.md', ...docFiles('.claude/skills/portfolio').filter((p) => p.endsWith('.md'))]
  for (const file of files) {
    const text = readFileSync(join(root, file), 'utf8')
    assert.doesNotMatch(text, /bento/i, `${file} menciona bento`)
    assert.doesNotMatch(text, /About\.tsx/, `${file} menciona About.tsx`)
    assert.doesNotMatch(text, /Particles|\bogl\b/, `${file} menciona Particles/ogl`)
  }
})

test('003: README, arquitectura, DESIGN y skill portfolio no citan el acento anterior ni efectos inexistentes', () => {
  const files = [
    'README.md',
    'docs/architecture.md',
    'docs/design/DESIGN.md',
    ...docFiles('.claude/skills/portfolio').filter((p) => p.endsWith('.md')),
  ]
  for (const file of files) {
    const text = readFileSync(join(root, file), 'utf8')
    assert.doesNotMatch(text, /F29BB0|lavado/i, `${file} remite al acento anterior`)
  }
  assert.doesNotMatch(read('docs/design/DESIGN.md'), /parpadeo único de retícula/i, 'ese efecto no existe en el código')
  assert.doesNotMatch(read('README.md'), /Framer Motion\*\* for smooth animations/, 'las animaciones son CSS; Framer no anima nada')
})

test('el spec bento de la skill ya no existe', () => {
  assert.ok(!existsSync(join(root, '.claude/skills/portfolio/references/bento-design-spec.md')))
})

test('hero: el cargo y el CTA van antes que la foto en el orden del DOM (móvil, una columna)', () => {
  const hero = readFileSync(join(root, 'src/components/Hero.tsx'), 'utf8')
  const title = hero.indexOf('{hero.title}')
  const cta = hero.indexOf('{hero.cta}')
  const photo = hero.indexOf('<DuoImage')
  assert.ok(title > -1 && cta > -1 && photo > -1)
  assert.ok(title < photo, 'el cargo debe ir antes que la foto')
  assert.ok(cta < photo, 'el CTA debe ir antes que la foto')
})

test('el encabezado fijo no tapa el foco ni las anclas: scroll-padding-top en html', () => {
  const css = readFileSync(join(root, 'src/app/globals.css'), 'utf8')
  assert.match(css, /html\s*\{[^}]*scroll-padding-top:\s*5rem/)
})

test('copiar correo: si el portapapeles falla, el aviso muestra el correo en texto', () => {
  const btn = readFileSync(join(root, 'src/components/CopyEmailButton.tsx'), 'utf8')
  assert.doesNotMatch(btn, /catch\s*\{\s*return;?\s*\}/, 'el fallo no debe ser silencioso')
  assert.match(btn, /copyFeedbackMs\(copyOk\)/, 'la duración del aviso sale de copyFeedbackMs')
  assert.match(btn, /setCopyFailed\(!copyOk\)/)
})

test('contacto: «Enviando…» visible una sola vez (la línea de estado es solo para lector de pantalla)', () => {
  const contact = readFileSync(join(root, 'src/components/Contact.tsx'), 'utf8')
  assert.match(contact, /role="status" className="sr-only"/)
})

test('contacto: editar un campo pasa por statusAfterEdit (borra el «enviado» al volver a escribir)', () => {
  const contact = readFileSync(join(root, 'src/components/Contact.tsx'), 'utf8')
  assert.match(contact, /setStatus\(statusAfterEdit\)/)
})

test('404: la página global declara un <title> (WCAG 2.4.2)', () => {
  const page = readFileSync(join(root, 'src/app/global-not-found.tsx'), 'utf8')
  assert.match(page, /export const metadata[^=]*=\s*\{[^}]*title:/)
})

test('anclas: el desplazamiento bajo el encabezado se define una sola vez (no se suman scroll-padding y scroll-margin)', () => {
  const css = readFileSync(join(root, 'src/app/globals.css'), 'utf8')
  assert.doesNotMatch(css, /scroll-margin-top/)
})

test('README y arquitectura apuntan a global-not-found.tsx, no a un not-found.tsx inexistente', () => {
  for (const file of ['README.md', 'docs/architecture.md']) {
    assert.doesNotMatch(readFileSync(join(root, file), 'utf8'), /src\/app\/not-found\.tsx/, file)
  }
})

// ───────────── 003: ornamentos SVG ─────────────
const read = (path: string) => readFileSync(join(root, path), 'utf8')

test('Ornaments.tsx: SVG decorativos, de un solo color, sin texto, ids ni ráster', () => {
  const src = read('src/components/Ornaments.tsx')
  const svgs = src.match(/<svg\b/g)?.length ?? 0
  assert.ok(svgs >= 3, 'faltan SVG')
  assert.equal(src.match(/aria-hidden="true"/g)?.length, svgs + 1, 'cada svg y el envoltorio Parallax son aria-hidden')
  assert.equal(src.match(/focusable="false"/g)?.length, svgs)
  assert.match(src, /const cls = [^\n]*'ornament'/, 'cls() añade siempre la clase ornament')
  assert.equal(src.match(/className=\{cls\(/g)?.length, svgs, 'cada svg pasa por cls() y lleva la clase ornament')
  assert.doesNotMatch(src, /<text\b|\bid=|<image\b|next\/image|<script\b/)
  assert.match(src, /currentColor/)
  assert.doesNotMatch(src, /#[0-9a-fA-F]{3,8}\b/, 'sin hex: el color viene de currentColor')
  for (const name of ['Star4', 'Checker', 'RingMarks', 'Parallax']) {
    assert.match(src, new RegExp(`export (const|function) ${name}\\b`), name)
  }
  assert.match(src, /M12 0L14\.6 9\.4L24 12L14\.6 14\.6L12 24L9\.4 14\.6L0 12L9\.4 9\.4Z/)
})

test('Parallax: el div lleva la clase parallax y --d-full; un solo transform por nodo', () => {
  const src = read('src/components/Ornaments.tsx')
  const parallax = src.slice(src.indexOf('export const Parallax') >= 0 ? src.indexOf('export const Parallax') : src.indexOf('export function Parallax'))
  assert.match(parallax, /parallax/)
  assert.match(parallax, /'--d-full'/)
  assert.doesNotMatch(parallax, /framer-motion/)
})

// ───────────── 003: estructura a sangre y fichas de sección ─────────────
test('page.tsx: main a ancho completo; Hero…Lab en max-w-7xl y Contact fuera del contenedor', () => {
  const page = read('src/app/[lang]/page.tsx')
  const main = /<main[^>]*>/.exec(page)?.[0] ?? ''
  assert.ok(main, 'falta <main>')
  assert.doesNotMatch(main, /max-w-7xl|px-/)
  const open = page.indexOf('<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">')
  const hero = page.indexOf('<Hero')
  const lab = page.indexOf('<Lab ')
  const contact = page.indexOf('<Contact')
  assert.ok(open > -1, 'falta el contenedor max-w-7xl')
  assert.ok(open < hero && hero < lab, 'el contenedor abre antes de Hero')
  const labEnd = page.indexOf('/>', lab)
  const close = page.indexOf('</div>', labEnd)
  assert.ok(close > labEnd && close < contact, 'el contenedor cierra después de Lab y antes de Contact')
})

test('cada sección con SectionHeading pasa su ficha de sección con el índice real', () => {
  const ids = ['now', 'experience', 'projects', 'stack', 'achievements', 'education', 'lab'] as const
  for (const id of ids) {
    const name = id[0].toUpperCase() + id.slice(1)
    const src = read(`src/components/${name}.tsx`)
    assert.match(
      src,
      new RegExp(`<SectionHeading\\s[^>]*ficha=\\{formatSectionFicha\\('${id}'\\)\\}`),
      `${name} sin ficha de sección`,
    )
  }
})

test('Contact es el bloque de acento a sangre: carbon sobre acento, borde rasgado y ornamentos', () => {
  const src = read('src/components/Contact.tsx')
  assert.match(src, /<section id="contact" aria-labelledby="contact-title" data-block="accent"/)
  const section = /<section id="contact"[^>]*>/.exec(src)?.[0] ?? ''
  for (const c of ['torn-top', 'bg-accent', 'text-carbon', 'relative', 'overflow-x-clip', 'pt-20']) {
    assert.ok(section.includes(c), `la sección no lleva ${c}`)
  }
  assert.match(src, /<Star4\b/)
  assert.match(src, /<RingMarks\b/)
  assert.match(src, /<Parallax d=\{20\}/)
  assert.match(src, /<Parallax d=\{12\}/)
  // Sin colores de texto o borde que fallan sobre el acento (los prefijos de variante, p. ej. placeholder:, no cuentan).
  assert.doesNotMatch(src, /(^|[\s"'`])(text-accent|text-bone-2|border-accent|border-line)\b/)
  assert.doesNotMatch(src, /opacity-50|disabled:opacity/)
  // bg-carbon text-bone solo en campos, éxito y botón: nunca en la sección.
  assert.doesNotMatch(section, /bg-carbon|text-bone/)
  assert.match(src, /bg-carbon text-bone/)
})

test('Contact: las capas de punteado son nodos vacíos y aria-hidden (ninguna textura bajo texto)', () => {
  const src = read('src/components/Contact.tsx')
  const layers = src.match(/<div[^>]*\btex\b[^>]*>/g) ?? []
  assert.ok(layers.length >= 1, 'falta la capa tex-dots-carbon')
  for (const layer of layers) {
    assert.match(layer, /tex-(dots-carbon|paper)/)
    assert.match(layer, /aria-hidden="true"/)
    assert.match(layer, /\/>$/, 'la capa debe ser autocerrada, sin hijos')
  }
})

test('Contact: la ficha de sección usa el índice real y la lógica del formulario no cambia', () => {
  const src = read('src/components/Contact.tsx')
  assert.match(src, /formatSectionFicha\('contact'\)/)
  for (const fn of ['validateContact', 'sendContact', 'statusAfterEdit', 'readEmailConfig']) {
    assert.match(src, new RegExp(`\\b${fn}\\b`), fn)
  }
  assert.match(src, /emailjs\.send\(/)
  assert.match(src, /fieldRefs\.current\[result\.firstInvalid\]\?\.focus\(\)/)
})

test('Hero: h1 recortado, con el nombre para lectores y las letras generadas por splitLetters en aria-hidden', () => {
  const hero = read('src/components/Hero.tsx')
  const h1 = hero.slice(hero.indexOf('<h1'), hero.indexOf('</h1>'))
  assert.ok(h1.length > 0, 'falta el h1')
  assert.match(h1, /name-cut/)
  assert.match(h1, /<span className="sr-only">\{name\}<\/span>/)
  assert.match(h1, /aria-hidden="true"/)
  assert.match(hero, /splitLetters\(name\)/)
  assert.match(h1, /className="rise"/)
  assert.match(h1, /className="mask\b/)
})

test('Hero: la pegatina es un enlace a #contact, visible para lectores, tras el h1 y antes del CTA', () => {
  const hero = read('src/components/Hero.tsx')
  const anchor = hero.indexOf('href="#contact"')
  assert.ok(anchor > -1, 'falta la pegatina')
  const tag = hero.slice(hero.lastIndexOf('<a', anchor), hero.indexOf('>', anchor))
  assert.match(tag, /className="sticker\b/)
  assert.doesNotMatch(tag, /aria-hidden/)
  assert.ok(hero.indexOf('</h1>') < anchor, 'la pegatina va después del h1')
  assert.ok(anchor < hero.indexOf('href="#projects"'), 'la pegatina va antes del CTA')
  assert.match(hero, /\{sticker\}/)
  assert.match(hero, /<ArrowDown\b/)
})

test('Hero: ornamentos, punteado detrás de la foto (capa vacía y aria-hidden) y marco relativo con clip horizontal', () => {
  const hero = read('src/components/Hero.tsx')
  for (const part of ['<Star4', '<Checker', '<Parallax']) assert.ok(hero.includes(part), part)
  const dots = /<div[^>]*tex-dots-bone[^>]*\/>/.exec(hero)?.[0] ?? ''
  assert.match(dots, /aria-hidden="true"/)
  const frame = /<div data-hero-frame[^>]*>/.exec(hero)?.[0] ?? ''
  assert.match(frame, /overflow-x-clip/)
  assert.match(frame, /\brelative\b/)
  assert.match(hero, /<DuoImage[^>]*\bdots\b/)
})

test('Hero: la foto conserva el filtro de color con hover y foco (DuoImage fixed, sin duo-trigger)', () => {
  const duo = read('src/components/DuoImage.tsx')
  assert.match(duo, /fixed\?: boolean/)
  assert.match(duo, /fixed \? '' : ' duo-trigger'/)
  const hero = read('src/components/Hero.tsx')
  assert.match(hero, /<DuoImage[^>]*\bfixed\b/)
})

test('DuoImage: dots opcional pinta duo-dots (sin duo-layer) entre las capas y el grano', () => {
  const duo = read('src/components/DuoImage.tsx')
  assert.match(duo, /dots\?: boolean/)
  assert.match(duo, /<div className="duo-dots" aria-hidden="true" \/>/)
  assert.doesNotMatch(duo, /duo-layer duo-dots|duo-dots duo-layer/)
  assert.ok(duo.indexOf('duo-lift') < duo.indexOf('duo-dots') && duo.indexOf('duo-dots') < duo.indexOf('className="grain"'))
})

test('CountUp: IntersectionObserver + rAF propios, cifra final para lectores y en el HTML, sin Framer ni temporizadores', () => {
  const src = read('src/components/CountUp.tsx')
  assert.match(src, /^'use client';/)
  assert.match(src, /import \{[^}]*\bCOUNT_MS\b[^}]*\} from '@\/lib\/count-up\.ts'/)
  for (const name of ['countAt', 'isCountable']) assert.match(src, new RegExp(`\\b${name}\\b`))
  assert.match(src, /new IntersectionObserver\(/)
  assert.match(src, /threshold: 0\.4/)
  assert.match(src, /requestAnimationFrame\(/)
  assert.match(src, /cancelAnimationFrame\(/)
  assert.match(src, /prefers-reduced-motion/)
  assert.match(src, /<span className="sr-only">\{value\}<\/span>/)
  assert.match(src, /aria-hidden="true"[^>]*>\{value\}<\/span>/)
  assert.doesNotMatch(src, /framer-motion|setInterval|setTimeout/)
  assert.doesNotMatch(src, /setState|useState/, 'el contador escribe el texto del nodo, sin re-render por fotograma')
})

test('Experience usa CountUp y ninguna de las dos fuentes duplica el literal de una métrica de facts.ts', () => {
  const experience = read('src/components/Experience.tsx')
  assert.match(experience, /<CountUp value=\{metric\.value\} \/>/)
  const countUp = read('src/components/CountUp.tsx')
  for (const literal of ['17', '3', '6', '40→100 %']) {
    for (const src of [experience, countUp]) {
      for (const form of [`'${literal}'`, `"${literal}"`, `>${literal}<`, `{${literal}}`]) {
        assert.ok(!src.includes(form), `literal ${form}`)
      }
    }
  }
})

test('Lab: filas con vista previa que sigue al cursor (solo vertical) y al foco, sin Framer', () => {
  const lab = read('src/components/Lab.tsx')
  assert.match(lab, /import \{[^}]*\bpreviewOffset\b[^}]*\} from '@\/lib\/lab-preview\.ts'/)
  for (const name of ['anchorOffset', 'shouldPreview']) assert.match(lab, new RegExp(`\\b${name}\\b`))
  assert.ok(lab.includes("matchMedia('(hover: hover)')"))
  assert.ok(lab.includes("matchMedia('(prefers-reduced-motion: reduce)')"))
  assert.match(lab, /data-preview=/)
  assert.match(lab, /data-lab-row/)
  assert.match(lab, /<div[^>]*className="lab-preview[^"]*"[^>]*aria-hidden="true"|<div[^>]*aria-hidden="true"[^>]*className="lab-preview/)
  assert.match(lab, /onPointerMove=/)
  assert.match(lab, /onPointerLeave=/)
  assert.match(lab, /onFocus=/)
  assert.match(lab, /setProperty\('--y'/)
  assert.doesNotMatch(lab, /framer-motion/)
  // la imagen de la miniatura es decorativa: el contenido está en la fila
  assert.match(lab, /alt=""/)
})

test('ProjectCard: variantes inverted y row (sin módulo carbon-2); la imagen en fila es lab-inline y decorativa', () => {
  const card = read('src/components/ProjectCard.tsx')
  assert.match(card, /variant: 'inverted' \| 'row'/)
  assert.doesNotMatch(card, /'module'|bg-carbon-2|rounded-xl border/)
  assert.match(card, /lab-inline/)
  assert.match(card, /alt=""/)
})

test('Projects es el bloque hueso (data-block="bone") y conserva inverted', () => {
  const src = read('src/components/Projects.tsx')
  assert.match(src, /<section\s[^>]*data-block="bone"/)
  assert.match(src, /<section\s[^>]*className="inverted\b/)
})
