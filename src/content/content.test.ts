import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { en } from './en.ts'
import { es } from './es.ts'
import { facts } from './facts.ts'
import { getDictionary, SECTION_IDS } from './index.ts'


/** Recorre un árbol y devuelve [ruta, valor] de cada hoja; los arrays aportan su longitud. */
function leaves(value: unknown, path = ''): Array<[string, unknown]> {
  if (Array.isArray(value)) {
    return [
      [`${path}.length`, value.length],
      ...value.flatMap((v, i) => leaves(v, `${path}[${i}]`)),
    ]
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  }
  return [[path, value]]
}

function strings(value: unknown): string[] {
  return leaves(value)
    .map(([, v]) => v)
    .filter((v): v is string => typeof v === 'string')
}

const numericTokens = (s: string) => (s.match(/\d+(?:[.,]\d+)?/g) ?? []).sort()

const enLeaves = leaves(en)
const esLeaves = leaves(es)
const allStrings = [...strings(en), ...strings(es), ...strings(facts)]

test('en y es tienen las mismas claves, tipos y longitudes de arrays', () => {
  assert.deepEqual(
    enLeaves.map(([p, v]) => [p, typeof v]),
    esLeaves.map(([p, v]) => [p, typeof v]),
  )
})

test('ninguna cadena de los diccionarios está vacía', () => {
  for (const [path, v] of [...enLeaves.map(([p, v]) => ['en.' + p, v]), ...esLeaves.map(([p, v]) => ['es.' + p, v])]) {
    if (typeof v === 'string') assert.ok(v.trim().length > 0, `${path} vacía`)
  }
})

test('paridad numérica: cada cadena lleva los mismos números en EN y ES', () => {
  const esMap = new Map(esLeaves)
  for (const [path, v] of enLeaves) {
    if (typeof v !== 'string') continue
    const other = esMap.get(path)
    assert.equal(typeof other, 'string', `falta ${path} en es`)
    assert.deepEqual(numericTokens(other as string), numericTokens(v), `números distintos en ${path}`)
  }
})

test('guardas de contenido prohibido', () => {
  for (const s of allStrings) {
    assert.ok(!/(?<!Jostin )Aldair Nava/.test(s), `nombre incompleto: ${s}`)
    assert.ok(!/único equipo mexicano|only Mexican team/i.test(s), `afirmación no confirmada: ${s}`)
    assert.ok(!s.includes('404.png'), `404.png: ${s}`)
    assert.ok(
      !/Ingeniería en Física y Mecatrónica|Physics and Mechatronics Engineering/i.test(s),
      `formación inventada: ${s}`,
    )
  }
  for (const dict of [en, es]) {
    assert.ok(dict.meta.title.includes('Software Engineer'))
    assert.ok(dict.hero.title.includes('Software Engineer'))
    for (const s of [dict.meta.title, dict.hero.title, dict.hero.qualifier]) {
      assert.ok(!/Scientific Programmer|Data Analyst/i.test(s), `rol no permitido: ${s}`)
    }
  }
})

