import test from 'node:test'
import assert from 'node:assert/strict'
import { formatFicha } from './ficha.ts'
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

test('formatPageIndex deriva el índice de la lista de páginas', async () => {
  const { formatPageIndex } = await import('./ficha.ts')
  assert.equal(formatPageIndex('home'), '[01/03]')
  assert.equal(formatPageIndex('work'), '[02/03]')
  assert.equal(formatPageIndex('about'), '[03/03]')
})

test('formatPageSectionFicha numera por posición dentro de su página', async () => {
  const { formatPageSectionFicha } = await import('./ficha.ts')
  assert.equal(formatPageSectionFicha('about', 'contact'), '[04]')
  assert.equal(formatPageSectionFicha('home', 'contact'), '[04]')
  assert.equal(formatPageSectionFicha('work', 'projects'), '[01]')
  assert.equal(formatPageSectionFicha('work', 'now'), '[02]')
  assert.equal(formatPageSectionFicha('work', 'lab'), '[03]')
})

test('formatPageSectionFicha rechaza una sección que no es de la página', async () => {
  const { formatPageSectionFicha } = await import('./ficha.ts')
  assert.throws(() => formatPageSectionFicha('about', 'now'))
})
