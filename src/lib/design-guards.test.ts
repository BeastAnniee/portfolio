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

test('Contact: la ficha de sección numera por página y la lógica del formulario no cambia', () => {
  const src = read('src/components/Contact.tsx')
  assert.match(src, /formatPageSectionFicha\(page, 'contact'\)/)
  for (const fn of ['validateContact', 'sendContact', 'statusAfterEdit', 'readEmailConfig']) {
    assert.match(src, new RegExp(`\\b${fn}\\b`), fn)
  }
  assert.match(src, /emailjs\.send\(/)
  assert.match(src, /fieldRefs\.current\[result\.firstInvalid\]\?\.focus\(\)/)
})

test('Contact: un envío fallido deja en consola el motivo y el estado de EmailJS, sin datos del formulario ni claves', () => {
  const src = read('src/components/Contact.tsx')
  assert.match(src, /console\.error\('\[contact\] envío fallido:', outcome\.reason\)/)
  assert.match(src, /console\.error\('\[contact\] EmailJS rechazó el envío:', code, text\)/)
  const logs = src.match(/console\.error\([^)]*\)/g) ?? []
  assert.equal(logs.length, 2)
  for (const log of logs) assert.doesNotMatch(log, /\bdata\b|payload|config|publicKey|email\b/, log)
})

test('Hero: h1 en 3 líneas, con el nombre para lectores y las letras generadas por splitLetters en aria-hidden', () => {
  const hero = read('src/components/Hero.tsx')
  const h1 = hero.slice(hero.indexOf('<h1'), hero.indexOf('</h1>'))
  assert.ok(h1.length > 0, 'falta el h1')
  assert.match(h1, /hero-name/)
  assert.doesNotMatch(hero, /name-cut|data-hero-frame|rounded-2xl border/)
  assert.match(h1, /<span className="sr-only">\{name\}<\/span>/)
  assert.match(h1, /aria-hidden="true"/)
  assert.match(hero, /splitLetters\(name\)/)
  assert.match(h1, /className="rise"/)
  assert.match(h1, /className="mask block"/, 'una palabra por línea')
  assert.match(h1, /<Star4\b/, 'Star4 cierra la línea del apellido')
})

