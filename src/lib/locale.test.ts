import test from 'node:test'
import assert from 'node:assert/strict'
import { negotiateLocale } from './locale.ts'

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

test('switchLocaleHref cambia de idioma y conserva un ancla válida', async () => {
  const { switchLocaleHref } = await import('./locale.ts')
  assert.equal(switchLocaleHref('en', '#experience'), '/es#experience')
  assert.equal(switchLocaleHref('es', '#projects'), '/en#projects')
  assert.equal(switchLocaleHref('es', ''), '/en')
  assert.equal(switchLocaleHref('en', '#'), '/es')
  assert.equal(switchLocaleHref('en', '#<script>'), '/es')
  assert.equal(switchLocaleHref('en', '#a b'), '/es')
  assert.equal(switchLocaleHref('en', '#Experience'), '/es')
})
