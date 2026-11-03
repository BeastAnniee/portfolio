import test from 'node:test'
import assert from 'node:assert/strict'
import {
  MOBILE_MAX_PX,
  WAIT_TIMEOUT_MS,
  FONTS_WAIT_MS,
  REFRESH_DEBOUNCE_MS,
  MAX_BATCH,
  NAV_INTENT_ATTR,
  NAV_INTENT_TIMEOUT_MS,
  amplitude,
  stagger,
  belowFold,
  FIRST_SCREEN_DELAY,
  HERO_SCRUB_MOBILE,
  REVEAL_MOBILE,
  RULES_MOBILE,
} from './config.ts'
import {
  ALLOWED_PROPS,
  HERO_CLIP_REVEAL,
  HERO_ENTRY,
  HERO_PHOTO,
  REVEAL,
  RISE,
  SCRUB_HERO,
  RULES,
  LAB_OPEN,
  CURTAIN,
  entryTotal,
  heroEntry,
  propsOf,
} from './specs.ts'
import { WAIT_RELEASED_ATTR, WAIT_SCRIPT, WAIT_SCRIPT_TIMEOUT_MS } from './wait-script.ts'
import { armIntentClear, isPlainInternalClick } from './intent.ts'

test('config: constantes del contrato', () => {
  assert.equal(MOBILE_MAX_PX, 767)
  assert.equal(WAIT_TIMEOUT_MS, 1200)
  assert.equal(FONTS_WAIT_MS, 600)
  assert.equal(REFRESH_DEBOUNCE_MS, 200)
  assert.equal(MAX_BATCH, 6)
})

test('config: amplitude se reduce a la mitad y stagger no pasa de 0,06 s en móvil', () => {
  assert.equal(amplitude(16, false), 16)
  assert.equal(amplitude(16, true), 8)
  assert.equal(stagger(0.08, false), 0.08)
  assert.equal(stagger(0.08, true), 0.06)
  assert.ok(stagger(0.025, true) <= 0.06)
  assert.ok(stagger(1, true) <= 0.06)
})

test('config: los respaldos por constante empiezan encendidos (se apagan solo si la traza lo exige)', () => {
  assert.deepEqual([HERO_SCRUB_MOBILE, REVEAL_MOBILE, RULES_MOBILE], [true, true, true])
})

test('config: belowFold es verdadero solo bajo el 90 % del viewport', () => {
  assert.equal(belowFold(0, 800), false)
  assert.equal(belowFold(720, 800), false)
  assert.equal(belowFold(720.5, 800), true)
  assert.equal(belowFold(2000, 800), true)
})

test('config: el contenido de la primera pantalla entra tras el titular, dentro del presupuesto', () => {
  assert.ok(FIRST_SCREEN_DELAY > 0 && FIRST_SCREEN_DELAY <= 0.5)
  assert.equal(REVEAL.skip, '#hero, [data-page-intro]')
})

test('M1: la entrada del Hero respeta tiempos, curvas y orden del contrato', () => {
  const by = Object.fromEntries(HERO_ENTRY.map((s) => [s.id, s]))
  assert.deepEqual(by.letters.from, { yPercent: 105 })
  assert.deepEqual(by.letters.to, { yPercent: 0 })
  assert.equal(by.letters.duration, 0.5)
  assert.equal(by.letters.stagger, 0.025)
  assert.equal(by.letters.ease, 'power3.out')
  assert.equal(by.letters.targets, 16)
  assert.deepEqual(by.enter.from, { y: 16, opacity: 0 })
  assert.equal(by.enter.duration, 0.45)
  assert.equal(by.enter.stagger, 0.08)
  assert.equal(by.enter.at, 0.55)
  assert.equal(by.pin.from.scale, 0.6)
  assert.equal(by.pin.duration, 0.4)
  assert.equal(by.pin.ease, 'back.out(1.7)')
  assert.equal(by.pin.at, 0.7)
  assert.equal(by.ornaments.from.rotate, -90)
  assert.equal(by.ornaments.duration, 0.6)
  assert.equal(by.ornaments.at, 0.8)
  assert.ok(entryTotal(HERO_ENTRY) <= 1.4, `total ${entryTotal(HERO_ENTRY)}`)
  // el nombre se lee a 0,6 s: la última letra termina de subir antes
  assert.ok(by.letters.at + by.letters.duration + (by.letters.stagger ?? 0) * 15 <= 0.9)
})

test('M1 en móvil: mitad de amplitud, ningún escalonado > 0,06 s y total ≤ 1,4 s', () => {
  const mobile = heroEntry(true)
  for (const step of mobile) assert.ok((step.stagger ?? 0) <= 0.06, `${step.id}: ${step.stagger}`)
  assert.equal(mobile.find((s) => s.id === 'enter')?.from.y, 8)
  assert.equal(mobile.find((s) => s.id === 'letters')?.from.yPercent, 105, 'la máscara sigue ocultando la letra entera')
  assert.ok(entryTotal(mobile) <= 1.4)
  assert.equal(heroEntry(false).find((s) => s.id === 'enter')?.from.y, 16)
})

