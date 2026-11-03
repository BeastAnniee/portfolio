import test from 'node:test'
import assert from 'node:assert/strict'
import { LETTER_DURATION_MS, LETTER_STEP_MS, riseTotalMs, splitLetters } from './letters.ts'
import { facts } from '../content/facts.ts'

test('el escalonado de la entrada del Hero: paso 25 ms (≤ 40), duración 500 ms', () => {
  assert.equal(LETTER_STEP_MS, 25)
  assert.ok(LETTER_STEP_MS <= 40)
  assert.equal(LETTER_DURATION_MS, 500)
})

test('splitLetters separa palabras y numera las letras de forma continua', () => {
  const words = splitLetters('Jostin Aldair Nava')
  assert.equal(words.length, 3)
  const letters = words.flat()
  assert.equal(letters.length, 16)
  assert.deepEqual(letters.map((l) => l.index), Array.from({ length: 16 }, (_, i) => i))
})

test('las letras reconstruyen el nombre exacto', () => {
  const name = 'Jostin Aldair Nava'
  const rebuilt = splitLetters(name).map((w) => w.map((l) => l.char).join('')).join(' ')
  assert.equal(rebuilt, name)
})

test('el total del escalonado cabe en la secuencia de 1,4 s', () => {
  assert.equal(riseTotalMs(16), 875)
  const n = splitLetters(facts.profile.name).flat().length
  assert.ok(riseTotalMs(n) <= 1400, String(riseTotalMs(n)))
})
