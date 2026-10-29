import test from 'node:test'
import assert from 'node:assert/strict'
import { formatFicha, formatSectionFicha } from './ficha.ts'
import { SECTION_IDS } from '../content/sections.ts'
import { en } from '../content/en.ts'
import { facts } from '../content/facts.ts'

test('formatFicha numera desde 01 con relleno a 2 dígitos y corchetes', () => {
  assert.equal(formatFicha('EXP.', 0), '[EXP. 01]')
  assert.equal(formatFicha('EXP.', 2), '[EXP. 03]')
  assert.equal(formatFicha('EXP.', 9), '[EXP. 10]')
  assert.equal(formatFicha('LAB', 0), '[LAB 01]')
  assert.equal(formatFicha('LOGRO', 5), '[LOGRO 06]')
})

test('el formato de elemento cumple ^\[.+ \d{2}\]$', () => {
  for (const [label, i] of [['EXP.', 0], ['PROJ.', 7], ['LAB', 11]] as const) {
    assert.match(formatFicha(label, i), /^\[.+ \d{2}\]$/)
  }
})

test('el número sale del dato real: la última fila del Lab es [LAB 08]', () => {
  assert.equal(formatFicha(en.ficha.lab, facts.projects.lab.length - 1), '[LAB 08]')
})

test('formatFicha no numera elementos inexistentes', () => {
  assert.throws(() => formatFicha('X', -1))
  assert.throws(() => formatFicha('X', 1.5))
})

test('formatSectionFicha usa el índice real de la sección (hero 01 … contact 09)', () => {
  assert.equal(formatSectionFicha('hero'), '[01]')
  assert.equal(formatSectionFicha('now'), '[02]')
  assert.equal(formatSectionFicha('contact'), '[09]')
  SECTION_IDS.forEach((id, i) => {
    assert.equal(formatSectionFicha(id), `[${String(i + 1).padStart(2, '0')}]`)
  })
})

test('formatSectionFicha rechaza un id fuera de la lista', () => {
  assert.throws(() => formatSectionFicha('nope' as never))
})