test('M2 a M8 siguen los datos del contrato', () => {
  assert.deepEqual(HERO_PHOTO.from, { scale: 1.12 })
  assert.equal(HERO_PHOTO.duration, 1.2)
  assert.equal(REVEAL.from.y, 32)
  assert.equal(REVEAL.duration, 0.6)
  assert.equal(REVEAL.once, true)
  assert.equal(REVEAL.start, 'top 85%')
  assert.ok(REVEAL.follow > 0 && REVEAL.follow <= 0.3, 'el contenido espera a su titular, pero poco')
  assert.equal(REVEAL.fromMobile.y, 24)
  assert.deepEqual(REVEAL.block.from, { y: 48 }, 'los bloques solo suben: el fondo nunca arranca transparente')
  assert.ok(!('opacity' in REVEAL.block.from))
  assert.deepEqual(RISE.from, { yPercent: 105 })
  assert.equal(SCRUB_HERO.scrub, 0.6)
  assert.deepEqual([SCRUB_HERO.to.yPercent, SCRUB_HERO.to.scale], [8, 1.06])
  assert.deepEqual([SCRUB_HERO.toMobile.yPercent, SCRUB_HERO.toMobile.scale], [4, 1.03])
  assert.equal(RULES.scrub, true)
  assert.deepEqual([RULES.start, RULES.end], ['top 90%', 'top 60%'])
  assert.equal(LAB_OPEN.duration, 0.35)
  assert.equal(LAB_OPEN.stagger, 0.05)
  assert.deepEqual([CURTAIN.duration, CURTAIN.ease, CURTAIN.origin], [0.7, 'power3.inOut', 'bottom'])
  assert.equal(CURTAIN.pageStartDelay, 0.3)
  assert.equal(HERO_CLIP_REVEAL, false)
})

test('solo se animan transform, opacity y --p: nada de width, height, top, left, margin, filter ni clipPath', () => {
  const used = propsOf(
    HERO_ENTRY.flatMap((s) => [s.from, s.to]),
    HERO_PHOTO.from, HERO_PHOTO.to,
    REVEAL.from, REVEAL.fromMobile, REVEAL.block.from, REVEAL.block.fromMobile, REVEAL.to,
    RISE.from, RISE.to, SCRUB_HERO.to, SCRUB_HERO.toMobile, RULES.from, RULES.to,
    LAB_OPEN.from, LAB_OPEN.to, CURTAIN.from, CURTAIN.to,
  )
  for (const name of used) {
    assert.ok((ALLOWED_PROPS as readonly string[]).includes(name), `propiedad no permitida: ${name}`)
    assert.ok(!/^(width|height|top|left|right|bottom|margin|padding|filter|clipPath|clip-path)/.test(name), name)
  }
})

test('wait-script: ≤ 200 bytes, pone data-gsap=wait solo sin reduced-motion y su salvavidas deja la marca', () => {
  assert.ok(Buffer.byteLength(WAIT_SCRIPT) <= 200, `${Buffer.byteLength(WAIT_SCRIPT)} bytes`)
  assert.ok(
    WAIT_SCRIPT_TIMEOUT_MS >= 2000 && WAIT_SCRIPT_TIMEOUT_MS <= 3000,
    `${WAIT_SCRIPT_TIMEOUT_MS} ms fuera de 2000–3000`,
  )
  assert.ok(WAIT_SCRIPT.includes(String(WAIT_SCRIPT_TIMEOUT_MS)), 'el script no cita su temporizador')
  assert.equal(WAIT_RELEASED_ATTR, 'data-gsap-released')
  assert.match(WAIT_SCRIPT, /gsapReleased/, 'el salvavidas debe dejar una marca en <html>')

  const run = (reduce: boolean) => {
    const documentElement = { dataset: {} as Record<string, string> }
    let timer: { callback: () => void; ms: number } | null = null
    const setTimeout = (callback: () => void, ms: number) => {
      timer = { callback, ms }
      return 1
    }
    const matchMedia = (q: string) => ({ matches: reduce && q.includes('prefers-reduced-motion:reduce') })
    new Function('document', 'matchMedia', 'setTimeout', WAIT_SCRIPT)({ documentElement }, matchMedia, setTimeout)
    return { dataset: documentElement.dataset, timer: timer as { callback: () => void; ms: number } | null }
  }

  const animated = run(false)
  assert.deepEqual(animated.dataset, { gsap: 'wait' })
  const animatedTimer = animated.timer
  assert.ok(animatedTimer, 'el script no armó el temporizador')
  assert.equal(animatedTimer.ms, WAIT_SCRIPT_TIMEOUT_MS)
  animatedTimer.callback()
  assert.deepEqual(animated.dataset, { gsapReleased: 1 }, 'el salvavidas no retira data-gsap ni deja data-gsap-released')

  // Si PageMotion ya lo retiró, el salvavidas no vuelve a tocar nada.
  const released = run(false)
  delete released.dataset.gsap
  const releasedTimer = released.timer
  assert.ok(releasedTimer)
  releasedTimer.callback()
  assert.deepEqual(released.dataset, {}, 'sin data-gsap no debe dejar la marca')

  const still = run(true)
  assert.deepEqual(still.dataset, {})
  assert.equal(still.timer, null)
})

