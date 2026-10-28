import test from 'node:test'
import assert from 'node:assert/strict'
import { en } from '../content/en.ts'
import { es } from '../content/es.ts'
import { facts } from '../content/facts.ts'
import { buildMarqueeItems } from './marquee.ts'

const known = (s: string, dict: typeof en) => {
  const pool: string[] = []
  const walk = (v: unknown) => {
    if (typeof v === 'string') pool.push(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk(facts)
  walk(dict)
  return pool.includes(s)
}

test('la cinta lleva empresas, tecnologías e hitos en ese orden', () => {
  for (const dict of [en, es]) {
    assert.deepEqual(buildMarqueeItems(dict, facts), [
      'SoftBank',
      'PlayOut Kids',
      'GH2 Systems',
      'TypeScript',
      'NestJS',
      'React',
      'Next.js',
      'Python',
      'PostgreSQL',
      dict.achievements.items.frc.event,
      dict.achievements.items.hackmty2026.event,
    ])
  }
})

test('ninguna cadena de la cinta es inventada y no hay duplicados', () => {
  for (const dict of [en, es]) {
    const items = buildMarqueeItems(dict, facts)
    for (const item of items) assert.ok(known(item, dict), `«${item}» no existe en facts ni en el diccionario`)
    assert.equal(new Set(items).size, items.length)
  }
})