test('perfil: nombre público y únicos enlaces permitidos', () => {
  assert.equal(facts.profile.name, 'Jostin Aldair Nava')
  assert.equal(facts.profile.github, 'https://github.com/BeastAnniee')
  assert.equal(facts.profile.linkedin, 'https://www.linkedin.com/in/aldair-nava-dev')
  assert.equal(facts.profile.email, 'jostinaval@gmail.com')
  for (const s of allStrings) {
    for (const m of s.match(/https?:\/\/[^\s"')]+/g) ?? []) {
      if (m.includes('linkedin.com')) assert.equal(m, facts.profile.linkedin)
      if (m.includes('github.com')) assert.ok(m.startsWith('https://github.com/BeastAnniee'), m)
    }
    assert.ok(!/linkedin\.com\/in\/jostin-aldair-nava/.test(s))
  }
})

test('el CV de cada idioma apunta a un archivo que existe en public/', () => {
  for (const locale of ['en', 'es'] as const) {
    const href = facts.cv[locale]
    assert.ok(href.startsWith('/'))
    assert.ok(existsSync(join(process.cwd(), 'public', href)), `${href} no existe`)
  }
})

test('getDictionary devuelve el diccionario del idioma y SECTION_IDS fija el orden', () => {
  assert.equal(getDictionary('en'), en)
  assert.equal(getDictionary('es'), es)
  assert.deepEqual([...SECTION_IDS], [
    'hero', 'now', 'experience', 'projects', 'stack', 'achievements', 'education', 'lab', 'contact',
  ])
  assert.deepEqual(Object.keys(en.nav.sections), [...SECTION_IDS])
})


test('Experience: orden, bullets, métricas y tecnologías', () => {
  assert.deepEqual(facts.experience.map((e) => e.id), ['softbank', 'playout', 'gh2'])
  assert.deepEqual(facts.experience.map((e) => e.company), ['SoftBank', 'PlayOut Kids', 'GH2 Systems'])
  for (const dict of [en, es]) {
    assert.deepEqual(facts.experience.map((e) => dict.experience.items[e.id].bullets.length), [4, 4, 1])
    for (const e of facts.experience) {
      assert.equal(dict.experience.items[e.id].metrics.length, e.metrics.length)
    }
  }
  assert.deepEqual(facts.experience.map((e) => e.metrics.map((m) => m.value)), [
    ['17', '3'],
    ['40→100 %', '6'],
    [],
  ])
  const gh2 = facts.experience[2]
  assert.equal(gh2.metrics.length, 0)
  assert.ok(!facts.experience.some((e) => /FRC|TIGRES/i.test(e.company)))
  assert.ok(!strings(en.experience).concat(strings(es.experience)).some((s) => /FRC|TIGRES/i.test(s)))
})

test('Experience: cada valor destacado queda emparejado con su etiqueta en ambos idiomas', () => {
  const pairs = (dict: typeof en, id: 'softbank' | 'playout') =>
    facts.experience.find((e) => e.id === id)!.metrics.map((m, i) => [m.value, dict.experience.items[id].metrics[i]])
  assert.deepEqual(pairs(en, 'softbank'), [['17', 'PDA screens'], ['3', 'languages']])
  assert.deepEqual(pairs(es, 'softbank'), [['17', 'pantallas PDA'], ['3', 'idiomas']])
  assert.deepEqual(pairs(en, 'playout'), [['40→100 %', 'data concordance'], ['6', 'departments']])
  assert.deepEqual(pairs(es, 'playout'), [['40→100 %', 'concordancia de datos'], ['6', 'departamentos']])
})

test('Experience: cada cifra destacada de facts aparece en los bullets de ambos idiomas', () => {
  for (const dict of [en, es]) {
    for (const e of facts.experience) {
      const prose = dict.experience.items[e.id].bullets.join(' ')
      for (const m of e.metrics) {
        for (const token of numericTokens(m.value)) {
          assert.match(prose, new RegExp(`(?<![\\d.,])${token}(?![\\d.,]\\d)`), `${token} (${m.value}) no está en los bullets de ${e.id}`)
        }
      }
    }
  }
})

test('Experience: chips solo con tecnologías nombradas en los bullets', () => {
  for (const e of facts.experience) {
    const text = strings(en.experience.items[e.id]).join(' ').toLowerCase()
    for (const t of e.tech) {
      const needle = t === 'REST' ? 'rest' : t.toLowerCase()
      assert.ok(text.includes(needle), `${t} no aparece en los bullets de ${e.company}`)
    }
  }
  assert.ok(!facts.experience.some((e) => (e.tech as readonly string[]).includes('monday.com')))
})

test('Education: tres formaciones y línea de idiomas', () => {
  assert.deepEqual(facts.education.map((e) => e.id), ['ucnl', 'uanl', 'eiao'])
  assert.deepEqual(facts.education.map((e) => e.period), [null, '2023 – 2025', '2020 – 2023'])
  for (const dict of [en, es]) {
    for (const e of facts.education) assert.ok(dict.education.items[e.id].length > 0)
  }
  assert.ok(es.education.items.eiao.includes('Técnico Superior Universitario'))
  assert.ok(en.education.items.eiao.includes('Associate Degree'))
  assert.ok(en.education.items.uanl.includes('incomplete'))
  assert.ok(es.education.items.uanl.includes('incompleta'))
})

test('Stack: tres grupos conforme al CV, con Power BI y Fortran', () => {
  assert.deepEqual(Object.keys(facts.stack), ['development', 'dataAutomation', 'tools'])
  assert.ok(facts.stack.dataAutomation.includes('Power BI'))
  assert.ok(facts.stack.dataAutomation.includes('Fortran'))
  assert.equal(facts.stack.development.length, 12)
  assert.equal(facts.stack.dataAutomation.length, 10)
  assert.equal(facts.stack.tools.length, 6)
})

test('techLabels cubre los nombres que difieren entre CV EN y ES', () => {
  assert.equal(es.techLabels['Advanced Excel'], 'Excel avanzado')
  assert.equal(es.techLabels['automated testing'], 'pruebas automatizadas')
  const all = [
    ...facts.stack.development, ...facts.stack.dataAutomation, ...facts.stack.tools,
    ...facts.experience.flatMap((e) => e.tech),
  ]
  assert.ok(all.includes('Advanced Excel') && all.includes('automated testing'))
})

test('Now: dos tarjetas (MES, Archive con enlace) y fecha inicial válida', () => {
  assert.deepEqual(facts.now.cards.map((c) => c.id), ['mes', 'archive'])
  assert.equal(facts.now.updatedAt, '2026-10-27')
  const archive = facts.now.cards[1]
  assert.equal('href' in archive && archive.href, 'https://github.com/BeastAnniee/archive')
  assert.ok(!('href' in facts.now.cards[0]))
  for (const dict of [en, es]) {
    assert.ok(dict.now.cards.archive.link)
    assert.equal(dict.now.cards.mes.link, undefined)
  }
})

test('Projects: spotlight = Maya y Caustix; Lab con portfolio y sin Archive', () => {
  assert.deepEqual(facts.projects.spotlight.map((p) => p.id), ['maya', 'caustix'])
  assert.equal(facts.projects.spotlight[0].href, 'https://ghekkinxmaya.tech/maya')
  assert.equal(facts.projects.spotlight[1].href, 'https://github.com/BeastAnniee/caustix')
  assert.deepEqual(facts.projects.spotlight[0].tech, ['TypeScript', 'React', 'MCP server', 'A2UI'])
  assert.deepEqual(facts.projects.spotlight[1].tech, ['Python', 'NumPy', 'Fortran'])
  const lab = facts.projects.lab.map((p) => p.id)
  assert.ok(!lab.includes('archive'))
  assert.ok(lab.includes('portfolio'))
  for (const dict of [en, es]) {
    for (const p of facts.projects.spotlight) {
      assert.ok(dict.projects.items[p.id]?.description, `falta ${p.id}`)
      assert.ok(dict.projects.items[p.id]?.result, `falta resultado de ${p.id}`)
    }
    for (const p of facts.projects.lab) assert.ok(dict.lab.items[p.id]?.description, `falta ${p.id}`)
    assert.deepEqual(Object.keys(dict.projects.items), facts.projects.spotlight.map((p) => p.id))
    assert.deepEqual(Object.keys(dict.lab.items), facts.projects.lab.map((p) => p.id))
  }
  for (const p of [...facts.projects.spotlight, ...facts.projects.lab]) {
    assert.ok(!(p.image ?? '').includes('404'))
    if (p.image) assert.ok(existsSync(join(process.cwd(), 'public', p.image)), p.image)
  }
})

test('Achievements: 4–6 entradas confirmadas, FLL sin años', () => {
  const confirmed = ['frc', 'chairmans', 'deans', 'hackmty2025', 'hackmty2026', 'fll']
  assert.ok(facts.achievements.length >= 4 && facts.achievements.length <= 6)
  for (const a of facts.achievements) assert.ok(confirmed.includes(a.id), a.id)
  const byId = Object.fromEntries(facts.achievements.map((a) => [a.id, a.year]))
  assert.equal(byId.chairmans, '2022')
  assert.equal(byId.deans, '2022')
  assert.equal(byId.fll, null)
  for (const dict of [en, es]) {
    assert.deepEqual(Object.keys(dict.achievements.items), facts.achievements.map((a) => a.id))
    assert.ok(!/\b(19|20)\d{2}\b/.test(strings(dict.achievements.items.fll).join(' ')))
    assert.ok(dict.achievements.items.chairmans.event.includes('Houston'))
    assert.ok(dict.achievements.items.chairmans.event.includes("Chairman's Award"))
    assert.ok(dict.achievements.items.deans.event.includes("Dean's List Semi-finalist"))
  }
})
