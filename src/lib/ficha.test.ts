import test from 'node:test'
import assert from 'node:assert/strict'
import { formatFicha } from './ficha.ts'

test('formatFicha numera desde 01 con relleno a 2 dígitos', () => {
  assert.equal(formatFicha('EXP.', 0), 'EXP. 01')
  assert.equal(formatFicha('EXP.', 2), 'EXP. 03')
  assert.equal(formatFicha('EXP.', 9), 'EXP. 10')
  assert.equal(formatFicha('LAB', 0), 'LAB 01')
  assert.equal(formatFicha('LOGRO', 5), 'LOGRO 06')
})
