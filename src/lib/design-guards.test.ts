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
