import test from 'node:test'
import assert from 'node:assert/strict'
import { copyFeedbackMs } from './copy-feedback.ts'

test('copiar correo: éxito 2,5 s; fallo 10 s para poder copiarlo a mano', () => {
  assert.equal(copyFeedbackMs(true), 2500)
  assert.equal(copyFeedbackMs(false), 10_000)
})
