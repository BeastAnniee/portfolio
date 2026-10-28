import test from 'node:test'
import assert from 'node:assert/strict'
import { en } from '../content/en.ts'
import { es } from '../content/es.ts'
import { badgeBox, badgeGlyphs, badgeRadius, BADGE_STEP } from './badge-geometry.ts'

const count = (s: string) => Array.from(s).length

test('hero.badge da una sola vuelta: 21 glifos en EN y 27 en ES, terminados en «• »', () => {
  assert.equal(count(en.hero.badge), 21)
  assert.equal(count(es.hero.badge), 27)
  assert.ok(en.hero.badge.endsWith('• '))
  assert.ok(es.hero.badge.endsWith('• '))
})

test('radio y caja del sello salen del paso fijo de 9 px por glifo', () => {
  assert.equal(BADGE_STEP, 9)
  assert.ok(Math.abs(badgeRadius(21) - 30.08) < 0.05)
  assert.ok(Math.abs(badgeRadius(27) - 38.67) < 0.05)
  assert.ok(Math.abs(badgeBox(21) - 84.16) < 0.1)
  assert.ok(Math.abs(badgeBox(27) - 101.34) < 0.1)
})

test('badgeGlyphs: un glifo por carácter no-espacio, el ángulo cuenta los espacios', () => {
  for (const dict of [en, es]) {
    const text = dict.hero.badge
    const n = count(text)
    const glyphs = badgeGlyphs(text)
    const chars = Array.from(text)
    assert.equal(glyphs.length, chars.filter((c) => c !== ' ').length)
    let k = 0
    chars.forEach((c, i) => {
      if (c === ' ') return
      assert.equal(glyphs[k].char, c)
      assert.ok(Math.abs(glyphs[k].angle - (i * 360) / n) < 1e-9)
      k++
    })
    // paso de arco constante: r · Δθ = 9 px
    const r = badgeRadius(n)
    const step = (r * (2 * Math.PI)) / n
    assert.ok(Math.abs(step - 9) < 1e-9)
  }
})

test('badgeGlyphs de un texto vacío es una lista vacía', () => {
  assert.deepEqual(badgeGlyphs(''), [])
})
