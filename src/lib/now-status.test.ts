import test from 'node:test'
import assert from 'node:assert/strict'
import { nowStatus } from './now-status.ts'

// Fecha de visita fija: 2026-10-27 (mediodía local, para no depender de la zona horaria)
const today = new Date(2026, 9, 27, 12, 0, 0)

function daysAgo(n: number): string {
  const d = new Date(Date.UTC(2026, 9, 27 - n))
  return d.toISOString().slice(0, 10)
}

test('0, 89 y 90 días → fresh', () => {
  for (const n of [0, 89, 90]) assert.deepEqual(nowStatus(daysAgo(n), today), { state: 'fresh' }, `${n} días`)
})

test('91 días → stale/old', () => {
  assert.deepEqual(nowStatus(daysAgo(91), today), { state: 'stale', reason: 'old' })
})

test('ausente o inválido → stale', () => {
  assert.deepEqual(nowStatus(undefined, today), { state: 'stale', reason: 'missing' })
  assert.deepEqual(nowStatus('', today), { state: 'stale', reason: 'missing' })
  for (const bad of ['abc', '2026-02-30', '2026-13-01', '27/10/2026', '2026-10-27T00:00:00Z']) {
    assert.deepEqual(nowStatus(bad, today), { state: 'stale', reason: 'invalid' }, bad)
  }
})

test('un día en el futuro → stale/future', () => {
  assert.deepEqual(nowStatus(daysAgo(-1), today), { state: 'stale', reason: 'future' })
})

test('la hora o zona de la visita no desplaza el límite de días naturales', () => {
  const late = new Date(2026, 9, 27, 23, 59, 59)
  const early = new Date(2026, 9, 27, 0, 0, 1)
  assert.equal(nowStatus(daysAgo(90), late).state, 'fresh')
  assert.equal(nowStatus(daysAgo(90), early).state, 'fresh')
  assert.equal(nowStatus(daysAgo(91), early).state, 'stale')
})