test('Hero: sección a pantalla completa (hero-screen), CTA a Trabajo y marcas de movimiento', () => {
  const hero = read('src/components/Hero.tsx')
  assert.match(hero, /<section id="hero" className="hero-screen\b/)
  assert.match(hero, /overflow-x-clip/)
  assert.doesNotMatch(hero, /overflow-x-hidden/)
  assert.match(hero, /<Link\s[^>]*href=\{ctaHref\}/)
  assert.doesNotMatch(hero, /href="#projects"/)
  assert.match(hero, /data-hero-photo/)
  const enters = hero.match(/data-enter/g) ?? []
  assert.ok(enters.length >= 5, 'cargo, pegatina, CTA, iconos y resumen llevan data-enter')
  for (const line of hero.split(/\r?\n/).filter((l) => l.includes('data-enter'))) {
    assert.doesNotMatch(line, /\bsticker\b|\bpress\b|parallax|badge-spin/, `data-enter en un nodo con transform propio: ${line.trim()}`)
  }
})

test('Hero: la pegatina es un enlace a #contact, visible para lectores, tras el h1 y antes del CTA', () => {
  const hero = read('src/components/Hero.tsx')
  const anchor = hero.indexOf('href="#contact"')
  assert.ok(anchor > -1, 'falta la pegatina')
  const tag = hero.slice(hero.lastIndexOf('<a', anchor), hero.indexOf('>', anchor))
  assert.match(tag, /className="sticker\b/)
  assert.doesNotMatch(tag, /aria-hidden/)
  assert.ok(hero.indexOf('</h1>') < anchor, 'la pegatina va después del h1')
  assert.ok(anchor < hero.indexOf('{hero.cta}'), 'la pegatina va antes del CTA')
  assert.match(hero, /\{sticker\}/)
  assert.match(hero, /<ArrowDown\b/)
})

test('Hero: ornamentos, franja de punteado y punteado detrás de la foto (capas vacías y aria-hidden)', () => {
  const hero = read('src/components/Hero.tsx')
  for (const part of ['<Star4', '<Checker', '<Parallax']) assert.ok(hero.includes(part), part)
  const strips = [...hero.matchAll(/<div[^>]*tex-dots-bone[^>]*\/>/g)].map((m) => m[0])
  assert.equal(strips.length, 1, 'una sola franja tex-dots-bone en el Hero')
  assert.match(strips[0], /aria-hidden="true"/)
  assert.match(strips[0], /hidden min-\[42rem\]:block/, 'solo ≥ 42 rem')
  assert.match(strips[0], /width: 32/)
  assert.match(hero, /<DuoImage[^>]*\bdots\b/)
  assert.ok(hero.indexOf('<Checker') > hero.indexOf('<DuoImage'), 'el Checker va sobre la foto')
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

// ───────────── 004: barra de páginas, selector de idioma y marco en el layout ─────────────
test('Header: barra de páginas (sin secciones), aria-current, menú móvil operable y sin JS', () => {
  const src = read('src/components/Header.tsx')
  assert.doesNotMatch(src, /\bsections\b|SECTION_IDS/)
  assert.match(src, /usePathname/)
  assert.match(src, /from 'next\/link'/)
  assert.match(src, /\bPAGES\b|pagePath/)
  assert.match(src, /aria-current=\{[^}]*'page'/)
  assert.match(src, /min-h-11/)
  assert.match(src, /nav\.contact/)
  assert.match(src, /#contact/)
  // «Contacto» es un destino, no una página: nunca se marca como actual
  const contactLink = /nav\.contact[\s\S]{0,40}/.exec(src)?.[0] ?? ''
  assert.doesNotMatch(contactLink, /aria-current/)
  assert.match(src, /md:flex/)
  assert.match(src, /md:hidden/)
  assert.doesNotMatch(src, /xl:(flex|hidden)/)
  assert.match(src, /aria-expanded/)
  assert.match(src, /aria-controls="mobile-menu"/)
  assert.match(src, /key === 'Escape'/)
  assert.match(src, /buttonRef\.current\?\.focus\(\)/)
  assert.match(src, /\[pathname\]/)
  // El panel se oculta con una clase (no con el atributo `hidden`, cuyo !important de Tailwind no se puede vencer sin JS).
  assert.match(src, /<noscript>[\s\S]*#mobile-menu\s*\{\s*display:\s*block/)
  assert.doesNotMatch(src, /hidden=\{/, 'el panel no usa el atributo hidden')
})

test('LocaleSwitch: conserva la página con la ruta actual y el ancla válida al cambiar de idioma', () => {
  const src = read('src/components/LocaleSwitch.tsx')
  assert.match(src, /usePathname/)
  assert.match(src, /switchLocalePath/)
  assert.match(src, /window\.location\.assign/)
  assert.match(src, /window\.location\.hash/)
  assert.match(src, /withLocaleHash\(switchLocalePath\(locale, pathname\), window\.location\.hash\)/)
})

test('layout.tsx: Header, Footer y el contenedor de página viven en el layout, no en page.tsx', () => {
  const layout = read('src/app/[lang]/layout.tsx')
  assert.match(layout, /<Header\b/)
  assert.match(layout, /<Footer\b/)
  assert.match(layout, /className="min-h-screen bg-carbon text-bone"/)
  const page = read('src/app/[lang]/page.tsx')
  assert.doesNotMatch(page, /<Header\b|<Footer\b|min-h-screen/)
})

// ───────────── 004: PageIntro y NextBand ─────────────
test('PageIntro: un solo h1 de cartel, ficha derivada de PAGES y ornamento decorativo por página', () => {
  const src = read('src/components/PageIntro.tsx')
  assert.equal((src.match(/<h1\b/g) ?? []).length, 1)
  assert.match(src, /page: 'work' \| 'about'/)
  assert.match(src, /font-display/)
  assert.match(src, /text-\[clamp\(4rem,16vw,8rem\)\]/)
  assert.match(src, /formatPageIndex\(page\)/)
  assert.match(src, /<Star4\b/)
  assert.match(src, /<Checker\b/)
  assert.doesNotMatch(src, /<a\s|<Link\b|<button\b|href=/, 'PageIntro no lleva acción propia')
  assert.match(src, /data-reveal/)
})

test('NextBand: todo el bloque es un enlace normal a la página siguiente, grande y con flecha CSS', () => {
  const src = read('src/components/NextBand.tsx')
  assert.match(src, /import Link from 'next\/link'/)
  assert.match(src, /href=\{pagePath\(lang, target\)\}/)
  assert.match(src, /NEXT_PAGE\[from\]/)
  assert.match(src, /min-h-24/)
  assert.match(src, /\brule-x\b/)
  assert.match(src, /next\.toWork/)
  assert.match(src, /next\.toAbout/)
  assert.match(src, /next\.label/)
  assert.match(src, /text-accent/)
  assert.match(src, /text-\[clamp\(2\.5rem,12cqi,6rem\)\]/)
  assert.match(src, /\bnext-arrow\b/)
  assert.doesNotMatch(src, /preventDefault|onClick/, 'enlace normal: nada que intercepte la navegación')
})

// ───────────── 004: Numbers y Featured ─────────────
test('Numbers: cifras de facts con CountUp, etiquetas del diccionario, sin duplicar literales, sin «0» si no hay datos', () => {
  const src = read('src/components/Numbers.tsx')
  assert.match(src, /numbersFromFacts\(/)
  assert.match(src, /<CountUp value=\{value\} \/>/)
  assert.match(src, /copy\.items\[jobId[^\]]*\]\.metrics\[metricIndex\]/)
  assert.match(src, /job\?\.company/)
  assert.match(src, /job\?\.period/)
  assert.match(src, /grid-cols-2[^"]*@3xl:grid-cols-5/, '2 columnas bajo 768 px; 5 desde 768 px (la cifra larga ocupa 2)')
  assert.match(src, /font-display text-\[clamp\(3\.5rem,7\.5cqi,6rem\)\][^"]*text-accent/)
  assert.match(src, /<RingMarks size=\{96\}/)
  assert.match(src, /hidden[^"]*@3xl:block/)
  assert.match(src, /if \(numbers\.length === 0\) return null/)
  assert.match(src, /id="numbers"/)
  assert.match(src, /formatPageSectionFicha\('home', 'numbers'\)/)
  assert.match(src, /home\.fullExperience/)
  assert.match(src, /pagePath\(lang, 'about'\)\}#experience/)
  for (const literal of ['17', '3', '6', '40→100 %']) {
    for (const form of [`'${literal}'`, `"${literal}"`, `>${literal}<`, `{${literal}}`]) {
      assert.ok(!src.includes(form), `literal ${form}`)
    }
  }
})

test('Featured: bloque hueso con dos resúmenes sin resultado ni tecnologías, enlace a Trabajo y vacío = nada', () => {
  const src = read('src/components/Featured.tsx')
  assert.match(src, /<section\s[^>]*id="featured"/)
  assert.match(src, /<section\s[^>]*data-block="bone"/)
  assert.match(src, /className="inverted\b/)
  assert.match(src, /formatPageSectionFicha\('home', 'featured'\)/)
  assert.match(src, /<SectionHeading\s[^>]*inverted/)
  assert.match(src, /\{copy\.title\}/)
  assert.match(src, /formatFicha\(ficha, index\)/)
  assert.match(src, /<h3\b/)
  assert.match(src, /copy\.items\[project\.id\]\.description/)
  assert.doesNotMatch(src, /\.result|openProject|TechChips|techLabels/, 'resultado, tecnologías y «Open project» se difieren a Trabajo')
  assert.match(src, /<Star4 size=\{40\}/)
  assert.match(src, /pr-14/)
  assert.match(src, /home\.allWork/)
  assert.match(src, /pagePath\(lang, 'work'\)\}#projects/)
  assert.match(src, /if \(projects\.length === 0\) return null/)
  assert.doesNotMatch(src, /text-(accent|bone-2)\b/, 'sobre bone solo carbon')
})

// ───────────── 004: las tres rutas ─────────────
type PageSpec = {
  path: string
  page: string
  order: string[]
  inside: string[]
  outside: string[]
  forbidden: string[]
}

/** Orden del DOM de cada página (contrato 004 §1). Hero y Contact van a sangre, fuera del contenedor. */
const PAGE_SPECS: PageSpec[] = [
  {
    path: 'src/app/[lang]/page.tsx',
    page: 'home',
    order: ['<Hero', '<Marquee', '<Featured', '<Numbers', '<Stack', '<NextBand', '<Contact'],
    inside: ['<Featured', '<Numbers', '<Stack', '<NextBand'],
    outside: ['<Hero', '<Marquee', '<Contact'],
    forbidden: ['Now', 'Experience', 'Achievements', 'Education', 'Lab', 'Projects'],
  },
  {
    path: 'src/app/[lang]/work/page.tsx',
    page: 'work',
    order: ['<PageIntro', '<Projects', '<Now', '<Lab', '<NextBand'],
    inside: ['<PageIntro', '<Projects', '<Now', '<Lab', '<NextBand'],
    outside: [],
    forbidden: ['Stack', 'Hero', 'Contact', 'Experience'],
  },
  {
    path: 'src/app/[lang]/about/page.tsx',
    page: 'about',
    order: ['<PageIntro', '<Experience', '<Achievements', '<Education', '<Contact'],
    inside: ['<PageIntro', '<Experience', '<Achievements', '<Education'],
    outside: ['<Contact'],
    forbidden: ['Lab', 'Projects', 'Hero', 'NextBand', 'Stack', 'Now'],
  },
]

const CONTAINER = '<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">'

for (const spec of PAGE_SPECS) {
  test(`${spec.page}: orden del DOM, <main> a ancho completo y contenedor max-w-7xl según el contrato`, () => {
    const src = read(spec.path)
    const main = /<main[^>]*>/.exec(src)?.[0] ?? ''
    assert.ok(main, 'falta <main>')
    assert.match(main, /\bpt-16\b/)
    assert.doesNotMatch(main, /max-w|px-/)
    const at = spec.order.map((tag) => src.indexOf(tag))
    at.forEach((i, k) => assert.ok(i > -1, `falta ${spec.order[k]}`))
    assert.deepEqual([...at].sort((a, b) => a - b), at, `orden del DOM: ${spec.order.join(' · ')}`)

    // El contenedor abre y cierra alrededor de las secciones "dentro" y deja fuera las "fuera".
    const opens: number[] = []
    for (let i = src.indexOf(CONTAINER); i > -1; i = src.indexOf(CONTAINER, i + 1)) opens.push(i)
    assert.ok(opens.length > 0, 'falta el contenedor max-w-7xl')
    const ranges = opens.map((start) => {
      let depth = 0
      for (let i = start; i < src.length; i++) {
        if (src.startsWith('<div', i)) depth++
        else if (src.startsWith('</div>', i) && --depth === 0) return [start, i] as const
      }
      throw new Error('contenedor sin cerrar')
    })
    const within = (tag: string) => ranges.some(([a, b]) => src.indexOf(tag) > a && src.indexOf(tag) < b)
    for (const tag of spec.inside) assert.ok(within(tag), `${tag} debe ir dentro del contenedor`)
    for (const tag of spec.outside) assert.ok(!within(tag), `${tag} debe ir fuera del contenedor (a sangre)`)

    for (const name of spec.forbidden) {
      assert.doesNotMatch(src, new RegExp(`import ${name} from`), `${spec.page} no importa ${name}`)
    }
    assert.match(src, /export async function generateMetadata/)
    assert.match(src, new RegExp(`buildMetadata\\(lang, getDictionary\\(lang\\), '${spec.page}'\\)`))
    assert.match(src, /if \(!isLocale\(lang\)\) notFound\(\)/)
  })
}

test('layout.tsx ya no define metadatos (cada página aporta los suyos)', () => {
  assert.doesNotMatch(read('src/app/[lang]/layout.tsx'), /generateMetadata|buildMetadata/)
})

test('cada sección con SectionHeading pasa la ficha de su página con su id real', () => {
  const sections: Array<[string, string]> = [
    ['Featured', 'featured'], ['Numbers', 'numbers'], ['Experience', 'experience'], ['Achievements', 'achievements'],
    ['Education', 'education'], ['Stack', 'stack'], ['Now', 'now'], ['Projects', 'projects'], ['Lab', 'lab'],
  ]
  for (const [name, id] of sections) {
    const src = read(`src/components/${name}.tsx`)
    const page = name === 'Featured' || name === 'Numbers' ? "'home'" : 'page'
    assert.match(src, /<SectionHeading\s/, `${name} sin SectionHeading`)
    assert.match(src, new RegExp(`ficha=\\{formatPageSectionFicha\\(${page}, '${id}'\\)\\}`), `${name} sin ficha de página`)
  }
  assert.doesNotMatch(sources.map((s) => s.text).join('\n'), /formatSectionFicha|SECTION_IDS/, 'la ficha global desaparece')
})

test('cada sección que numera su ficha por página recibe la prop page; Contact la usa', () => {
  for (const name of ['Experience', 'Achievements', 'Education', 'Stack', 'Now', 'Projects', 'Lab', 'Contact']) {
    const src = read(`src/components/${name}.tsx`)
    assert.match(src, /page: PageId;/, `${name} sin prop page`)
  }
  assert.match(read('src/app/[lang]/page.tsx'), /<Contact page="home"/)
  assert.match(read('src/app/[lang]/about/page.tsx'), /<Contact page="about"/)
})

// ───────────── 004: el carácter llega a todas las secciones ─────────────
test('Achievements es bloque hueso: carbon sobre bone, filas divide-carbon y Checker carbon', () => {
  const src = read('src/components/Achievements.tsx')
  assert.match(src, /<section\s[^>]*data-block="bone"/)
  assert.match(src, /className="inverted\b/)
  assert.match(src, /divide-carbon/)
  assert.match(src, /<Checker\b/)
  assert.match(src, /text-carbon/)
  assert.match(src, /<SectionHeading\s[^>]*inverted/)
  assert.doesNotMatch(src, /text-(accent|bone-2|bone)\b|border-line|divide-line/, 'sobre bone solo carbon')
})

test('Experience: Star4 accent de 28 px junto al h2 y filetes rule-x', () => {
  const src = read('src/components/Experience.tsx')
  assert.match(src, /text-accent[^>]*>\s*<Star4 size=\{28\} \/>/)
  assert.match(src, /\brule-x\b/)
  assert.doesNotMatch(src, /border-t border-line/, 'los filetes pasan a rule-x')
})

test('Stack: banda tex-dots-bone de 24 px vacía y aria-hidden como divisor superior, rule-y entre grupos', () => {
  const src = read('src/components/Stack.tsx')
  const band = /<div[^>]*h-6[^>]*aria-hidden="true">\s*<div className="tex tex-dots-bone" aria-hidden="true" \/>\s*<\/div>/.exec(src)
  assert.ok(band, 'falta la banda de 24 px (h-6) con una capa tex-dots-bone vacía')
  assert.ok(src.indexOf(band[0]) < src.indexOf('<h2') || src.indexOf(band[0]) < src.indexOf('<SectionHeading'), 'la banda va arriba')
  assert.match(src, /\brule-y\b/)
  assert.match(src, /hidden[^"]*@2xl:block/, 'rule-y solo desde 768 px')
})

test('Projects lleva Checker carbon 72×24; Lab lleva RingMarks bone de 80 px desde 768 px', () => {
  const projects = read('src/components/Projects.tsx')
  assert.match(projects, /text-carbon[^>]*>\s*<Checker size=\{72\} \/>/)
  const lab = read('src/components/Lab.tsx')
  assert.match(lab, /hidden[^"]*@3xl:block[^>]*>\s*<RingMarks size=\{80\} \/>/)
  assert.match(lab, /text-bone/)
})

test('Marquee lleva filetes rule-x; Education y Now no llevan ornamento ni textura (excepciones justificadas de REQ-13)', () => {
  assert.match(read('src/components/Marquee.tsx'), /\brule-x\b/)
  for (const name of ['Education', 'Now']) {
    const src = read(`src/components/${name}.tsx`)
    assert.doesNotMatch(src, /Star4|Checker|RingMarks|\btex\b|tex-/, `${name} sin ornamento ni textura`)
    assert.match(src, /REQ-13/, `${name} documenta su excepción de REQ-13`)
  }
})

test('bloques invertidos por página: ≤ 2 y nunca consecutivos, en el orden del DOM', () => {
  const blockOf = (name: string) =>
    /data-block="(bone|accent)"/.exec(read(`src/components/${name}.tsx`))?.[1] ?? null
  for (const spec of PAGE_SPECS) {
    const src = read(spec.path)
    const sequence = spec.order.map((tag) => blockOf(tag.slice(1)))
    const blocks = sequence.filter(Boolean)
    assert.ok(blocks.length <= 2, `${spec.page}: ${blocks.length} bloques invertidos`)
    sequence.forEach((block, i) => {
      if (block && sequence[i + 1]) assert.fail(`${spec.page}: ${spec.order[i]} y ${spec.order[i + 1]} son bloques consecutivos`)
    })
    assert.ok(src.length > 0)
  }
  assert.deepEqual(PAGE_SPECS.map((s) => s.order.map((t) => blockOf(t.slice(1))).filter(Boolean)), [
    ['bone', 'accent'],
    ['bone'],
    ['bone', 'accent'],
  ])
})

test('ninguna capa de textura es hermana de texto: son nodos vacíos y aria-hidden', () => {
  const names = readdirSync(join(root, 'src/components')).filter((f) => f.endsWith('.tsx'))
  let seen = 0
  for (const file of names) {
    const src = read(`src/components/${file}`)
    for (const m of src.matchAll(/<div\b[^>]*className="[^"]*\b(tex|duo-dots)\b[^"]*"[^>]*>/g)) {
      seen++
      assert.match(m[0], /\/>$/, `${file}: ${m[0]} no es un nodo vacío`)
      assert.match(m[0], /aria-hidden="true"/, `${file}: ${m[0]} sin aria-hidden`)
    }
  }
  assert.ok(seen >= 3, 'el recorrido no encontró las capas de textura')
})

// ───────────── 004: anclas antiguas ─────────────
test('LegacyAnchors: cliente sin UI que redirige con replace al montar y ante hashchange, y limpia su listener', () => {
  const src = read('src/components/LegacyAnchors.tsx')
  assert.match(src, /^'use client';/)
  assert.match(src, /return null/)
  assert.match(src, /import \{ legacyTarget \} from '@\/content\/pages\.ts'/)
  assert.match(src, /import \{ useRouter \} from 'next\/navigation'/)
  assert.match(src, /router\.replace\(/)
  assert.doesNotMatch(src, /router\.push\(/)
  assert.match(src, /window\.location\.hash/)
  assert.match(src, /addEventListener\('hashchange'/)
  assert.match(src, /removeEventListener\('hashchange'/)
})

test('solo Home monta LegacyAnchors (Trabajo y Sobre mí no)', () => {
  assert.match(read('src/app/[lang]/page.tsx'), /<LegacyAnchors lang=\{lang\} \/>/)
  assert.doesNotMatch(read('src/app/[lang]/work/page.tsx'), /LegacyAnchors/)
  assert.doesNotMatch(read('src/app/[lang]/about/page.tsx'), /LegacyAnchors/)
})

// ───────────── 004: dependencia gsap ─────────────
test('package.json: las dependencias son las anteriores más gsap (3.15.0 exacta), sin @gsap/react', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), [
    '@vercel/speed-insights', 'emailjs-com', 'framer-motion', 'gsap', 'lucide-react', 'next', 'react', 'react-dom',
  ])
  assert.equal(pkg.dependencies.gsap, '3.15.0')
  assert.ok(!('@gsap/react' in { ...pkg.dependencies, ...pkg.devDependencies }))
  assert.deepEqual(Object.keys(pkg.devDependencies).sort(), [
    '@eslint/eslintrc', '@tailwindcss/postcss', '@types/node', '@types/react', '@types/react-dom', 'eslint', 'eslint-config-next', 'tailwindcss', 'typescript',
  ])
})

test('gsap solo se importa con import() dinámico y solo desde src/animation o PageMotion; nunca @gsap/react', () => {
  const outside = sources.filter((s) => !s.path.startsWith('src/animation/'))
  for (const s of outside) {
    assert.doesNotMatch(s.text, /from\s+['"]gsap/, `${s.path}: import estático de gsap`)
    assert.doesNotMatch(s.text, /import\s+gsap\b/, `${s.path}: import estático de gsap`)
    assert.doesNotMatch(s.text, /@gsap\/react/, `${s.path}: @gsap/react`)
  }
  for (const s of sources.filter((x) => x.path.startsWith('src/animation/'))) {
    assert.doesNotMatch(s.text, /^import\s+(?!type\b)[^'"\n]*from\s+['"]gsap/m, `${s.path}: import estático de gsap`)
    assert.doesNotMatch(s.text, /@gsap\/react/)
  }
})

test('package-lock.json resuelve node_modules/gsap a 3.15.0', () => {
  const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'))
  assert.equal(lock.packages['node_modules/gsap']?.version, '3.15.0')
})

test('layout.tsx: <html> lleva suppressHydrationWarning (el script de espera lo modifica antes de hidratar)', () => {
  assert.match(read('src/app/[lang]/layout.tsx'), /<html[^>]*suppressHydrationWarning/)
})

// ───────────── 004: PageMotion, entrada del Hero y scrub (M1, M2, M5) ─────────────
test('PageMotion: cliente sin UI, GSAP y ScrollTrigger con import() dinámico, tres ramas de matchMedia y limpieza con revert', () => {
  const src = read('src/components/PageMotion.tsx')
  assert.match(src, /^'use client';/)
  assert.match(src, /return null/)
  assert.match(src, /import\('gsap'\)/)
  assert.match(src, /import\('gsap\/ScrollTrigger'\)/)
  assert.doesNotMatch(src, /^import[^'\n]*from\s+'gsap/m, 'ningún import estático de gsap')
  assert.match(src, /gsap\.registerPlugin\(/)
  assert.match(src, /ScrollTrigger\.config\(\{ ignoreMobileResize: true \}\)/)
  assert.match(src, /gsap\.matchMedia\(\)/)
  assert.match(src, /\(prefers-reduced-motion: reduce\)/)
  assert.match(src, /\(prefers-reduced-motion: no-preference\) and \(min-width: \$\{MOBILE_MAX_PX \+ 1\}px\)/)
  assert.match(src, /\(prefers-reduced-motion: no-preference\) and \(max-width: \$\{MOBILE_MAX_PX\}px\)/)
  assert.match(src, /mm\.revert\(\)/)
  assert.match(src, /removeAttribute\('data-gsap'\)/)
})

test('PageMotion: salvavidas de 1200 ms, error de import() libera, GSAP tardío no anima y refresh tras fuentes, load y alto de main', () => {
  const src = read('src/components/PageMotion.tsx')
  assert.match(src, /\},\s*WAIT_TIMEOUT_MS\)/)
  assert.match(src, /\.catch\(/)
  assert.match(src, /if \(late \|\| cancelled\) return/, 'si GSAP llega después del salvavidas, no anima')
  assert.match(src, /document\.fonts\.ready/)
  assert.match(src, /FONTS_WAIT_MS/)
  assert.match(src, /ScrollTrigger\.refresh\(\)/)
  assert.match(src, /addEventListener\('load'/)
  assert.match(src, /new ResizeObserver\(/)
  assert.match(src, /REFRESH_DEBOUNCE_MS/)
  assert.match(src, /querySelector\('main'\)/)
})

test('PageMotion: si el salvavidas inline ya liberó la página, no la vuelve a ocultar, no anima y consume la marca', () => {
  const src = read('src/components/PageMotion.tsx')
  assert.match(src, /WAIT_RELEASED_ATTR/)
  const layout = src.slice(src.indexOf('useLayoutEffect('), src.indexOf('useEffect('))
  assert.match(layout, /releasedRef\.current = true/)
  assert.match(layout, /hasAttribute\(WAIT_RELEASED_ATTR\)/)
  assert.ok(
    layout.indexOf('hasAttribute(WAIT_RELEASED_ATTR)') < layout.indexOf("root.dataset.gsap = 'wait'"),
    'la marca se comprueba antes de fijar data-gsap=wait',
  )
  assert.match(src, /removeAttribute\(WAIT_RELEASED_ATTR\)/)
  assert.ok(
    src.indexOf('releasedRef.current') < src.indexOf("import('gsap')"),
    'si la marca existe, no se importa GSAP ni se anima',
  )
  assert.doesNotMatch(read('src/app/globals.css'), /data-gsap-released/, 'la marca no puede ocultar nada por CSS')
})

test('probe: escribe data-motion-st y data-motion-tw en <html> tras montar y tras revert', () => {
  const probe = read('src/animation/probe.ts')
  assert.match(probe, /documentElement\.dataset\.motionSt/)
  assert.match(probe, /documentElement\.dataset\.motionTw/)
  assert.match(probe, /ScrollTrigger\.getAll\(\)\.length/)
  assert.match(probe, /globalTimeline\.getChildren\(/)
  const src = read('src/components/PageMotion.tsx')
  const mount = src.indexOf('writeProbe(')
  const revert = src.indexOf('mm.revert()')
  assert.ok(mount > -1 && revert > -1)
  assert.ok(src.indexOf('writeProbe(', revert) > revert, 'la sonda se vuelve a escribir tras revert()')
})

test('hero.ts: el ejecutor lee specs.ts y no escribe números propios; nunca anima un nodo con transform propio', () => {
  const src = read('src/animation/hero.ts')
  assert.match(src, /from '\.\/specs\.ts'/)
  assert.match(src, /heroEntry\(/)
  assert.match(src, /HERO_PHOTO/)
  assert.match(src, /SCRUB_HERO/)
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(code, /\b(duration|stagger|delay|scrub)\s*:\s*[0-9.]+/, 'las duraciones viven en specs.ts')
  assert.doesNotMatch(code, /['"][^'"]*(\.press|\.sticker|\.parallax|\.badge-spin|\.marquee-track|\.lab-preview)/, 'nunca un nodo con transform CSS propio')
  assert.doesNotMatch(code, /(from|fromTo|to|set)\(\s*['"]#hero \.sticker/)
})

test('src/animation: sin acceso a window en los módulos de datos y sin @gsap/react', () => {
  for (const file of ['config.ts', 'specs.ts']) {
    const src = read(`src/animation/${file}`)
    assert.doesNotMatch(src, /\b(window|document)\./, `${file} toca el DOM`)
  }
})

// ───────────── 004: revelado de secciones, titulares y filetes (M3, M4, M6) ─────────────
test('SectionHeading: el h2 sube desde su máscara (span.mask > span[data-rise]) y la ficha se revela', () => {
  const src = read('src/components/SectionHeading.tsx')
  assert.match(src, /<h2[\s\S]*<span className="mask block">\s*<span data-rise className="block">\{children\}<\/span>\s*<\/span>\s*<\/h2>/)
  assert.match(src, /<p\s[^>]*data-reveal/)
})

test('cada sección marca su cabecera con data-reveal y sus filas, tarjetas, cifras y bloques con data-reveal-item', () => {
  const withHeading = ['Featured', 'Numbers', 'Experience', 'Achievements', 'Education', 'Stack', 'Now', 'Projects', 'Lab']
  for (const name of withHeading) {
    assert.match(read(`src/components/${name}.tsx`), /<SectionHeading\s/, `${name}: la cabecera se revela desde SectionHeading`)
  }
  assert.match(read('src/components/PageIntro.tsx'), /data-reveal/)
  assert.match(read('src/components/NextBand.tsx'), /data-reveal/)
  for (const name of ['Featured', 'Numbers', 'Experience', 'Achievements', 'Education', 'Stack', 'Now', 'Contact', 'ProjectCard']) {
    assert.match(read(`src/components/${name}.tsx`), /data-reveal-item/, `${name} sin data-reveal-item`)
  }
  for (const name of ['Featured', 'Achievements', 'Projects', 'Contact']) {
    assert.match(read(`src/components/${name}.tsx`), /data-block="(bone|accent)"/, name)
  }
})

test('ninguna marca de movimiento va en un nodo con transform CSS propio ni envuelve el span de CountUp', () => {
  const marked = /data-(reveal|reveal-item|rise|scrub)\b/
  const own = /\b(press|sticker|parallax|badge-spin|marquee-track|lab-preview)\b/
  for (const file of readdirSync(join(root, 'src/components')).filter((f) => f.endsWith('.tsx'))) {
    const lines = read(`src/components/${file}`).split(/\r?\n/)
    lines.forEach((line, i) => {
      if (!marked.test(line)) return
      assert.doesNotMatch(line, own, `${file}:${i + 1} marca un nodo con transform propio: ${line.trim()}`)
      assert.doesNotMatch(line, /<CountUp\b|<span[^>]*ref=\{visible\}/, `${file}:${i + 1} envuelve CountUp`)
    })
  }
})

test('reveal.ts: lote con once y batchMax; la primera pantalla también entra (tras el titular); los bloques nunca arrancan transparentes', () => {
  const src = read('src/animation/reveal.ts')
  assert.match(src, /ScrollTrigger\.batch\(/)
  assert.match(src, /once: REVEAL\.once/)
  assert.match(src, /batchMax: MAX_BATCH/)
  assert.match(src, /belowFold\(/)
  assert.match(src, /REVEAL_MOBILE/)
  assert.match(src, /RULES_MOBILE/)
  assert.match(src, /'--p'|RULES\.from/)
  // el contenido de la primera pantalla entra con FIRST_SCREEN_DELAY; Hero y PageIntro los orquestan sus timelines
  const sets = src.match(/gsap\.set\(/g) ?? []
  assert.ok(sets.length >= 1)
  assert.match(src, /FIRST_SCREEN_DELAY/)
  assert.match(src, /closest\(REVEAL\.skip\)/)
  assert.match(src, /REVEAL\.block/)
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(code, /\b(duration|stagger|scrub)\s*:\s*[0-9.]+/, 'los tiempos viven en specs.ts')
  assert.doesNotMatch(code, /\.(press|sticker|parallax|badge-spin|marquee-track|lab-preview)\b/)
})

// ───────────── 004: telón de página (M8), apertura del Lab (M7) y foco ─────────────
test('intent.ts: sin gsap; el telón es un div creado por JS, inerte, sin texto, fijo y a color de acento', () => {
  const intent = read('src/animation/intent.ts')
  assert.doesNotMatch(intent, /gsap/)
  assert.match(intent, /export function isPlainInternalClick/)
  assert.match(intent, /addEventListener\('click'/)
  const curtain = read('src/animation/curtain.ts')
  assert.match(curtain, /createElement\('div'\)/)
  assert.match(curtain, /setAttribute\('aria-hidden', 'true'\)/)
  assert.match(curtain, /setAttribute\('inert', ''\)/)
  assert.match(curtain, /pointerEvents: 'none'/)
  assert.match(curtain, /position: 'fixed'/)
  assert.match(curtain, /inset: '0'/)
  assert.match(curtain, /scaleY\(1\)/)
  assert.match(curtain, /bg-accent/)
  assert.doesNotMatch(curtain, /textContent|innerText|innerHTML/, 'el telón no lleva texto')
  assert.match(curtain, /progress\(1\)/, 'el primer keydown/pointerdown completa el telón')
  assert.match(curtain, /'keydown'/)
  assert.match(curtain, /'pointerdown'/)
})

test('PageMotion: el telón se pone a scaleY(1) en useLayoutEffect, solo con la bandera de navegación y movimiento permitido', () => {
  const src = read('src/components/PageMotion.tsx')
  assert.match(src, /useLayoutEffect\(/)
  assert.match(src, /createCurtain\(\)/)
  assert.match(src, /NAV_INTENT_ATTR/)
  assert.match(src, /prefers-reduced-motion: reduce/)
  assert.match(src, /armNavIntent\(\)/)
  assert.match(src, /pageStartDelay|CURTAIN\.pageStartDelay/)
  assert.match(src, /curtain\?\.remove\(\)|removeCurtain/, 'el telón se retira si GSAP no llega')
  assert.doesNotMatch(src, /preventDefault|router\.push/, 'navega Next normal: sin interceptar ni retrasar')
})

test('PageMotion: tras navegar, si el foco queda en body pasa a main (tabIndex -1, preventScroll)', () => {
  const src = read('src/components/PageMotion.tsx')
  assert.match(src, /document\.activeElement (===|!==) document\.body/)
  assert.match(src, /tabIndex = -1/)
  assert.match(src, /focus\(\{ preventScroll: true \}\)/)
})

test('Lab: no importa gsap y avisa con un evento de window que PageMotion escucha para M7 y refresh', () => {
  const lab = read('src/components/Lab.tsx')
  assert.doesNotMatch(lab, /gsap/)
  assert.match(lab, /LAB_OPEN_EVENT/)
  assert.match(lab, /window\.dispatchEvent\(/)
  const anim = read('src/animation/lab.ts')
  assert.match(anim, /addEventListener\(LAB_OPEN_EVENT/)
  assert.match(anim, /removeEventListener\(LAB_OPEN_EVENT/)
  assert.match(anim, /ScrollTrigger\.refresh\(\)/)
  assert.doesNotMatch(anim, /height|autoAlpha/, 'no se anima height')
})

// ───────────── 004: documentación coherente con el sitio multipágina ─────────────
test('004: README, arquitectura y skill portfolio describen las tres rutas, src/animation y GSAP; no la landing única', () => {
  const skill = ['.claude/skills/portfolio/SKILL.md', ...docFiles('.claude/skills/portfolio/references').filter((p) => p.endsWith('.md'))]
  const readText = (files: string[]) => files.map((f) => readFileSync(join(root, f), 'utf8')).join('\n')
  const groups: Record<string, string> = {
    README: readText(['README.md']),
    arquitectura: readText(['docs/architecture.md']),
    skill: readText(skill),
  }
  for (const [name, text] of Object.entries(groups)) {
    for (const needle of ['/[lang]/work', '/[lang]/about', 'src/animation', 'GSAP']) {
      assert.ok(text.includes(needle), `${name} no cita ${needle}`)
    }
    assert.ok(/\/\[lang\](?!\/)/.test(text), `${name} no cita /[lang]`)
    assert.doesNotMatch(text, /SECTION_IDS|src\/content\/sections\.ts|data-hero-frame|name-cut/, `${name} cita algo retirado`)
    assert.doesNotMatch(text, /una sola landing|landing de una sola página|single-page landing/i, `${name} describe una landing única`)
  }
  assert.match(groups.arquitectura, /pages\.ts/)
  assert.match(groups.arquitectura, /PAGE_SECTIONS/)
})
