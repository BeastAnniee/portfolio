import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PAGES,
  PAGE_SECTIONS,
  NEXT_PAGE,
  pagePath,
  legacyTarget,
  switchLocalePath,
} from './pages.ts'

test('PAGES fija el orden del recorrido', () => {
  assert.deepEqual([...PAGES], ['home', 'work', 'about'])
})

test('PAGE_SECTIONS reparte el contenido por página', () => {
  assert.deepEqual([...PAGE_SECTIONS.home], ['featured', 'numbers', 'stack', 'contact'])
  assert.deepEqual([...PAGE_SECTIONS.work], ['projects', 'now', 'lab'])
  assert.deepEqual([...PAGE_SECTIONS.about], ['experience', 'achievements', 'education', 'contact'])
})

test('nada se pierde ni se duplica: solo contact aparece en dos páginas', () => {
  const all = PAGES.flatMap((p) => [...PAGE_SECTIONS[p]])
  assert.deepEqual([...new Set(all)].sort(), [
    'achievements', 'contact', 'education', 'experience', 'featured',
    'lab', 'now', 'numbers', 'projects', 'stack',
  ])
  const dupes = all.filter((id, i) => all.indexOf(id) !== i)
  assert.deepEqual(dupes, ['contact'])
})

test('pagePath compone la ruta por idioma', () => {
  assert.equal(pagePath('en', 'home'), '/en')
  assert.equal(pagePath('es', 'work'), '/es/work')
  assert.equal(pagePath('en', 'about'), '/en/about')
})

test('NEXT_PAGE encadena Home → Trabajo → Sobre mí', () => {
  assert.equal(NEXT_PAGE.home, 'work')
  assert.equal(NEXT_PAGE.work, 'about')
  assert.equal(NEXT_PAGE.about, null)
})

test('legacyTarget lleva las siete anclas antiguas a su página', () => {
  for (const id of ['experience', 'achievements', 'education']) {
    assert.equal(legacyTarget('en', `#${id}`), `/en/about#${id}`)
    assert.equal(legacyTarget('es', `#${id}`), `/es/about#${id}`)
  }
  assert.equal(legacyTarget('en', '#stack'), '/en#stack')
  assert.equal(legacyTarget('es', '#now'), '/es/work#now')
  assert.equal(legacyTarget('en', '#projects'), '/en/work#projects')
  assert.equal(legacyTarget('es', '#lab'), '/es/work#lab')
})

test('legacyTarget no redirige nada más', () => {
  for (const hash of ['#hero', '#contact', '#featured', '#numbers', '', '#', '#Experience', '#<script>', '#zz']) {
    assert.equal(legacyTarget('en', hash), null, hash)
  }
})

test('switchLocalePath conserva la página y cambia el idioma', () => {
  assert.equal(switchLocalePath('en', '/en/work'), '/es/work')
  assert.equal(switchLocalePath('es', '/es'), '/en')
  assert.equal(switchLocalePath('en', '/en/about/'), '/es/about')
  assert.equal(switchLocalePath('es', '/es/about'), '/en/about')
})

test('switchLocalePath: ruta desconocida → Home del otro idioma', () => {
  assert.equal(switchLocalePath('en', '/en/foo'), '/es')
  assert.equal(switchLocalePath('en', '/'), '/es')
})