const base = {
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  defaultPrevented: false,
  anchor: { href: 'http://localhost:3400/en/work', target: '', download: false },
  origin: 'http://localhost:3400',
  current: '/en',
}

test('isPlainInternalClick: solo un clic izquierdo simple sobre un enlace interno que cambia de ruta', () => {
  assert.equal(isPlainInternalClick(base), true)
  assert.equal(isPlainInternalClick({ ...base, anchor: { ...base.anchor, href: 'http://localhost:3400/en/work#projects' } }), true)
  assert.equal(isPlainInternalClick({ ...base, anchor: { ...base.anchor, href: 'http://localhost:3400/en#contact' }, current: '/en/work' }), true)
  assert.equal(isPlainInternalClick({ ...base, anchor: { ...base.anchor, target: '_self' } }), true)
})

test('isPlainInternalClick: falso para ancla de la misma página, mailto, externos, descargas, nueva pestaña y clics no simples', () => {
  const no = (patch: object) => assert.equal(isPlainInternalClick({ ...base, ...patch }), false, JSON.stringify(patch))
  no({ anchor: { ...base.anchor, href: 'http://localhost:3400/en#contact' } })
  no({ anchor: { ...base.anchor, href: 'http://localhost:3400/en/' } })
  no({ anchor: { ...base.anchor, href: 'mailto:jostinaval@gmail.com' } })
  no({ anchor: { ...base.anchor, href: 'https://github.com/BeastAnniee' } })
  no({ anchor: { ...base.anchor, href: 'http://localhost:3400/resume.pdf', target: '_blank' } })
  no({ anchor: { ...base.anchor, download: true } })
  no({ anchor: null })
  no({ defaultPrevented: true })
  no({ button: 2 })
  no({ button: 1 })
  no({ metaKey: true })
  no({ ctrlKey: true })
  no({ shiftKey: true })
  no({ altKey: true })
})

test('nav intent: la bandera se retira sola si el clic no termina en navegación', () => {
  const attrs: Record<string, string> = { [NAV_INTENT_ATTR]: '1' }
  const root = {
    getAttribute: (name: string) => attrs[name] ?? null,
    removeAttribute: (name: string) => {
      delete attrs[name]
    },
  }
  const scheduled: { callback: () => void; ms: number }[] = []
  const cancelled: number[] = []
  const cancel = armIntentClear(
    root,
    (callback, ms) => {
      scheduled.push({ callback, ms })
      return scheduled.length
    },
    (id) => cancelled.push(id),
  )
  assert.equal(scheduled.length, 1)
  assert.equal(scheduled[0].ms, NAV_INTENT_TIMEOUT_MS)
  assert.ok(NAV_INTENT_TIMEOUT_MS >= 500 && NAV_INTENT_TIMEOUT_MS <= 1500, `${NAV_INTENT_TIMEOUT_MS} ms`)
  assert.equal(attrs[NAV_INTENT_ATTR], '1', 'la bandera no se retira antes de tiempo')
  scheduled[0].callback()
  assert.equal(attrs[NAV_INTENT_ATTR], undefined)
  cancel()
  assert.deepEqual(cancelled, [1])

  // Si la página nueva ya consumió la bandera antes del temporizador, este no toca nada.
  let lateCallback: (() => void) | undefined
  const late = armIntentClear(
    root,
    (callback) => {
      lateCallback = callback
      return 99
    },
    () => {},
  )
  delete attrs[NAV_INTENT_ATTR]
  lateCallback?.()
  assert.equal(attrs[NAV_INTENT_ATTR], undefined)
  late()
})

test('M1b: el título de página entra como el nombre del Hero y cabe en 1,4 s', async () => {
  const { PAGE_INTRO_ENTRY, adaptSteps } = await import('./specs.ts')
  const title = PAGE_INTRO_ENTRY.find((s) => s.id === 'title')
  assert.deepEqual(title?.from, { yPercent: 105 })
  assert.equal(title?.stagger, HERO_ENTRY[0].stagger)
  assert.ok(entryTotal(PAGE_INTRO_ENTRY) <= 1.4)
  assert.ok(entryTotal(adaptSteps(PAGE_INTRO_ENTRY, true)) <= 1.4)
})
