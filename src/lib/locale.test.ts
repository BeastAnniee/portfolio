import test from 'node:test'
import assert from 'node:assert/strict'
import { localeHash, negotiateLocale, withLocaleHash } from './locale.ts'

const cases: Array<[string | null | undefined, 'en' | 'es']> = [
  ['es-MX,es;q=0.9,en;q=0.8', 'es'],
  ['en-US,en;q=0.9,es;q=0.5', 'en'],
  ['fr-FR', 'en'],
  [undefined, 'en'],
  [null, 'en'],
  ['', 'en'],
  ['es;q=0', 'en'],
  ['en;q=0.5,es;q=0.5', 'en'],
  ['es;q=0.5,en;q=0.5', 'es'],
  ['es,en', 'es'],
  ['ES-mx', 'es'],
  ['*', 'en'],
  ['esperanto', 'en'],
  ['es;q=abc', 'en'],
  ['es;q=2', 'en'],
  [';;;', 'en'],
  ['es;q=abc,en;q=0.1', 'en'],
  ['fr,es;q=0.2', 'es'],
]

for (const [header, expected] of cases) {
  test(`negotiateLocale(${JSON.stringify(header)}) → ${expected}`, () => {
    assert.equal(negotiateLocale(header), expected)
  })
}

test('localeHash conserva solo un ancla de letras minúsculas', () => {
  for (const hash of ['#lab', '#projects', '#about', '#contact', '#now']) {
    assert.equal(localeHash(hash), hash)
  }
  for (const hash of ['#<script>', '#', '', '#Lab', '#WORK', '#exp-1', '#now?x=1', '#a b', 'lab', ' #lab', '#lab ', '#lab\n', null, undefined]) {
    assert.equal(localeHash(hash), '', String(hash))
  }
})

test('withLocaleHash añade el ancla válida a la ruta de idioma y descarta el resto', () => {
  assert.equal(withLocaleHash('/es/work', '#lab'), '/es/work#lab')
  assert.equal(withLocaleHash('/es/work', '#<script>'), '/es/work')
  assert.equal(withLocaleHash('/es/about', '#Education'), '/es/about')
  assert.equal(withLocaleHash('/es/about', ''), '/es/about')
  assert.equal(withLocaleHash('/es/about', null), '/es/about')
  assert.equal(withLocaleHash('/es/about', undefined), '/es/about')
})
