import test from 'node:test'
import assert from 'node:assert/strict'
import { numbersFromFacts } from './numbers.ts'
import { facts } from '../content/facts.ts'

test('numbersFromFacts devuelve las 4 métricas de facts en su orden, con el empleo al que pertenecen', () => {
  const numbers = numbersFromFacts(facts.experience)
  assert.deepEqual(numbers.map((n) => n.value), ['17', '3', '40→100 %', '6'])
  assert.deepEqual(numbers.map((n) => n.jobId), ['softbank', 'softbank', 'playout', 'playout'])
  assert.deepEqual(numbers.map((n) => n.metricIndex), [0, 1, 0, 1])
})

test('cada cifra sale de facts.experience (nada derivado ni escrito a mano)', () => {
  const expected = facts.experience.flatMap((job) =>
    job.metrics.map((metric, metricIndex) => ({ value: metric.value, jobId: job.id, metricIndex })),
  )
  assert.deepEqual(numbersFromFacts(facts.experience), expected)
})

test('sin experiencia no hay cifras (nunca un «0»)', () => {
  assert.deepEqual(numbersFromFacts([]), [])
  assert.deepEqual(numbersFromFacts([{ id: 'x', metrics: [] }]), [])
})
