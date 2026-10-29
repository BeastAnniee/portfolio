import test from 'node:test'
import assert from 'node:assert/strict'
import { COUNT_MS, countAt, isCountable } from './count-up.ts'
import { facts } from '../content/facts.ts'

test('COUNT_MS es 500', () => assert.equal(COUNT_MS, 500))

test('solo se cuentan enteros sin signo ni decimales', () => {
  assert.equal(isCountable('17'), true)
  for (const v of ['40→100 %', '[CONFIRMAR]', '', '3.5', '-2']) assert.equal(isCountable(v), false, v)
})

test('countAt empieza en 0, termina en el objetivo y no lo sobrepasa', () => {
  assert.equal(countAt(17, 0), 0)
  assert.equal(countAt(17, 500), 17)
  assert.equal(countAt(17, 9999), 17)
  let prev = 0
  for (let t = 0; t <= 600; t += 10) {
    const v = countAt(17, t)
    assert.ok(v >= prev, `decrece en ${t}`)
    assert.ok(v <= 17, `sobrepasa en ${t}`)
    prev = v
  }
})

test('las métricas contables de facts.ts son exactamente 17, 3 y 6', () => {
  const values = facts.experience.flatMap((e) => e.metrics.map((m) => m.value)).filter(isCountable)
  assert.deepEqual(values, ['17', '3', '6'])
})
