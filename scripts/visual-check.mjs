#!/usr/bin/env node
// Arnés de comprobación visual (specs 002 y 003): Chrome headless por CDP, sin dependencias.
// No forma parte del gate (necesita Chrome y un servidor): es la evidencia L4 de /tc-validate.
//
// Uso:
//   node scripts/visual-check.mjs --url=http://localhost:3000 --check=landmarks,overflow
//     [--langs=en,es] [--widths=320,390,1280] [--scope=<selector>] [--shots] [--json] [--spec=<NNN-slug>]
//   Las capturas van a docs/specs/<spec>/screens/ (por defecto 003-poster-caracter).
//
// Requiere Node >= 22 (WebSocket global). Chrome: CHROME_PATH o rutas habituales (Edge de respaldo).

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// El import dinámico de los diccionarios .ts avisa de «MODULE_TYPELESS_PACKAGE_JSON»: ruido, no un fallo.
process.removeAllListeners('warning')

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// ───────────── argumentos ─────────────
function parseArgs(argv) {
  const out = {}
  for (const a of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a)
    if (m) out[m[1]] = m[2] ?? true
  }
  return out
}
const args = parseArgs(process.argv.slice(2))
const BASE_URL = String(args.url ?? 'http://localhost:3000').replace(/\/$/, '')
// Si --url trae una ruta (p. ej. http://localhost:3000/zz para la 404) se usa tal cual, sin idioma.
const PATH_OVERRIDE = new URL(BASE_URL).pathname.replace(/\/$/, '')
const ORIGIN = new URL(BASE_URL).origin
const LANGS = PATH_OVERRIDE ? ['-'] : String(args.langs ?? 'en,es').split(',').filter(Boolean)
const WIDTHS = String(args.widths ?? '320,390,1280').split(',').map(Number).filter(Boolean)
const SCOPE = typeof args.scope === 'string' ? args.scope : ''
const SHOTS = Boolean(args.shots) || String(args.check ?? '').split(',').includes('shots')
const AS_JSON = Boolean(args.json)
const SPEC = typeof args.spec === 'string' ? args.spec : '003-poster-caracter'
const SHOTS_DIR = join(ROOT, 'docs', 'specs', SPEC, 'screens')

// ───────────── Chrome + CDP ─────────────
function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean)
  const found = candidates.find((p) => existsSync(p))
  if (!found) throw new Error('No se encontró Chrome/Edge. Define CHROME_PATH.')
  return found
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.nextId = 0
    this.pending = new Map()
    this.listeners = new Set()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id) {
        const p = this.pending.get(msg.id)
        if (!p) return
        this.pending.delete(msg.id)
        if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`))
        else p.resolve(msg.result)
      } else {
        for (const fn of this.listeners) fn(msg)
      }
    })
  }
  send(method, params = {}, sessionId) {
    const id = ++this.nextId
    this.ws.send(JSON.stringify({ id, method, params, sessionId }))
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject, method }))
  }
  on(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
}

async function launchBrowser() {
  const userDir = mkdtempSync(join(tmpdir(), 'visual-check-'))
  const proc = spawn(
    findChrome(),
    [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-networking',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
  const portFile = join(userDir, 'DevToolsActivePort')
  let endpoint = ''
  for (let i = 0; i < 100 && !endpoint; i++) {
    if (existsSync(portFile)) {
      const [port, path] = readFileSync(portFile, 'utf8').split('\n')
      if (port && path) endpoint = `ws://127.0.0.1:${port}${path}`
    }
    if (!endpoint) await new Promise((r) => setTimeout(r, 100))
  }
  if (!endpoint) {
    proc.kill()
    throw new Error('Chrome no expuso el puerto de depuración.')
  }
  const ws = new WebSocket(endpoint)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', () => reject(new Error('WebSocket CDP falló')), { once: true })
  })
  const cdp = new Cdp(ws)
  const close = async () => {
    try {
      await cdp.send('Browser.close')
    } catch {
      /* el navegador ya cerró */
    }
    try {
      ws.close()
    } catch {
      /* ya cerrado */
    }
    proc.kill()
    for (let i = 0; i < 10; i++) {
      try {
        rmSync(userDir, { recursive: true, force: true })
        break
      } catch {
        await new Promise((r) => setTimeout(r, 200))
      }
    }
  }
  return { cdp, close }
}

// ───────────── Página ─────────────
class Page {
  constructor(cdp, sessionId) {
    this.cdp = cdp
    this.sessionId = sessionId
    this.consoleErrors = []
    this.failedRequests = []
    this.scripts = new Map() // requestId -> { url, bytes }
    this.urls = new Map() // requestId -> url
    this.layoutShift = 0
    cdp.on((msg) => {
      if (msg.sessionId !== sessionId) return
      this.#onEvent(msg.method, msg.params)
    })
  }
  #onEvent(method, p) {
    if (method === 'Runtime.exceptionThrown') {
      this.consoleErrors.push(p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text ?? 'excepción')
    } else if (method === 'Runtime.consoleAPICalled' && p.type === 'error') {
      this.consoleErrors.push(p.args.map((a) => a.value ?? a.description ?? '').join(' '))
    } else if (method === 'Network.requestWillBeSent') {
      this.urls.set(p.requestId, p.request.url)
      if (p.type === 'Script' && !this.#ignored(p.request.url)) {
        this.scripts.set(p.requestId, { url: p.request.url, bytes: 0 })
      }
    } else if (method === 'Network.loadingFinished') {
      const s = this.scripts.get(p.requestId)
      if (s) s.bytes = p.encodedDataLength
    } else if (method === 'Network.loadingFailed') {
      const url = this.urls.get(p.requestId) ?? ''
      if (!p.blockedReason && !this.#ignored(url)) this.failedRequests.push(`${p.errorText} ${url}`)
    } else if (method === 'Network.responseReceived') {
      if (p.response.status >= 400 && !this.#ignored(p.response.url)) {
        this.failedRequests.push(`${p.response.status} ${p.response.url}`)
      }
    }
  }
  // Vercel Speed Insights solo existe en el hosting: en local su script da 404 (esperado).
  #ignored(url) {
    return url.includes('/_vercel/')
  }
  send(method, params) {
    return this.cdp.send(method, params, this.sessionId)
  }
  /** Evalúa `fn(...args)` en la página (puede ser async) y devuelve el valor. */
  async eval(fn, ...fnArgs) {
    const expression = `(${fn.toString()})(...${JSON.stringify(fnArgs)})`
    const res = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description ?? res.exceptionDetails.text)
    }
    return res.result.value
  }
  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
  }
  async goto(url) {
    const loaded = new Promise((resolve) => {
      const off = this.cdp.on((msg) => {
        if (msg.sessionId === this.sessionId && msg.method === 'Page.loadEventFired') {
          off()
          resolve()
        }
      })
    })
    const nav = await this.send('Page.navigate', { url })
    if (nav.errorText) throw new Error(`No se pudo abrir ${url}: ${nav.errorText}`)
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 15000))])
  }
  /** Espera fuentes e imágenes (con tope) para que las medidas sean estables. */
  async settle(timeout = 4000) {
    await this.eval(async (ms) => {
      const wait = Promise.all([
        document.fonts.ready,
        ...[...document.images].map((i) =>
          i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r }),
        ),
      ])
      await Promise.race([wait, new Promise((r) => setTimeout(r, ms))])
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    }, timeout)
  }
  async shot(name) {
    if (!SHOTS) return
    mkdirSync(SHOTS_DIR, { recursive: true })
    let clip
    if (SCOPE) {
      clip = await this.eval((sel) => {
        const el = document.querySelector(sel)
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height, scale: 1 }
      }, SCOPE)
    }
    if (!clip) {
      const m = await this.send('Page.getLayoutMetrics')
      clip = { x: 0, y: 0, width: m.cssContentSize.width, height: m.cssContentSize.height, scale: 1 }
    }
    const { data } = await this.send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: true })
    writeFileSync(join(SHOTS_DIR, `${name}.png`), Buffer.from(data, 'base64'))
  }
  async close() {
    await this.cdp.send('Target.closeTarget', { targetId: this.targetId })
  }
}

async function newPage(cdp, opts = {}) {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true })
  const page = new Page(cdp, sessionId)
  page.targetId = targetId
  for (const domain of ['Page', 'Runtime', 'Network', 'Log']) await page.send(`${domain}.enable`)
  // Sin esto, en headless la pestaña puede no tener foco y :focus-visible no se pinta.
  await page.send('Emulation.setFocusEmulationEnabled', { enabled: true })
  if (opts.noCache) await page.send('Network.setCacheDisabled', { cacheDisabled: true })
  if (opts.noJs) await page.send('Emulation.setScriptExecutionDisabled', { value: true })
  if (opts.blocked) await page.send('Network.setBlockedURLs', { urls: opts.blocked })
  const features = []
  // Se fija siempre: la preferencia del sistema operativo no debe influir en las medidas.
  features.push({ name: 'prefers-reduced-motion', value: opts.reducedMotion ? 'reduce' : 'no-preference' })
  // CDP no emula hover:none por medios; la emulación táctil sí (hover: none, pointer: coarse).
  if (opts.noHover) await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  if (opts.forcedColors) features.push({ name: 'forced-colors', value: 'active' })
  if (features.length) await page.send('Emulation.setEmulatedMedia', { features })
  return page
}

// ───────────── Contexto de los checks ─────────────
const results = []
function report(check, label, status, detail = '') {
  results.push({ check, label, status, detail })
  if (!AS_JSON) {
    const tag = status === 'pass' ? 'PASS' : status === 'fail' ? 'FAIL' : 'INFO'
    console.log(`${tag}  ${check.padEnd(11)} ${label.padEnd(16)} ${detail}`)
  }
}

/** Abre `path` en `lang`/`width` y ejecuta `fn(page)`; cierra la pestaña siempre. */
async function withPage(cdp, { path, lang, width, height = 844, opts = {}, name }, fn) {
  const page = await newPage(cdp, opts)
  try {
    await page.setViewport(width, height)
    await page.goto(PATH_OVERRIDE ? BASE_URL : `${ORIGIN}${path.replace('{lang}', lang)}`)
    if (!opts.noJs) await page.settle()
    // --open despliega el Lab antes de medir (sus tarjetas están ocultas hasta entonces).
    if (args.open && !opts.noJs) {
      await page.eval(() => document.querySelector('#lab button[aria-expanded="false"]')?.click())
      await page.settle()
    }
    return await fn(page)
  } finally {
    if (name && page) await page.shot(name).catch(() => {})
    await page.close()
  }
}

// ───────────── Checks ─────────────
const checks = {}

// REQ-16 / AC-14: un `main` y un `contentinfo`, el segundo fuera del primero.
checks.landmarks = async ({ cdp }) => {
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 390 }, async (page) => {
      const { nodes } = await page.send('Accessibility.getFullAXTree')
      const count = (role) => nodes.filter((n) => !n.ignored && n.role?.value === role).length
      const main = count('main')
      const info = count('contentinfo')
      const footerInMain = await page.eval(() => {
        const m = document.querySelector('main')
        return [...document.querySelectorAll('footer')].some((f) => m?.contains(f))
      })
      const ok = main === 1 && info === 1 && !footerInMain
      report('landmarks', lang, ok ? 'pass' : 'fail', `main=${main} contentinfo=${info} footerDentroDeMain=${footerInMain}`)
    })
  }
}

// AC-5: sin desborde horizontal del documento.
checks.overflow = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
        const { scrollWidth, innerWidth, beyond } = await page.eval((scope) => {
          const edge = document.documentElement.clientWidth
          const roots = scope ? [...document.querySelectorAll(scope)] : [document.body]
          const beyond = []
          for (const root of roots) {
            for (const el of root.querySelectorAll('*')) {
              const r = el.getBoundingClientRect()
              if (r.width > 0 && r.right > edge + 0.5 && !el.closest('.marquee-track, [data-hero-frame] h1')) {
                beyond.push(`${el.tagName.toLowerCase()} «${(el.textContent || '').trim().slice(0, 16)}» ${Math.round(r.right)}>${edge}`)
              }
            }
          }
          return { scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, beyond }
        }, SCOPE)
        const ok = scrollWidth <= innerWidth && beyond.length === 0
        report('overflow', `${lang} ${width}`, ok ? 'pass' : 'fail', ok ? `scrollWidth=${scrollWidth} viewport=${innerWidth}` : `scrollWidth=${scrollWidth}/${innerWidth}; ${beyond.length} elementos fuera: ${beyond.slice(0, 3).join(' | ')}`)
      })
    }
  }
}

// AC-4: ningún texto visible < 12 px; `p` de cuerpo ≥ 16 px a 390 px.
checks['font-sizes'] = async ({ cdp }) => {
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 390 }, async (page) => {
      const r = await page.eval((scope) => {
        const roots = scope ? [...document.querySelectorAll(scope)] : [document.body]
        const small = []
        const body = []
        for (const root of roots) {
          for (const el of root.querySelectorAll('*')) {
            const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
            if (!hasText) continue
            const rect = el.getBoundingClientRect()
            const cs = getComputedStyle(el)
            if (rect.width <= 1 || rect.height <= 1 || cs.display === 'none' || cs.visibility === 'hidden') continue
            const size = parseFloat(cs.fontSize)
            const label = `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${size}px «${el.textContent.trim().slice(0, 24)}»`
            if (size < 12) small.push(label)
            if (el.tagName === 'P' && size < 16 && !/mono|monospace/i.test(cs.fontFamily)) body.push(label)
          }
        }
        return { small, body }
      }, SCOPE)
      const ok = r.small.length === 0 && r.body.length === 0
      const detail = ok
        ? 'sin texto < 12 px; cuerpo ≥ 16 px'
        : `< 12 px: ${r.small.length} · cuerpo < 16 px: ${r.body.length} · p.ej. ${[...r.small, ...r.body].slice(0, 3).join(' | ')}`
      report('font-sizes', lang, ok ? 'pass' : 'fail', detail)
    })
  }
}

// Sin errores de consola ni peticiones fallidas al cargar.
checks.console = async ({ cdp }) => {
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 390 }, async (page) => {
      const problems = [...page.consoleErrors, ...page.failedRequests]
      report('console', lang, problems.length === 0 ? 'pass' : 'fail', problems.length ? problems.slice(0, 3).join(' | ') : 'sin errores')
    })
  }
}

// NF-1 / AC-21: JS transferido en la carga de /en con caché desactivada (informativo).
checks['js-bytes'] = async ({ cdp }) => {
  await withPage(cdp, { path: '/{lang}', lang: 'en', width: 1280, opts: { noCache: true } }, async (page) => {
    await new Promise((r) => setTimeout(r, 500))
    let total = 0
    for (const s of page.scripts.values()) total += s.bytes
    report('js-bytes', 'en', 'info', `${total} bytes transferidos (${(total / 1024).toFixed(1)} kB) en ${page.scripts.size} scripts`)
  })
}

// REQ-17 / AC-15: todo control visible mide ≥ 44 × 44 px (se exime el enlace en línea dentro de un `p`).
checks.targets = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
        const r = await page.eval((scope) => {
          const roots = scope ? [...document.querySelectorAll(scope)] : [document.body]
          const small = []
          let total = 0
          for (const root of roots) {
            for (const el of root.querySelectorAll('a[href], button, input:not([type=hidden]), textarea, select, [role=button]')) {
              const rect = el.getBoundingClientRect()
              const cs = getComputedStyle(el)
              if (rect.width <= 1 || rect.height <= 1 || cs.display === 'none' || cs.visibility === 'hidden') continue
              if (el.tagName === 'A' && el.closest('p') && cs.display === 'inline') continue
              total++
              if (rect.width < 43.5 || rect.height < 43.5) {
                small.push(`${el.tagName.toLowerCase()} «${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 20)}» ${Math.round(rect.width)}×${Math.round(rect.height)}`)
              }
            }
          }
          return { small, total }
        }, SCOPE)
        report('targets', `${lang} ${width}`, r.small.length === 0 ? 'pass' : 'fail', r.small.length ? `${r.small.length}/${r.total} < 44 px: ${r.small.slice(0, 3).join(' | ')}` : `${r.total} controles ≥ 44 × 44`)
      })
    }
  }
}

// REQ-17 / AC-15: recorrido con Tab; cada control enfocado muestra outline de ≥ 2 px (accent, o carbon en bloque invertido).
checks.focus = async ({ cdp }) => {
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 1280 }, async (page) => {
      const seen = []
      const key = async (type) =>
        page.send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 })
      let first = null
      for (let i = 0; i < 120; i++) {
        await key('rawKeyDown')
        await key('keyUp')
        await new Promise((r) => setTimeout(r, 60))
        const info = await page.eval((scope) => {
          const el = document.activeElement
          if (!el || el === document.body) return null
          const cs = getComputedStyle(el)
          const inScope = !scope || [...document.querySelectorAll(scope)].some((r) => r.contains(el))
          return {
            id: `${el.tagName.toLowerCase()}:${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 18)}:${[...document.all].indexOf(el)}`,
            inScope,
            style: cs.outlineStyle,
            width: parseFloat(cs.outlineWidth),
            color: cs.outlineColor,
            transition: cs.transitionProperty,
            inverted: !!el.closest('.inverted, [data-block="accent"]'),
          }
        }, SCOPE)
        if (!info) continue
        if (first === null) first = info.id
        else if (info.id === first) break
        if (info.inScope) seen.push(info)
      }
      const accent = 'rgb(238, 85, 131)'
      const carbon = 'rgb(20, 20, 20)'
      const bad = seen.filter(
        (s) => s.style === 'none' || s.width < 2 || s.color !== (s.inverted ? carbon : accent),
      )
      report(
        'focus',
        lang,
        seen.length > 0 && bad.length === 0 ? 'pass' : 'fail',
        seen.length === 0
          ? 'ningún control enfocable en el ámbito'
          : bad.length
            ? `${bad.length}/${seen.length} sin outline de 2 px: ${bad.slice(0, 3).map((b) => `${b.id} (${b.style} ${b.width}px ${b.color}; transition: ${b.transition})`).join(' | ')}`
            : `${seen.length} controles con outline de 2 px`,
      )
    })
  }
}

// REQ-2 / AC-2: contraste de todo texto visible (≥ 4,5:1, o ≥ 3:1 en texto grande) sobre su fondo efectivo.
checks.contrast = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
        const r = await page.eval((scope) => {
          const canvas = document.createElement('canvas')
          canvas.width = canvas.height = 1
          const ctx = canvas.getContext('2d', { willReadFrequently: true })
          const rgba = (css) => {
            ctx.clearRect(0, 0, 1, 1)
            ctx.fillStyle = '#000'
            ctx.fillStyle = css
            ctx.fillRect(0, 0, 1, 1)
            const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
            return { r, g, b, a: a / 255 }
          }
          const over = (top, bottom) => {
            const a = top.a + bottom.a * (1 - top.a)
            if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
            const mix = (t, b) => (t * top.a + b * bottom.a * (1 - top.a)) / a
            return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a }
          }
          const lum = ({ r, g, b }) => {
            const ch = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
            return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
          }
          const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
          const background = (el) => {
            const layers = []
            for (let n = el; n; n = n.parentElement) {
              const c = rgba(getComputedStyle(n).backgroundColor)
              if (c.a > 0) layers.push(c)
              if (c.a === 1) break
            }
            return layers.reduceRight((below, layer) => over(layer, below), { r: 255, g: 255, b: 255, a: 1 })
          }
          const roots = scope ? [...document.querySelectorAll(scope)] : [document.body]
          const fails = []
          let checked = 0
          for (const root of roots) {
            for (const el of root.querySelectorAll('*')) {
              if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
              const rect = el.getBoundingClientRect()
              const cs = getComputedStyle(el)
              if (rect.width <= 1 || rect.height <= 1 || cs.display === 'none' || cs.visibility === 'hidden') continue
              let fg = rgba(cs.color)
              const bg = background(el)
              if (fg.a < 1) fg = over(fg, bg)
              const size = parseFloat(cs.fontSize)
              const large = size >= 24 || (size >= 18.5 && parseInt(cs.fontWeight, 10) >= 700)
              const need = large ? 3 : 4.5
              const got = ratio(fg, bg)
              checked++
              if (got < need) fails.push(`${el.tagName.toLowerCase()} «${el.textContent.trim().slice(0, 20)}» ${got.toFixed(2)} < ${need}`)
            }
          }
          return { fails, checked }
        }, SCOPE)
        report('contrast', `${lang} ${width}`, r.fails.length === 0 ? 'pass' : 'fail', r.fails.length ? `${r.fails.length}/${r.checked}: ${r.fails.slice(0, 3).join(' | ')}` : `${r.checked} textos ≥ umbral`)
      })
    }
  }
}

// REQ-10/11 / AC-8, AC-9: sello completo (sin textPath/textLength), dentro del viewport, animado solo con transform.
checks.badge = async ({ cdp }) => {
  const dicts = { en: (await import('../src/content/en.ts')).en, es: (await import('../src/content/es.ts')).es }
  for (const lang of LANGS) {
    const expected = Array.from(dicts[lang].hero.badge).filter((c) => c !== ' ')
    const boxes = { en: 84, es: 101.4 }
    for (const width of WIDTHS) {
      for (const reducedMotion of [false, true]) {
        await withPage(
          cdp,
          { path: '/{lang}', lang, width, opts: { reducedMotion }, name: reducedMotion ? undefined : `badge-${width}-${lang}-normal` },
          async (page) => {
            const r = await page.eval((expectedChars) => {
              const root = document.querySelector('[data-badge]')
              if (!root) return { missing: true }
              const svg = root.querySelector('svg')
              const sr = svg.getBoundingClientRect()
              const texts = [...svg.querySelectorAll('text')]
              const outside = texts.filter((t) => {
                const b = t.getBoundingClientRect()
                return b.left < sr.left - 0.75 || b.right > sr.right + 0.75 || b.top < sr.top - 0.75 || b.bottom > sr.bottom + 0.75
              }).length
              const g = svg.querySelector('.badge-spin')
              const anim = g ? g.getAnimations()[0] : null
              const props = anim ? Object.keys(anim.effect.getKeyframes()[0]).filter((k) => !['offset', 'easing', 'composite', 'computedOffset'].includes(k)) : []
              return {
                ariaHidden: root.getAttribute('aria-hidden') === 'true',
                chars: texts.map((t) => t.textContent).join(''),
                expected: expectedChars.join(''),
                textPath: svg.querySelectorAll('textPath').length,
                textLength: svg.querySelectorAll('[textLength]').length,
                outside,
                box: Math.round(sr.width * 10) / 10,
                insideViewport: sr.left >= 0 && sr.right <= innerWidth,
                animationName: g ? getComputedStyle(g).animationName : null,
                animProps: props,
              }
            }, expected)
            const label = `${lang} ${width}${reducedMotion ? ' rm' : ''}`
            if (r.missing) return report('badge', label, 'fail', 'no hay [data-badge]')
            const problems = []
            if (!r.ariaHidden) problems.push('sin aria-hidden')
            if (r.chars !== r.expected) problems.push(`glifos «${r.chars}» ≠ «${r.expected}»`)
            if (r.textPath || r.textLength) problems.push(`textPath=${r.textPath} textLength=${r.textLength}`)
            if (r.outside) problems.push(`${r.outside} glifos fuera de la caja`)
            if (Math.abs(r.box - boxes[lang]) > 1.5) problems.push(`caja ${r.box} px (≈ ${boxes[lang]})`)
            if (!r.insideViewport) problems.push('sale del viewport')
            if (reducedMotion) {
              if (r.animationName !== 'none') problems.push(`animación con reduced-motion: ${r.animationName}`)
            } else {
              if (r.animationName !== 'badge-spin') problems.push(`animación «${r.animationName}»`)
              if (r.animProps.some((p) => p !== 'transform')) problems.push(`anima ${r.animProps.join(',')}`)
            }
            report('badge', label, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `caja ${r.box} px, ${r.chars.length} glifos, anim ${r.animationName}`)
          },
        )
      }
    }
  }
}

// REQ-7/8 / AC-5, AC-7: nombre como texto del DOM a escala de cartel, dentro del marco, foto en duotono.
checks.hero = async ({ cdp }) => {
  const dicts = { en: (await import('../src/content/en.ts')).en, es: (await import('../src/content/es.ts')).es }
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      const height = width === 360 ? 640 : 844
      await withPage(cdp, { path: '/{lang}', lang, width, height, name: `hero-${width}-${lang}-normal` }, async (page) => {
        const r = await page.eval((photoAlt) => {
          const frame = document.querySelector('[data-hero-frame]')
          const h1 = document.querySelector('#hero h1')
          if (!frame || !h1) return { missing: true }
          const frameWidth = frame.clientWidth
          // Cada palabra es una .mask con sus letras .rise; su ancho real va de la primera a la última letra.
          const letters = h1.querySelectorAll('.rise').length
          const rects = [...h1.querySelectorAll('.mask')].map((m) => {
            const l = [...m.querySelectorAll('.rise')]
            const first = l[0].getBoundingClientRect()
            const last = l[l.length - 1].getBoundingClientRect()
            return { text: m.textContent.trim(), rect: { left: first.left, right: last.right, top: first.top, width: last.right - first.left } }
          })
          const words = rects.map((w) => ({ text: w.text, width: w.rect.width }))
          const oneLine = rects.length > 1 && rects.every((w) => Math.abs(w.rect.top - rects[0].rect.top) < 2)
          const lineWidth = oneLine ? rects[rects.length - 1].rect.right - rects[0].rect.left : null
          const duo = document.querySelector('#hero .duo')
          const img = duo?.querySelector('img')
          const cta = document.querySelector('#hero a[href="#projects"]')?.getBoundingClientRect()
          return {
            // El nombre accesible sale del .sr-only (el textContent duplica: sr-only + letras aria-hidden).
            text: (h1.querySelector('.sr-only')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
            letters,
            visibleHidden: h1.querySelector('[aria-hidden="true"]') !== null,
            dots: duo ? duo.querySelectorAll('.duo-dots[aria-hidden="true"]').length : 0,
            fontSize: parseFloat(getComputedStyle(h1).fontSize),
            frameWidth,
            lineRatio: lineWidth === null ? null : lineWidth / frameWidth,
            ratios: words.map((w) => ({ text: w.text, ratio: w.width / frameWidth })),
            layers: duo ? duo.querySelectorAll('.duo-layer').length : 0,
            grainHidden: !!duo?.querySelector('.grain[aria-hidden="true"]'),
            alt: img?.getAttribute('alt') ?? null,
            expectedAlt: photoAlt,
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
            cta: cta ? { top: Math.round(cta.top), bottom: Math.round(cta.bottom) } : null,
          }
        }, dicts[lang].hero.photoAlt)
        const label = `${lang} ${width}`
        if (r.missing) return report('hero', label, 'fail', 'no hay [data-hero-frame] o #hero h1')
        const problems = []
        if (r.text !== 'Jostin Aldair Nava') problems.push(`h1 «${r.text}»`)
        const max = Math.max(...r.ratios.map((x) => x.ratio))
        if (r.ratios.length !== 3 || max > 1) problems.push(`palabra más ancha ${(max * 100).toFixed(1)} % del marco`)
        if (r.lineRatio !== null && r.lineRatio > 1) problems.push(`nombre en una línea ${(r.lineRatio * 100).toFixed(1)} % del marco`)
        if (r.letters !== 16) problems.push(`${r.letters} letras .rise (esperadas 16)`)
        if (!r.visibleHidden) problems.push('las letras visibles no van en aria-hidden')
        if (r.layers !== 3) problems.push(`${r.layers} capas de duotono (esperadas 3)`)
        if (r.dots !== 1) problems.push(`${r.dots} capas .duo-dots (esperada 1)`)
        if (!r.grainHidden) problems.push('grano sin aria-hidden')
        if (r.alt !== r.expectedAlt) problems.push(`alt «${r.alt}»`)
        if (r.scrollWidth > r.innerWidth) problems.push(`desborde ${r.scrollWidth} > ${r.innerWidth}`)
        const ratios = r.lineRatio !== null ? `línea ${(r.lineRatio * 100).toFixed(1)} %` : r.ratios.map((x) => `${x.text} ${(x.ratio * 100).toFixed(1)} %`).join(', ')
        const cta = r.cta ? `; CTA y=${r.cta.top}–${r.cta.bottom}${height === 640 ? ` (pliegue 640)` : ''}` : ''
        report('hero', label, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `${r.fontSize.toFixed(0)} px · ${ratios}${cta}`)
      })
    }
  }
}

// REQ-13/14/15 / AC-11, AC-12: cinta de créditos accesible, pausable, ≤ 50 px/s y detenida con reduced-motion o sin JS.
checks.marquee = async ({ cdp }) => {
  const dicts = { en: (await import('../src/content/en.ts')).en, es: (await import('../src/content/es.ts')).es }
  // Devuelve la función que se evalúa en la página con el aria-label esperado.
  function page_eval_marquee() {
    return (labelText) => {
      const group = document.querySelector('[role="group"].marquee')
      if (!group || group.getAttribute('aria-label') !== labelText) return { missing: true }
      const track = group.querySelector('.marquee-track')
      const lists = [...track.querySelectorAll('ul')]
      const button = group.querySelector('button')
      const br = button?.getBoundingClientRect()
      const cs = getComputedStyle(track)
      return {
        lists: lists.length,
        copyHidden: lists[1]?.getAttribute('aria-hidden') === 'true',
        sameText: lists.length === 2 && lists[0].textContent === lists[1].textContent,
        firstHidden: lists[0]?.getAttribute('aria-hidden') === 'true',
        copyDisplay: lists[1] ? getComputedStyle(lists[1]).display : null,
        animationName: cs.animationName,
        playState: cs.animationPlayState,
        duration: parseFloat(cs.animationDuration),
        copyWidth: lists[1] ? lists[1].getBoundingClientRect().width : 0,
        firstWidth: lists[0] ? lists[0].getBoundingClientRect().width : 0,
        button: button
          ? { label: button.getAttribute('aria-label'), w: Math.round(br.width), h: Math.round(br.height), display: getComputedStyle(button).display }
          : null,
        paused: document.documentElement.hasAttribute('data-motion-paused') ? 'true' : null,
        badgePlayState: document.querySelector('.badge-spin') ? getComputedStyle(document.querySelector('.badge-spin')).animationPlayState : null,
        viewport: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        text: lists[0]?.textContent.replace(/\s+/g, ' ').trim(),
      }
    }
  }
  for (const lang of LANGS) {
    const m = dicts[lang].marquee
    for (const width of WIDTHS) {
      // Normal: teclado, pausa, copia oculta, velocidad.
      await withPage(cdp, { path: '/{lang}', lang, width, name: `marquee-${width}-${lang}-normal` }, async (page) => {
        const r = await page.eval(page_eval_marquee(), m.label)
        const label = `${lang} ${width}`
        if (r.missing) return report('marquee', label, 'fail', 'no hay [role=group].marquee con aria-label')
        const problems = []
        if (r.lists !== 2) problems.push(`${r.lists} listas (esperadas 2)`)
        if (!r.copyHidden) problems.push('la copia no es aria-hidden')
        if (r.firstHidden) problems.push('la primera lista está oculta a AT')
        if (!r.sameText) problems.push('las copias no tienen el mismo texto')
        if (!r.button || r.button.label !== m.pause) problems.push(`botón «${r.button?.label}» ≠ «${m.pause}»`)
        if (r.button && (r.button.w < 44 || r.button.h < 44)) problems.push(`botón ${r.button.w}×${r.button.h}`)
        if (r.animationName !== 'marquee') problems.push(`animación «${r.animationName}»`)
        const speed = r.copyWidth / r.duration
        if (speed > 50) problems.push(`velocidad ${speed.toFixed(1)} px/s > 50`)
        if (r.scrollWidth > r.viewport) problems.push(`desborde ${r.scrollWidth} > ${r.viewport}`)
        // Teclado: Tab hasta el botón, Enter → pausa; otra vez → reanuda.
        const key = (type, k, code, vk, text) =>
          page.send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, text })
        let reached = false
        for (let i = 0; i < 80 && !reached; i++) {
          await key('rawKeyDown', 'Tab', 'Tab', 9)
          await key('keyUp', 'Tab', 'Tab', 9)
          reached = await page.eval(() => document.activeElement?.closest('[role="group"].marquee') !== null && document.activeElement?.tagName === 'BUTTON')
        }
        if (!reached) problems.push('el botón no es alcanzable con Tab')
        else {
          await key('keyDown', 'Enter', 'Enter', 13, '\r')
          await key('keyUp', 'Enter', 'Enter', 13)
          await new Promise((res) => setTimeout(res, 100))
          const after = await page.eval(page_eval_marquee(), m.label)
          if (after.paused !== 'true' || after.playState !== 'paused') problems.push(`tras pausar: data-motion-paused=${after.paused} play-state=${after.playState}`)
          if (after.badgePlayState !== 'paused') problems.push(`tras pausar el sello sigue «${after.badgePlayState}»`)
          if (after.button?.label !== m.play) problems.push(`tras pausar el botón dice «${after.button?.label}» ≠ «${m.play}»`)
          await key('keyDown', 'Enter', 'Enter', 13, '\r')
          await key('keyUp', 'Enter', 'Enter', 13)
          await new Promise((res) => setTimeout(res, 100))
          const again = await page.eval(page_eval_marquee(), m.label)
          if (again.paused === 'true' || again.playState !== 'running') problems.push(`al reanudar: data-motion-paused=${again.paused} play-state=${again.playState}`)
          if (again.badgePlayState !== 'running') problems.push(`al reanudar el sello está «${again.badgePlayState}»`)
        }
        report('marquee', label, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `${speed.toFixed(1)} px/s (copia ${Math.round(r.copyWidth)} px / ${r.duration} s); Tab+Enter pausa y reanuda`)
      })
      // reduced-motion: detenida, sin copia, sin botón, texto legible.
      await withPage(cdp, { path: '/{lang}', lang, width, opts: { reducedMotion: true }, name: `marquee-${width}-${lang}-reduced` }, async (page) => {
        const r = await page.eval(page_eval_marquee(), m.label)
        const label = `${lang} ${width} rm`
        if (r.missing) return report('marquee', label, 'fail', 'no hay [role=group].marquee con aria-label')
        const problems = []
        if (r.animationName !== 'none') problems.push(`animación «${r.animationName}»`)
        if (r.copyDisplay !== 'none') problems.push(`copia display=${r.copyDisplay}`)
        if (r.button && r.button.display !== 'none') problems.push('el botón de pausa sigue visible')
        if (!r.text || r.firstWidth <= 0 || r.firstWidth > r.viewport) problems.push(`texto no legible (ancho ${Math.round(r.firstWidth)} / ${r.viewport})`)
        if (r.scrollWidth > r.viewport) problems.push(`desborde ${r.scrollWidth} > ${r.viewport}`)
        report('marquee', label, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `detenida, copia y botón ocultos, texto en ${Math.round(r.firstWidth)} px`)
      })
    }
    // JS desactivado: el <noscript> detiene la animación y el texto sigue ahí.
    await withPage(cdp, { path: '/{lang}', lang, width: 390, opts: { noJs: true } }, async (page) => {
      const r = await page.eval(page_eval_marquee(), m.label)
      if (r.missing) return report('marquee', `${lang} sin JS`, 'fail', 'no hay [role=group].marquee con aria-label')
      report('marquee', `${lang} sin JS`, r.animationName === 'none' && r.text ? 'pass' : 'fail', `animación «${r.animationName}»`)
    })
  }
}

// REQ-3/4 / AC-3: bloques invertidos marcados con [data-block], en orden del DOM: como máximo 2 y ninguno
// consecutivo. Projects = bone/carbon (y .inverted para el foco); Contact = acento/carbon.
checks.blocks = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
        const r = await page.eval(() => {
          const sections = [...document.querySelectorAll('main section')]
          const blocks = sections
            .map((s, i) => ({ s, i }))
            .filter(({ s }) => s.hasAttribute('data-block'))
            .map(({ s, i }) => {
              const cs = getComputedStyle(s)
              return { id: s.id, kind: s.getAttribute('data-block'), index: i, bg: cs.backgroundColor, color: cs.color, inverted: s.classList.contains('inverted') }
            })
          return { blocks, total: sections.length }
        })
        const problems = []
        const want = {
          projects: { kind: 'bone', bg: 'rgb(233, 228, 216)', color: 'rgb(20, 20, 20)' },
          contact: { kind: 'accent', bg: 'rgb(238, 85, 131)', color: 'rgb(20, 20, 20)' },
        }
        if (r.blocks.length > 2) problems.push(`${r.blocks.length} bloques invertidos (máx. 2)`)
        for (let i = 1; i < r.blocks.length; i++) {
          if (r.blocks[i].index - r.blocks[i - 1].index === 1) problems.push(`bloques consecutivos: ${r.blocks[i - 1].id} y ${r.blocks[i].id}`)
        }
        for (const [id, w] of Object.entries(want)) {
          const b = r.blocks.find((x) => x.id === id)
          if (!b) problems.push(`#${id} sin data-block`)
          else if (b.kind !== w.kind || b.bg !== w.bg || b.color !== w.color) problems.push(`#${id} ${b.kind} ${b.bg} / ${b.color}`)
        }
        if (!r.blocks.find((x) => x.id === 'projects')?.inverted) problems.push('Projects sin la clase .inverted (foco en carbon)')
        report('blocks', `${lang} ${width}`, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `${r.blocks.map((b) => `${b.id}(${b.kind})`).join(' · ')}; no consecutivos`)
      })
    }
  }
}
checks.inverted = checks.blocks // nombre de la 002 (alias)

// REQ-9/11/12 / AC-8, AC-10: Lab plegable en filas [LAB 0n] (ya no módulos); con la imagen en la fila
// (< 48 rem o sin hover) el duotono vuelve a color con hover y foco; con vista previa (data-preview) la
// imagen en fila se oculta y la miniatura aparece. El detalle de la miniatura lo mide el check `preview`.
checks.lab = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width, name: `lab-${width}-${lang}-closed` }, async (page) => {
        const label = `${lang} ${width}`
        const problems = []
        const before = await page.eval(() => {
          const b = document.querySelector('#lab button[aria-expanded]')
          const r = b?.getBoundingClientRect()
          return { exists: !!b, expanded: b?.getAttribute('aria-expanded'), h: r ? Math.round(r.height) : 0, panelHidden: document.querySelector('#lab-panel')?.hidden }
        })
        if (!before.exists) return report('lab', label, 'fail', 'no hay botón plegable')
        if (before.expanded !== 'false' || !before.panelHidden) problems.push('el Lab no empieza plegado')
        if (before.h < 47.5) problems.push(`botón de ${before.h} px (< 48)`)
        await page.eval(() => document.querySelector('#lab button[aria-expanded]').click())
        await page.settle()
        const open = await page.eval(() => {
          const rows = [...document.querySelectorAll('#lab li[data-lab-row]')]
          const panel = document.querySelector('#lab-panel')
          return {
            expanded: document.querySelector('#lab button[aria-expanded]').getAttribute('aria-expanded'),
            n: rows.length,
            bad: rows.filter((r) => { const cs = getComputedStyle(r); return cs.borderTopWidth !== '1px' || cs.borderTopStyle !== 'solid' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)' }).length,
            cards: document.querySelectorAll('#lab article.bg-carbon-2, #lab article.rounded-xl').length,
            withImage: rows.filter((r) => r.querySelector('.lab-inline')).length,
            // La vista previa solo actúa con data-preview Y contenedor ≥ 48 rem (768 px).
            preview: panel.hasAttribute('data-preview') && document.querySelector('#lab').clientWidth >= 768,
            ficha: rows.map((r) => r.querySelector('article > p')?.textContent.trim() ?? ''),
          }
        })
        if (open.expanded !== 'true') problems.push('no se despliega')
        if (open.n === 0 || open.bad || open.cards) problems.push(`${open.bad}/${open.n} filas sin filete o con fondo; ${open.cards} módulos`)
        if (open.ficha.some((f) => !/^\[.+ \d{2}\]$/.test(f))) problems.push(`fichas con formato inesperado: ${open.ficha.slice(0, 2)}`)
        let mode = open.preview ? 'vista previa' : 'imagen en fila'
        if (!open.preview) {
          const opacities = () => page.eval(() => {
            const duo = document.querySelector('#lab .lab-inline')
            const layers = [...duo.querySelectorAll('.duo-layer')].map((l) => getComputedStyle(l).opacity)
            return { layers, grain: getComputedStyle(duo.querySelector('.grain')).opacity }
          })
          const point = await page.eval(() => {
            const duo = document.querySelector('#lab .lab-inline')
            duo.scrollIntoView({ block: 'center' })
            const r = duo.getBoundingClientRect()
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
          })
          await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 })
          await new Promise((res) => setTimeout(res, 300))
          const rest = await opacities()
          if (!rest.layers.every((o) => o === '1')) problems.push(`en reposo las capas valen ${rest.layers}`)
          await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y })
          await new Promise((res) => setTimeout(res, 300))
          const hover = await opacities()
          if (!hover.layers.every((o) => o === '0')) problems.push(`con hover las capas valen ${hover.layers}`)
          if (Number(hover.grain) <= 0) problems.push('el grano desaparece con hover')
          await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 })
          await page.eval(() => document.querySelector('#lab .lab-inline').closest('li').querySelector('a').focus())
          await new Promise((res) => setTimeout(res, 300))
          const focus = await opacities()
          if (!focus.layers.every((o) => o === '0')) problems.push(`con foco las capas valen ${focus.layers}`)
        } else {
          const inline = await page.eval(() => [...document.querySelectorAll('#lab .lab-inline')].map((e) => getComputedStyle(e).display))
          if (!inline.every((d) => d === 'none')) problems.push(`con data-preview la imagen en fila sigue visible (${inline})`)
        }
        report('lab', label, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `${open.n} filas (${open.withImage} con imagen); modo ${mode}`)
        await page.shot(`lab-${width}-${lang}-open`)
      })
      // Sin hover real: el duotono en la fila es el estado permanente.
      await withPage(cdp, { path: '/{lang}', lang, width, opts: { noHover: true } }, async (page) => {
        await page.eval(() => document.querySelector('#lab button[aria-expanded]').click())
        await page.settle()
        const pt = await page.eval(() => {
          const duo = document.querySelector('#lab .lab-inline')
          duo.scrollIntoView({ block: 'center' })
          const r = duo.getBoundingClientRect()
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        })
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y })
        await new Promise((res) => setTimeout(res, 300))
        const r = await page.eval(() => ({
          layers: [...document.querySelector('#lab .lab-inline').querySelectorAll('.duo-layer')].map((l) => getComputedStyle(l).opacity),
          preview: document.querySelector('#lab-panel').hasAttribute('data-preview') && document.querySelector('#lab').clientWidth >= 768,
          hover: matchMedia('(hover: hover)').matches,
        }))
        const ok = r.layers.every((o) => o === '1') && !r.preview
        report('lab', `${lang} ${width} sin hover`, ok ? 'pass' : 'fail', `capas ${r.layers}; data-preview=${r.preview}; (hover:hover)=${r.hover}`)
      })
    }
  }
}

// REQ-3/17 / AC-3: estados del formulario (error de campo, enviando, éxito, fallo). Requiere `next dev` con
// NEXT_PUBLIC_EMAILJS_* ficticias; la petición a api.emailjs.com se intercepta con CDP (no sale nada real).
checks.contact = async ({ cdp }) => {
  const dicts = { en: (await import('../src/content/en.ts')).en, es: (await import('../src/content/es.ts')).es }
  const fields = ['name', 'email', 'subject', 'message']
  const fill = (page) =>
    page.eval((vals) => {
      for (const [id, value] of Object.entries(vals)) {
        const el = document.getElementById(`contact-${id}`)
        const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }, { name: 'Test', email: 'test@example.com', subject: 'Prueba', message: 'Mensaje de prueba' })
  for (const lang of LANGS) {
    const c = dicts[lang].contact
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
        const label = `${lang} ${width}`
        const problems = []
        let mode = 'ok'
        await page.send('Fetch.enable', { patterns: [{ urlPattern: '*api.emailjs.com*' }] })
        cdp.on((msg) => {
          if (msg.sessionId !== page.sessionId || msg.method !== 'Fetch.requestPaused') return
          const { requestId, request } = msg.params
          const headers = [
            { name: 'Access-Control-Allow-Origin', value: '*' },
            { name: 'Access-Control-Allow-Headers', value: '*' },
            { name: 'Access-Control-Allow-Methods', value: '*' },
          ]
          const reply = (code, body) =>
            page.send('Fetch.fulfillRequest', { requestId, responseCode: code, responseHeaders: headers, body: Buffer.from(body).toString('base64') }).catch(() => {})
          if (request.method === 'OPTIONS') reply(204, '')
          else setTimeout(() => (mode === 'ok' ? reply(200, 'OK') : reply(500, 'fail')), 900)
        })
        const sizes = await page.eval(() => {
          const s = document.querySelector('#contact')
          s.scrollIntoView()
          return [...s.querySelectorAll('input, textarea, button[type=submit]')].map((e) => ({ id: e.id || 'submit', h: Math.round(e.getBoundingClientRect().height) }))
        })
        for (const s of sizes) if (s.h < (s.id === 'submit' ? 47.5 : 43.5)) problems.push(`${s.id} mide ${s.h} px`)
        // 1) Envío vacío → error por campo.
        await page.eval(() => document.querySelector('#contact button[type=submit]').click())
        await new Promise((r) => setTimeout(r, 300))
        const empty = await page.eval((ids, requiredText) => ids.map((id) => {
          const el = document.getElementById(`contact-${id}`)
          const cs = getComputedStyle(el)
          const err = document.getElementById(`contact-${id}-error`)
          return { id, invalid: el.getAttribute('aria-invalid'), border: cs.borderTopWidth, color: cs.borderTopColor, bg: cs.backgroundColor, icon: !!err?.querySelector('svg'), text: err?.textContent.trim(), ok: err?.textContent.trim() === requiredText }
        }), fields, c.errors.required)
        for (const e of empty) {
          if (e.invalid !== 'true') problems.push(`${e.id} sin aria-invalid`)
          if (e.border !== '2px' || e.color !== 'rgb(20, 20, 20)' || e.bg !== 'rgb(233, 228, 216)') problems.push(`${e.id} borde ${e.border} ${e.color} fondo ${e.bg}`)
          if (!e.icon) problems.push(`${e.id} error sin icono`)
          if (!e.ok && e.id !== 'email') problems.push(`${e.id} texto «${e.text}»`)
        }
        const focus = await page.eval(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { id: a.id, style: cs.outlineStyle, w: parseFloat(cs.outlineWidth) } })
        if (focus.id !== 'contact-name' || focus.style === 'none' || focus.w < 2) problems.push(`foco en ${focus.id} (${focus.style} ${focus.w}px)`)
        await page.shot(`contact-${width}-${lang}-error`)
        if (width === 390) {
          // 2) Enviando → éxito.
          await fill(page)
          await page.eval(() => document.querySelector('#contact button[type=submit]').click())
          await new Promise((r) => setTimeout(r, 400))
          const sending = await page.eval(() => {
            const b = document.querySelector('#contact button[type=submit]')
            const st = document.querySelector('#contact [role=status]')
            return { disabled: b.disabled, spin: !!b.querySelector('.spin') || !!st?.querySelector('.spin'), text: st?.textContent.trim() ?? b.textContent.trim() }
          })
          if (!sending.disabled || !sending.spin || !sending.text.includes(c.sending)) problems.push(`enviando: disabled=${sending.disabled} spin=${sending.spin} «${sending.text}»`)
          await page.shot(`contact-${width}-${lang}-sending`)
          await new Promise((r) => setTimeout(r, 1200))
          const ok = await page.eval(() => {
            const st = document.querySelector('#contact [role=status]')
            const cs = st && getComputedStyle(st)
            return { text: st?.textContent.trim(), icon: !!st?.querySelector('svg'), border: cs?.borderTopWidth, color: cs?.borderTopColor, bg: cs?.backgroundColor }
          })
          if (ok.text !== c.success || !ok.icon || ok.border !== '2px' || ok.color !== 'rgb(20, 20, 20)' || ok.bg !== 'rgb(20, 20, 20)') problems.push(`éxito: «${ok.text}» icono=${ok.icon} borde ${ok.border} ${ok.color}`)
          await page.shot(`contact-${width}-${lang}-success`)
          // 3) Fallo (500) → alert.
          mode = 'fail'
          await fill(page)
          await page.eval(() => document.querySelector('#contact button[type=submit]').click())
          await new Promise((r) => setTimeout(r, 1800))
          const fail = await page.eval(() => {
            const a = document.querySelector('#contact [role=alert]')
            if (!a) return null
            const cs = getComputedStyle(a)
            const link = a.querySelector('a[href^="mailto:"]')
            return { text: a.textContent.trim(), icon: !!a.querySelector('svg'), border: cs.borderTopWidth, color: cs.borderTopColor, bg: cs.backgroundColor, underline: link && getComputedStyle(link).textDecorationLine, focused: document.activeElement === a, outline: cs.outlineStyle }
          })
          if (!fail) problems.push('fallo: no hay role=alert')
          else {
            if (!fail.text.includes(c.failure) || !fail.icon) problems.push(`fallo: «${fail.text.slice(0, 30)}» icono=${fail.icon}`)
            if (fail.border !== '2px' || fail.color !== 'rgb(20, 20, 20)' || fail.bg !== 'rgb(233, 228, 216)') problems.push(`fallo: borde ${fail.border} ${fail.color} fondo ${fail.bg}`)
            if (fail.underline !== 'underline') problems.push('fallo: mailto sin subrayado')
            if (!fail.focused || fail.outline === 'none') problems.push(`fallo: foco=${fail.focused} outline=${fail.outline}`)
          }
          await page.shot(`contact-${width}-${lang}-failure`)
        }
        report('contact', label, problems.length ? 'fail' : 'pass', problems.length ? problems.slice(0, 4).join('; ') : width === 390 ? 'error, enviando, éxito y fallo con icono + texto' : 'campos ≥ 44 px y errores con icono + texto')
      })
    }
  }
}

// REQ-15 / AC-13: sin JavaScript todo el contenido es legible (las entradas son mejora progresiva).
checks['js-off'] = async ({ cdp }) => {
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 390, opts: { noJs: true }, name: `page-390-${lang}-nojs` }, async (page) => {
      await new Promise((r) => setTimeout(r, 900)) // deja terminar la animación CSS de entrada
      const r = await page.eval(() => {
        const hidden = []
        for (const el of document.querySelectorAll('main section, h1, h2, .rise')) {
          const cs = getComputedStyle(el)
          const rect = el.getBoundingClientRect()
          if (cs.opacity !== '1' || cs.visibility === 'hidden' || cs.display === 'none' || rect.height <= 0) hidden.push(`${el.tagName.toLowerCase()}#${el.id || el.className.toString().slice(0, 12)}`)
        }
        const rise = [...document.querySelectorAll('.rise')].map((e) => getComputedStyle(e).transform)
        return { hidden, rise, sections: document.querySelectorAll('main section').length, name: document.querySelector('h1')?.textContent.trim() }
      })
      const movedRise = r.rise.filter((t) => t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)')
      const ok = r.hidden.length === 0 && movedRise.length === 0 && r.sections >= 8 && r.name
      report('js-off', lang, ok ? 'pass' : 'fail', ok ? `${r.sections} secciones y titulares visibles con opacity 1` : `ocultos: ${r.hidden.slice(0, 3)}; rise ${movedRise.length}; secciones ${r.sections}`)
    })
  }
}

// REQ-14 / AC-12: con reduced-motion no queda ninguna animación de movimiento en ejecución.
checks['reduced-motion'] = async ({ cdp }) => {
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 390, opts: { reducedMotion: true }, name: `page-390-${lang}-reduced` }, async (page) => {
      await new Promise((r) => setTimeout(r, 600))
      const r = await page.eval(() => {
        const moving = document.getAnimations().filter((a) => {
          if (a.playState !== 'running') return false
          const keys = a.effect?.getKeyframes?.().flatMap((k) => Object.keys(k)) ?? []
          return keys.some((k) => ['transform', 'translate', 'rotate', 'scale'].includes(k))
        })
        const badge = document.querySelector('.badge-spin')
        return {
          moving: moving.map((a) => a.animationName ?? a.constructor.name),
          badge: badge ? getComputedStyle(badge).animationName : 'sin sello',
          marquee: getComputedStyle(document.querySelector('.marquee-track')).animationName,
        }
      })
      const ok = r.moving.length === 0 && r.badge === 'none' && r.marquee === 'none'
      report('reduced-motion', lang, ok ? 'pass' : 'fail', ok ? 'sin animaciones de movimiento; sello y marquee detenidos' : `en ejecución: ${r.moving}; sello ${r.badge}; marquee ${r.marquee}`)
    })
  }
}

// REQ-18 / AC-16: forced-colors → marcos, foco y estados visibles; capas del duotono ocultas.
checks['forced-colors'] = async ({ cdp }) => {
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 390, opts: { forcedColors: true }, name: `page-390-${lang}-forced` }, async (page) => {
      const r = await page.eval(() => {
        const frame = document.querySelector('[data-hero-frame]')
        const layers = [...document.querySelectorAll('.duo-sat, .duo-mul, .duo-lift, .duo-dots, .tex, .ornament')].filter((l) => getComputedStyle(l).display !== 'none').length
        const torn = getComputedStyle(document.querySelector('#contact'))
        const rule = document.querySelector('.rule-x, #hero [data-hero-frame] + *')
        const btn = document.querySelector('header button, header a')
        btn.focus()
        const cs = getComputedStyle(btn)
        return {
          forced: matchMedia('(forced-colors: active)').matches,
          frameBorder: getComputedStyle(frame).borderTopStyle,
          cards: [...document.querySelectorAll('#now li')].every((li) => getComputedStyle(li).borderTopStyle !== 'none'),
          layers,
          outline: cs.outlineStyle,
          outlineWidth: parseFloat(cs.outlineWidth),
          ruleHasContent: !!rule,
          tornClip: torn.clipPath,
          tornBorder: torn.borderTopStyle,
          spotlight: (() => {
            const s = document.querySelector('#projects.inverted')
            return s ? getComputedStyle(s).borderTopStyle : 'ausente'
          })(),
          // Controles rellenos de acento visibles: sin borde pierden la forma al anular el fondo
          fills: [...document.querySelectorAll('a.bg-accent, button.bg-accent')]
            .filter((el) => el.getClientRects().length > 0)
            .map((el) => ({ label: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 24), border: getComputedStyle(el).borderTopStyle })),
        }
      })
      const problems = []
      if (!r.forced) problems.push('forced-colors no se activó')
      if (r.frameBorder === 'none') problems.push('el marco del hero perdió el borde')
      if (!r.cards) problems.push('módulos sin borde')
      if (r.layers) problems.push(`${r.layers} capas de duotono, textura u ornamento visibles`)
      if (r.tornClip !== 'none' || r.tornBorder === 'none') problems.push(`borde rasgado: clip-path ${r.tornClip}, borde ${r.tornBorder}`)
      if (r.outline === 'none' || !(r.outlineWidth > 0)) problems.push(`foco sin contorno (${r.outline} ${r.outlineWidth})`)
      if (r.spotlight === 'none' || r.spotlight === 'ausente') problems.push(`Spotlight sin borde (${r.spotlight})`)
      if (!r.fills.length) problems.push('no se encontró ningún control relleno de acento')
      for (const f of r.fills) if (f.border === 'none') problems.push(`«${f.label}» sin borde`)
      report('forced-colors', lang, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `marcos con borde ${r.frameBorder}, capas ocultas, módulos con borde`)
    })
  }
}

// REQ-19 / AC-17: sin fuentes ni imágenes el texto sigue legible y cada .duo conserva marco y tamaño.
checks.blocked = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of [320, 390, 1280]) {
      let normal
      await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
        normal = await page.eval(() => [...document.querySelectorAll('#hero .duo')].map((d) => Math.round(d.getBoundingClientRect().height)))
      })
      await withPage(cdp, { path: '/{lang}', lang, width, opts: { blocked: ['*.woff2', '*/_next/image*', '*.jpg', '*.png'] }, name: `page-${width}-${lang}-blocked` }, async (page) => {
        const r = await page.eval(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth,
          heights: [...document.querySelectorAll('#hero .duo')].map((d) => Math.round(d.getBoundingClientRect().height)),
          alts: [...document.querySelectorAll('#hero .duo img')].map((i) => i.getAttribute('alt')),
          h1: document.querySelector('h1')?.getBoundingClientRect().height,
          frame: document.querySelector('[data-hero-frame]')?.clientWidth,
          nameMax: Math.max(...[...document.querySelectorAll('h1 .mask')].map((m) => { const l = m.querySelectorAll('.rise'); return l[l.length - 1].getBoundingClientRect().right - l[0].getBoundingClientRect().left })),
        }))
        const problems = []
        if (r.scrollWidth > r.innerWidth) problems.push(`desborde ${r.scrollWidth} > ${r.innerWidth}`)
        if (JSON.stringify(r.heights) !== JSON.stringify(normal)) problems.push(`alto del .duo ${r.heights} ≠ ${normal}`)
        if (!r.alts.every((a) => a)) problems.push('imagen sin alt')
        if (r.nameMax > r.frame) problems.push(`nombre ${Math.round(r.nameMax)} > marco ${r.frame}`)
        report('blocked', `${lang} ${width}`, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `sin desborde; .duo conserva ${r.heights} px y alt`)
      })
    }
  }
}

// NF-1 / AC-21: CLS ≤ 0,1 en carga (móvil y escritorio).
checks.cls = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of [390, 1280]) {
      await withPage(cdp, { path: '/{lang}', lang, width, opts: { noCache: true } }, async (page) => {
        const cls = await page.eval(() => new Promise((resolve) => {
          let total = 0
          const sources = []
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              if (e.hadRecentInput) continue
              total += e.value
              for (const src of e.sources) sources.push(`${src.node?.nodeName?.toLowerCase()}.${String(src.node?.className ?? '').slice(0, 24)} ${Math.round(src.previousRect.y)}→${Math.round(src.currentRect.y)} (${e.value.toFixed(3)})`)
            }
          }).observe({ type: 'layout-shift', buffered: true })
          setTimeout(() => resolve({ total, sources }), 1500)
        }))
        report('cls', `${lang} ${width}`, cls.total <= 0.1 ? 'pass' : 'fail', `CLS ${cls.total.toFixed(4)} (≤ 0,1)${cls.total > 0.1 ? ' · ' + cls.sources.slice(0, 4).join(' | ') : ''}`)
      })
    }
  }
}

// REQ-5/6 / AC-4: las tres fuentes cargan, «ñ» y acentos están en la página, cuerpo ≥ 16 px y nada < 12 px.
checks.fonts = async ({ cdp }) => {
  await checks['font-sizes']({ cdp })
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 390 }, async (page) => {
      const r = await page.eval(() => {
        const loaded = (family) => [...document.fonts].some((f) => f.family.includes(family) && f.status === 'loaded')
        const body = getComputedStyle(document.body).fontFamily
        const h1 = getComputedStyle(document.querySelector('h1')).fontFamily
        return {
          anton: loaded('Anton'),
          work: loaded('Work Sans'),
          mono: loaded('IBM Plex Mono'),
          h1: h1.slice(0, 30),
          body: body.slice(0, 30),
          text: document.body.innerText,
        }
      })
      const problems = []
      for (const [k, v] of Object.entries({ Anton: r.anton, 'Work Sans': r.work, 'IBM Plex Mono': r.mono })) if (!v) problems.push(`${k} no cargó`)
      if (lang === 'es' && !/[ñáéíóú]/i.test(r.text)) problems.push('sin ñ ni acentos en el texto')
      report('fonts', lang, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `Anton, Work Sans y IBM Plex Mono cargadas; h1 «${r.h1}»`)
    })
  }
}

// Páginas completas y menú móvil abierto, para el criterio de terminado visual (solo con --shots).
checks.pages = async ({ cdp }) => {
  if (!SHOTS) return report('pages', '-', 'info', 'sin --shots no se guardan capturas')
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width, name: `page-${width}-${lang}-normal` }, async () => {})
      if (width < 1280) {
        await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
          await page.eval(() => document.querySelector('header button[aria-controls]').click())
          await new Promise((r) => setTimeout(r, 200))
          await page.shot(`menu-${width}-${lang}-open`)
        })
      }
    }
  }
  await withPage(cdp, { path: '/zz-no-existe', lang: '', width: 390, name: '404-390-en-normal' }, async () => {}).catch(() => {})
  report('pages', 'capturas', 'info', `guardadas en docs/specs/${SPEC}/screens/`)
}

// ───────────── Spec 003: carácter propio ─────────────

/** Utilidades que se instalan en la página (window.__vc) para los checks de geometría. */
function installHelpers() {
  const overlap = (a, b, tol = 0.5) => a.left < b.right - tol && a.right > b.left + tol && a.top < b.bottom - tol && a.bottom > b.top + tol
  // Rectángulos de línea de todo el texto visible bajo `root` (se omite el sello: su relleno es opaco).
  const textRects = (root) => {
    const out = []
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue
      const el = n.parentElement
      if (!el || el.closest('[data-badge], .sr-only') || !el.checkVisibility()) continue
      const range = document.createRange()
      range.selectNodeContents(n)
      for (const raw of range.getClientRects()) {
        if (!(raw.width > 0 && raw.height > 0)) continue
        // Lo que un ancestro con overflow recorta no se ve: Anton mide 1,5 em de área de contenido y la .mask lo corta.
        let r = { left: raw.left, right: raw.right, top: raw.top, bottom: raw.bottom }
        for (let a = el; a && a !== document.body && r; a = a.parentElement) {
          const cs = getComputedStyle(a)
          if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
          const b = a.getBoundingClientRect()
          r = { left: Math.max(r.left, b.left), right: Math.min(r.right, b.right), top: Math.max(r.top, b.top), bottom: Math.min(r.bottom, b.bottom) }
          if (r.left >= r.right || r.top >= r.bottom) r = null
        }
        if (r) out.push({ ...r, text: n.textContent.trim().slice(0, 18) })
      }
    }
    return out
  }
  const angle = (el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform)
    return Math.atan2(m.b, m.a) * (180 / Math.PI)
  }
  window.__vc = { overlap, textRects, angle }
}

/** Tab hasta que `test()` (evaluada en la página) sea verdadera; devuelve si se llegó. */
async function tabUntil(page, test, max = 60) {
  const key = (type) => page.send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 })
  for (let i = 0; i < max; i++) {
    await key('rawKeyDown')
    await key('keyUp')
    if (await page.eval(test)) return true
  }
  return false
}

// REQ-18 / AC-17: con el movimiento apagado, en el primer viewport móvil caben el titular, el cargo, el CTA y la
// pegatina (y el scroll sigue en 0). A 320×568 solo se exigen titular, cargo y pegatina.
checks['first-viewport'] = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const [width, height] of [[390, 844], [320, 568]]) {
      await withPage(cdp, { path: '/{lang}', lang, width, height, opts: { reducedMotion: true }, name: `first-viewport-${width}-${lang}-normal` }, async (page) => {
        const r = await page.eval(() => {
          const bottom = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().bottom) : null }
          return {
            scrollY, innerHeight,
            h1: bottom('#hero h1'), title: bottom('#hero p.text-accent'), cta: bottom('#hero a[href="#projects"]'), sticker: bottom('#hero a[href="#contact"]'),
          }
        })
        const required = width === 320 ? ['h1', 'title', 'sticker'] : ['h1', 'title', 'cta', 'sticker']
        const problems = []
        if (r.scrollY !== 0) problems.push(`scrollY=${r.scrollY}`)
        for (const k of required) {
          if (r[k] === null) problems.push(`falta ${k}`)
          else if (r[k] > height) problems.push(`${k} termina en ${r[k]} > ${height}`)
        }
        const detail = required.map((k) => `${k} ${r[k]}`).join(' · ')
        report('first-viewport', `${lang} ${width}×${height}`, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `${detail} (≤ ${height})${width === 320 ? '' : `; holgura ${height - Math.max(...required.map((k) => r[k]))} px`}`)
      })
    }
  }
}

// REQ-8/14 / AC-7, AC-12: la pegatina es un enlace a #contact, gira ≤ 8° en reposo y ≤ 16° con hover o foco,
// solo anima transform y no pisa el titular, el saludo, el CTA ni la foto.
checks.sticker = async ({ cdp }) => {
  const dicts = { en: (await import('../src/content/en.ts')).en, es: (await import('../src/content/es.ts')).es }
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
        await page.eval(installHelpers)
        const label = `${lang} ${width}`
        const r = await page.eval(() => {
          const a = document.querySelector('#hero a[href="#contact"]')
          if (!a) return { missing: true }
          const cs = getComputedStyle(a)
          const rect = a.getBoundingClientRect()
          const other = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null }
          const greeting = document.querySelector('#hero [data-hero-frame] p')
          const range = document.createRange()
          range.selectNodeContents(greeting)
          const boxes = { 'h1': other('#hero h1'), 'saludo': range.getBoundingClientRect(), 'CTA': other('#hero a[href="#projects"]'), 'foto': other('#hero .duo') }
          const hits = Object.entries(boxes).filter(([, b]) => b && __vc.overlap(rect, b)).map(([k]) => k)
          return {
            text: a.textContent.trim(), ariaHidden: a.closest('[aria-hidden="true"]') !== null, angle: __vc.angle(a),
            property: cs.transitionProperty, h: Math.round(rect.height), hits, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
            hover: matchMedia('(hover: hover)').matches,
          }
        })
        if (r.missing) return report('sticker', label, 'fail', 'no hay #hero a[href="#contact"]')
        const problems = []
        if (r.text !== dicts[lang].sticker.label) problems.push(`texto «${r.text}»`)
        if (r.ariaHidden) problems.push('la pegatina está en aria-hidden')
        if (r.h < 44) problems.push(`alto ${r.h} px`)
        if (Math.abs(r.angle) > 8) problems.push(`gira ${r.angle.toFixed(1)}° en reposo (> 8°)`)
        if (r.property !== 'transform') problems.push(`transition-property «${r.property}»`)
        if (r.hits.length) problems.push(`solapa ${r.hits.join(', ')}`)
        let hoverAngle = null
        if (r.hover) {
          await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x, y: r.y })
          await new Promise((res) => setTimeout(res, 350))
          hoverAngle = await page.eval(() => __vc.angle(document.querySelector('#hero a[href="#contact"]')))
          if (Math.abs(hoverAngle) > 16) problems.push(`con hover gira ${hoverAngle.toFixed(1)}° (> 16°)`)
          if (Math.abs(hoverAngle - r.angle) > 8) problems.push(`el giro extra con hover es ${(hoverAngle - r.angle).toFixed(1)}° (> 8°)`)
          await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 })
        }
        const reached = await tabUntil(page, () => document.activeElement?.matches('#hero a[href="#contact"]'))
        let focusAngle = null
        if (!reached) problems.push('la pegatina no es alcanzable con Tab')
        else {
          await new Promise((res) => setTimeout(res, 350))
          const f = await page.eval(() => {
            const a = document.activeElement
            const cs = getComputedStyle(a)
            return { angle: __vc.angle(a), outline: parseFloat(cs.outlineWidth), style: cs.outlineStyle, color: cs.outlineColor }
          })
          focusAngle = f.angle
          if (Math.abs(f.angle) > 16) problems.push(`con foco gira ${f.angle.toFixed(1)}° (> 16°)`)
          if (f.style === 'none' || f.outline < 2) problems.push(`foco sin contorno (${f.style} ${f.outline}px)`)
        }
        report('sticker', label, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `${r.h} px alto · reposo ${r.angle.toFixed(1)}° · hover ${hoverAngle === null ? 'n/a' : hoverAngle.toFixed(1) + '°'} · foco ${focusAngle === null ? 'n/a' : focusAngle.toFixed(1) + '°'} · sin solapes`)
      })
      // reduced-motion: no hay transición ni giro extra.
      await withPage(cdp, { path: '/{lang}', lang, width, opts: { reducedMotion: true } }, async (page) => {
        await page.eval(installHelpers)
        const r = await page.eval(() => {
          const a = document.querySelector('#hero a[href="#contact"]')
          const rect = a.getBoundingClientRect()
          return { property: getComputedStyle(a).transitionProperty, angle: __vc.angle(a), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        })
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x, y: r.y })
        await new Promise((res) => setTimeout(res, 200))
        const hovered = await page.eval(() => __vc.angle(document.querySelector('#hero a[href="#contact"]')))
        const ok = r.property === 'none' && Math.abs(hovered - r.angle) < 0.5
        report('sticker', `${lang} ${width} rm`, ok ? 'pass' : 'fail', `transition «${r.property}»; reposo ${r.angle.toFixed(1)}° → hover ${hovered.toFixed(1)}°`)
      })
    }
  }
}

// REQ-7/15 / AC-7, AC-14: ornamentos SVG decorativos (aria-hidden, sin texto ni ráster, sin eventos de puntero,
// ≤ 40 px de recorrido por parallax) y ninguno pisa texto ni controles.
checks.ornaments = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
        await page.eval(installHelpers)
        const r = await page.eval(() => {
          const svgs = [...document.querySelectorAll('svg.ornament')].filter((s) => s.checkVisibility())
          const wrappers = [...document.querySelectorAll('.parallax')].filter((w) => w.checkVisibility())
          const problems = []
          const controls = [...document.querySelectorAll('main a[href], main button, main input, main textarea')].filter((c) => c.checkVisibility())
          for (const svg of svgs) {
            const name = `${svg.closest('section')?.id ?? '?'}:${svg.getAttribute('viewBox')}`
            if (svg.getAttribute('aria-hidden') !== 'true' && !svg.closest('[aria-hidden="true"]')) problems.push(`${name} sin aria-hidden`)
            if (svg.querySelector('text, image, foreignObject')) problems.push(`${name} con texto o ráster`)
            if (getComputedStyle(svg).pointerEvents !== 'none') problems.push(`${name} recibe eventos de puntero`)
            const rect = svg.getBoundingClientRect()
            const section = svg.closest('section')
            const texts = section ? __vc.textRects(section) : []
            const hit = texts.find((t) => __vc.overlap(rect, t))
            if (hit) problems.push(`${name} [${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.width)}×${Math.round(rect.height)}] pisa «${hit.text}» [${Math.round(hit.left)},${Math.round(hit.top)} ${Math.round(hit.right - hit.left)}×${Math.round(hit.bottom - hit.top)}]`)
            const ctl = controls.find((c) => !svg.contains(c) && __vc.overlap(rect, c.getBoundingClientRect()))
            if (ctl) problems.push(`${name} pisa el control «${(ctl.textContent || ctl.id || ctl.tagName).trim().slice(0, 16)}»`)
          }
          for (const w of wrappers) {
            if (getComputedStyle(w).pointerEvents !== 'none') problems.push('parallax recibe eventos de puntero')
            const d = parseFloat(getComputedStyle(w).getPropertyValue('--d-full'))
            if (!(d * 2 <= 40)) problems.push(`parallax de ${d * 2} px de recorrido (> 40)`)
          }
          return { svgs: svgs.length, wrappers: wrappers.length, rasters: document.querySelectorAll('.parallax img, .ornament img').length, problems }
        })
        if (r.rasters) r.problems.push(`${r.rasters} imágenes ráster en ornamentos`)
        if (r.svgs < 3) r.problems.push(`solo ${r.svgs} ornamentos visibles`)
        report('ornaments', `${lang} ${width}`, r.problems.length ? 'fail' : 'pass', r.problems.length ? r.problems.slice(0, 3).join(' | ') : `${r.svgs} SVG y ${r.wrappers} parallax: decorativos, sin texto ni solapes`)
      })
    }
  }
}

// REQ-5/6 / AC-5, AC-6: texturas como capas vacías, estáticas y sin eventos; ninguna queda bajo texto; el grano
// ∈ [0,20; 0,30]; con forced-colors desaparecen.
checks.textures = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
        await page.eval(installHelpers)
        const r = await page.eval(() => {
          const layers = [...document.querySelectorAll('.tex, .duo-dots')]
          const problems = []
          for (const el of layers) {
            const name = `${el.className.toString().split(' ').slice(0, 2).join('.')}@${el.closest('section')?.id ?? '?'}`
            const cs = getComputedStyle(el)
            if (el.getAttribute('aria-hidden') !== 'true' && !el.closest('[aria-hidden="true"]')) problems.push(`${name} sin aria-hidden`)
            if (cs.pointerEvents !== 'none') problems.push(`${name} recibe eventos`)
            if (cs.animationName !== 'none') problems.push(`${name} animada (${cs.animationName})`)
            if (el.childNodes.length) problems.push(`${name} tiene hijos`)
            if (/gradient/.test(cs.backgroundImage)) problems.push(`${name} usa degradado`)
            if (!el.checkVisibility()) continue
            const rect = el.getBoundingClientRect()
            const scope = el.closest('section') ?? document.body
            const hit = __vc.textRects(scope).find((t) => __vc.overlap(rect, t))
            if (hit) problems.push(`${name} bajo el texto «${hit.text}»`)
          }
          const grains = [...document.querySelectorAll('.grain')].map((g) => parseFloat(getComputedStyle(g).opacity))
          for (const o of grains) if (o < 0.2 - 1e-9 || o > 0.3 + 1e-9) problems.push(`grano ${o}`)
          return { layers: layers.length, visible: layers.filter((l) => l.checkVisibility()).length, grains: grains.length, grain: grains[0], problems }
        })
        if (r.visible < 1) r.problems.push('no hay ninguna capa de textura visible')
        if (r.grains < 1) r.problems.push('no hay capa de grano')
        report('textures', `${lang} ${width}`, r.problems.length ? 'fail' : 'pass', r.problems.length ? r.problems.slice(0, 3).join(' | ') : `${r.visible}/${r.layers} capas visibles, vacías y sin texto debajo; grano ${r.grain} (${r.grains} capas)`)
      })
    }
    // forced-colors: todas fuera.
    await withPage(cdp, { path: '/{lang}', lang, width: 1280, opts: { forcedColors: true } }, async (page) => {
      const shown = await page.eval(() => [...document.querySelectorAll('.tex, .duo-dots, .ornament')].filter((e) => getComputedStyle(e).display !== 'none').length)
      report('textures', `${lang} forced-colors`, shown === 0 ? 'pass' : 'fail', shown === 0 ? 'texturas y ornamentos ocultos' : `${shown} siguen visibles`)
    })
  }
}

// REQ-13 / AC-12: letras escalonadas ≤ 40 ms entre sí y ≤ 500 ms en total; el h1 es una sola cadena para lectores.
checks.letters = async ({ cdp }) => {
  const { facts } = await import('../src/content/facts.ts')
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 390 }, async (page) => {
      const r = await page.eval(() => {
        const letters = [...document.querySelectorAll('#hero h1 .rise')]
        const delays = letters.map((l) => parseFloat(getComputedStyle(l).animationDelay) * 1000)
        const dur = letters.map((l) => parseFloat(getComputedStyle(l).animationDuration) * 1000)
        return { n: letters.length, delays, dur }
      })
      const { nodes } = await page.send('Accessibility.getFullAXTree')
      const h1 = nodes.find((n) => !n.ignored && n.role?.value === 'heading' && n.properties?.some((p) => p.name === 'level' && p.value.value === 1))
      const problems = []
      const steps = r.delays.slice(1).map((d, i) => d - r.delays[i])
      if (steps.some((s) => s > 40 + 0.01 || s < 0)) problems.push(`paso entre letras ${Math.max(...steps)} ms (> 40)`)
      const total = Math.max(...r.delays.map((d, i) => d + r.dur[i]))
      if (total > 500) problems.push(`escalonado de ${Math.round(total)} ms (> 500)`)
      if (r.n !== facts.profile.name.replace(/\s/g, '').length) problems.push(`${r.n} letras`)
      // Chrome aplica text-transform: uppercase al nombre accesible; el contenido es el mismo.
      if (h1?.name?.value?.toLowerCase() !== facts.profile.name.toLowerCase()) problems.push(`nombre accesible «${h1?.name?.value}»`)
      report('letters', lang, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `${r.n} letras · paso ${Math.max(...steps)} ms · total ${Math.round(total)} ms · h1 accesible «${h1.name.value}» (1 cadena)`)
    })
  }
}

// REQ-12/17 / AC-11, AC-16: las cifras llevan su valor final en el HTML (también sin JS); cuentan una sola vez al
// entrar en vista hacia el valor de facts.ts; con reduced-motion no cuentan; el ancho no cambia (sin CLS).
checks.counters = async ({ cdp }) => {
  const { facts } = await import('../src/content/facts.ts')
  const values = facts.experience.flatMap((e) => e.metrics.map((m) => m.value))
  const countable = values.filter((v) => /^\d+$/.test(v))
  for (const lang of LANGS) {
    // Sin JS: valor final en el DOM.
    await withPage(cdp, { path: '/{lang}', lang, width: 390, opts: { noJs: true } }, async (page) => {
      const got = await page.eval(() => [...document.querySelectorAll('#experience dd')].map((d) => d.querySelector('.sr-only')?.textContent.trim() ?? d.textContent.trim()))
      const visible = await page.eval(() => [...document.querySelectorAll('#experience dd')].map((d) => d.querySelector('[aria-hidden="true"]')?.textContent.trim()))
      const ok = JSON.stringify(got) === JSON.stringify(values) && JSON.stringify(visible) === JSON.stringify(values)
      report('counters', `${lang} sin JS`, ok ? 'pass' : 'fail', ok ? `cifras finales en el HTML: ${values.join(' · ')}` : `sr-only ${got} · visible ${visible} ≠ ${values}`)
    })
    for (const reducedMotion of [false, true]) {
      await withPage(cdp, { path: '/{lang}', lang, width: 390, opts: { reducedMotion }, name: reducedMotion ? undefined : `counters-390-${lang}-normal` }, async (page) => {
        // El observador de cambios se instala antes de que la sección entre en vista.
        await page.eval(() => {
          window.__seq = new Map()
          const spans = [...document.querySelectorAll('#experience dd [aria-hidden="true"]')]
          window.__w0 = spans.map((s) => s.parentElement.getBoundingClientRect().width)
          spans.forEach((s, i) => {
            window.__seq.set(i, [s.textContent])
            new MutationObserver(() => window.__seq.get(i).push(s.textContent)).observe(s, { childList: true, characterData: true, subtree: true })
          })
        })
        const before = await page.eval(() => [...document.querySelectorAll('#experience dd [aria-hidden="true"]')].map((s) => s.textContent.trim()))
        // Cada cifra se lleva al centro por turnos: la lista entera es más alta que el viewport.
        const visitAll = async () => {
          const n = await page.eval(() => document.querySelectorAll('#experience dd [aria-hidden="true"]').length)
          for (let i = 0; i < n; i++) {
            await page.eval((k) => document.querySelectorAll('#experience dd [aria-hidden="true"]')[k].scrollIntoView({ block: 'center' }), i)
            await new Promise((res) => setTimeout(res, 800))
          }
        }
        await visitAll()
        const r = await page.eval(() => ({
          seq: [...window.__seq.entries()].map(([, v]) => v),
          w1: [...document.querySelectorAll('#experience dd')].map((d) => d.getBoundingClientRect().width),
          w0: window.__w0,
        }))
        // Salir y volver: no vuelve a contar.
        await page.eval(() => window.scrollTo(0, 0))
        await new Promise((res) => setTimeout(res, 300))
        await visitAll()
        const again = await page.eval(() => [...window.__seq.entries()].map(([, v]) => v.length))
        const problems = []
        if (JSON.stringify(before) !== JSON.stringify(values)) problems.push(`antes de entrar en vista las cifras valen ${before} (esperado ${values})`)
        r.seq.forEach((seq, i) => {
          const final = values[i]
          // seq[0] es el valor final servido en el HTML: la cuenta empieza en la entrada siguiente.
          const nums = seq.slice(1).map((t) => Number(t))
          if (seq[seq.length - 1].trim() !== final) problems.push(`#${i} termina en «${seq[seq.length - 1]}» ≠ «${final}»`)
          if (/^\d+$/.test(final)) {
            if (reducedMotion) {
              if (seq.length !== 1) problems.push(`#${i} cuenta con reduced-motion (${seq.length} valores)`)
            } else {
              if (seq.length < 3) problems.push(`#${i} no cuenta (${seq.join('→')})`)
              if (nums.some((n, k) => k > 0 && n < nums[k - 1] && n !== Number(final))) problems.push(`#${i} no es monótona: ${seq.join('→')}`)
              if (nums.some((n) => n > Number(final))) problems.push(`#${i} sobrepasa ${final}`)
            }
          } else if (seq.length !== 1) problems.push(`#${i} («${final}») no debía animarse: ${seq.join('→')}`)
          if (Math.abs(r.w1[i] - r.w0[i]) > 0.5) problems.push(`#${i} cambia de ancho ${r.w0[i].toFixed(1)}→${r.w1[i].toFixed(1)} (CLS)`)
        })
        if (again.some((len, i) => len !== r.seq[i].length)) problems.push('vuelve a contar al reentrar en vista')
        report('counters', `${lang}${reducedMotion ? ' rm' : ''}`, problems.length ? 'fail' : 'pass', problems.length ? problems.slice(0, 3).join(' | ') : `${countable.length} cifras ${reducedMotion ? 'estáticas' : 'cuentan una vez'} hasta ${countable.join(', ')}; «${values.filter((v) => !/^\d+$/.test(v)).join(', ')}» no se anima; ancho estable`)
      })
    }
  }
}

// REQ-9 / AC-8: fichas «[EXP. 01]» (formato y número = posición real) y fichas de sección «[NN]» = índice en SECTION_IDS.
checks.fichas = async ({ cdp }) => {
  const { SECTION_IDS } = await import('../src/content/sections.ts')
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 1280, name: `fichas-1280-${lang}-normal` }, async (page) => {
      await page.eval(() => document.querySelector('#lab button[aria-expanded="false"]')?.click())
      await page.settle()
      const r = await page.eval((ids) => {
        const problems = []
        let sections = 0
        let items = 0
        for (const [i, id] of ids.entries()) {
          const sec = document.getElementById(id)
          if (!sec) { problems.push(`falta #${id}`); continue }
          const head = sec.querySelector('h2')?.previousElementSibling
          const text = head?.textContent.trim() ?? ''
          const m = /^\[(\d{2})\]/.exec(text)
          if (id === 'hero') continue
          if (!m) { problems.push(`#${id} sin ficha de sección («${text.slice(0, 12)}»)`); continue }
          sections++
          if (Number(m[1]) !== i + 1) problems.push(`#${id} dice [${m[1]}] pero es la sección ${i + 1}`)
        }
        for (const sel of ['#experience ol > li', '#projects article', '#lab li[data-lab-row]', '#achievements li', '#education li']) {
          [...document.querySelectorAll(sel)].forEach((li, idx) => {
            const p = [...li.querySelectorAll('p')].find((x) => /^\[/.test(x.textContent.trim()))
            const t = p?.textContent.trim() ?? ''
            const m = /^\[(.+) (\d{2})\]/.exec(t)
            items++
            if (!m) problems.push(`${sel} #${idx + 1} sin ficha («${t.slice(0, 14)}»)`)
            else if (Number(m[2]) !== idx + 1) problems.push(`${sel} #${idx + 1} dice ${m[2]}`)
          })
        }
        return { sections, items, problems }
      }, SECTION_IDS)
      report('fichas', lang, r.problems.length ? 'fail' : 'pass', r.problems.length ? r.problems.slice(0, 3).join(' | ') : `${r.sections} fichas de sección y ${r.items} de elemento con formato [ETIQUETA NN] y número real`)
    })
  }
}

// REQ-11 / AC-10: la miniatura del Lab sigue al cursor solo en vertical, se ancla a la fila con el foco, no cubre
// texto, y sin hover real / con reduced-motion / bajo 48 rem la imagen está en la propia fila.
checks.preview = async ({ cdp }) => {
  const openLab = async (page) => {
    await page.eval(() => document.querySelector('#lab button[aria-expanded="false"]')?.click())
    await page.settle()
    await page.eval(installHelpers)
  }
  const rowGeometry = (page) => page.eval(() => {
    const rows = [...document.querySelectorAll('#lab li[data-lab-row]')]
    const list = document.querySelector('#lab-panel ol')
    const withImg = rows.map((r, i) => ({ i, id: r.dataset.labId, img: r.querySelector('.lab-inline img')?.getAttribute('src') ?? null, r: r.getBoundingClientRect() })).filter((x) => x.img)
    const noImg = rows.map((r, i) => ({ i, r: r.getBoundingClientRect() })).filter((x) => !rows[x.i].querySelector('.lab-inline'))
    const l = list.getBoundingClientRect()
    return { withImg: withImg.map((x) => ({ id: x.id, img: x.img, top: x.r.top, bottom: x.r.bottom, left: x.r.left, right: x.r.right })), noImg: noImg.map((x) => ({ top: x.r.top, bottom: x.r.bottom })), list: { top: l.top, bottom: l.bottom, left: l.left, right: l.right } }
  })
  // next/image sirve «/_next/image?url=%2Fx.png&w=…»: la fila y la miniatura se comparan por el archivo de origen.
  const fileOf = (src) => decodeURIComponent(/url=([^&]+)/.exec(src)?.[1] ?? src)
  const previewState = (page) => page.eval(() => {
    const p = document.querySelector('#lab .lab-preview')
    const cs = getComputedStyle(p)
    const rect = p.getBoundingClientRect()
    const shown = [...p.querySelectorAll('img')].filter((i) => i.checkVisibility()).map((i) => decodeURIComponent(i.getAttribute('src') ?? i.currentSrc))
    return { display: cs.display, opacity: cs.opacity, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, shown, y: p.style.getPropertyValue('--y'), ariaHidden: p.getAttribute('aria-hidden') }
  })
  for (const lang of LANGS) {
    // Con cursor: 1280.
    await withPage(cdp, { path: '/{lang}', lang, width: 1280, height: 900 }, async (page) => {
      await openLab(page)
      const problems = []
      await page.eval(() => document.querySelector('#lab-panel').scrollIntoView({ block: 'start' }))
      await new Promise((res) => setTimeout(res, 200))
      const g = await rowGeometry(page)
      const attr = await page.eval(() => document.querySelector('#lab-panel').hasAttribute('data-preview'))
      if (!attr) return report('preview', `${lang} 1280`, 'fail', 'sin data-preview con hover real')
      const idle = await previewState(page)
      if (idle.display === 'none') problems.push('la miniatura no se muestra en la columna reservada')
      if (idle.opacity !== '0') problems.push(`en reposo opacity ${idle.opacity}`)
      if (idle.ariaHidden !== 'true') problems.push('la miniatura no es aria-hidden')
      const first = g.withImg[0]
      const second = g.withImg[1]
      const move = async (x, y) => { await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await new Promise((res) => setTimeout(res, 350)) }
      await move(first.left + 40, (first.top + first.bottom) / 2)
      const a = await previewState(page)
      if (a.opacity !== '1') problems.push(`sobre la fila 1 opacity ${a.opacity}`)
      if (a.shown.length !== 1 || !a.shown[0].includes(fileOf(first.img))) problems.push(`imagen visible ${a.shown.map((s) => s.slice(-40))} ≠ fila 1`)
      await move(second.left + 40, (second.top + second.bottom) / 2)
      const b = await previewState(page)
      if (a.top === b.top) problems.push('la miniatura no se movió en vertical')
      if (Math.abs(a.left - b.left) > 0.5) problems.push(`la miniatura se movió en horizontal ${a.left}→${b.left}`)
      if (a.shown[0] === b.shown[0]) problems.push('la imagen no cambió entre filas')
      await move(g.list.left + 40, (g.noImg[0].top + g.noImg[0].bottom) / 2)
      const none = await previewState(page)
      if (none.opacity !== '0') problems.push(`sobre una fila sin imagen opacity ${none.opacity}`)
      // Nunca cubre texto: en cualquier posición, sin solapes con el texto de la lista.
      const overlap = await page.eval(() => {
        const rect = document.querySelector('#lab .lab-preview').getBoundingClientRect()
        return __vc.textRects(document.querySelector('#lab-panel')).find((t) => __vc.overlap(rect, t))?.text ?? null
      })
      if (overlap) problems.push(`cubre el texto «${overlap}»`)
      // Foco: ancla la miniatura a la fila de su enlace.
      await move(1, 1)
      await page.eval((id) => document.querySelector(`#lab li[data-lab-id="${id}"] a`).focus(), second.id)
      await new Promise((res) => setTimeout(res, 350))
      const f = await previewState(page)
      const geo = await rowGeometry(page)
      const row = geo.withImg.find((x) => x.id === second.id)
      if (f.opacity !== '1') problems.push(`con foco opacity ${f.opacity}`)
      const clampMax = geo.list.bottom - geo.list.top - (f.bottom - f.top)
      const expected = Math.min(Math.max(0, row.top - geo.list.top), Math.max(0, clampMax))
      if (Math.abs(f.top - geo.list.top - expected) > 2) problems.push(`con foco la miniatura está en ${Math.round(f.top - geo.list.top)} px y la fila en ${Math.round(expected)}`)
      report('preview', `${lang} 1280 hover`, problems.length ? 'fail' : 'pass', problems.length ? problems.slice(0, 3).join(' | ') : `sigue al cursor solo en vertical (x fija ${Math.round(a.left)}), cambia de imagen por fila, se oculta sin imagen, no cubre texto y el foco la ancla`)
      await page.shot(`preview-1280-${lang}-hover`)
    })
    // Sin vista previa: sin hover real, reduced-motion y bajo 48 rem.
    for (const [label, width, opts] of [['sin hover', 1280, { noHover: true }], ['reduced-motion', 1280, { reducedMotion: true }], ['390', 390, {}]]) {
      await withPage(cdp, { path: '/{lang}', lang, width, opts }, async (page) => {
        await openLab(page)
        const r = await page.eval(() => {
          const p = document.querySelector('#lab .lab-preview')
          const inline = [...document.querySelectorAll('#lab .lab-inline')]
          const rows = [...document.querySelectorAll('#lab li[data-lab-row]')]
          return {
            preview: getComputedStyle(p).display,
            inline: inline.map((e) => getComputedStyle(e).display),
            rowsWithImg: rows.filter((r) => r.querySelector('.lab-inline')).length,
            noImgHaveInline: rows.filter((r) => !r.querySelector('.lab-inline') && r.querySelector('img')).length,
            wide: inline.map((e) => Math.round(e.getBoundingClientRect().width)),
          }
        })
        const problems = []
        if (r.preview !== 'none') problems.push(`la miniatura se muestra (${r.preview})`)
        if (r.inline.length !== 2 || !r.inline.every((d) => d !== 'none')) problems.push(`imagen en fila: ${r.inline}`)
        if (r.noImgHaveInline) problems.push(`${r.noImgHaveInline} filas sin imagen muestran una`)
        if (r.wide.some((w) => w > 320.5)) problems.push(`imagen en fila de ${Math.max(...r.wide)} px (> 20 rem)`)
        report('preview', `${lang} ${label}`, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `imagen en la fila (${r.wide.join('/')} px), miniatura apagada`)
      })
    }
  }
}

// REQ-15 / AC-14: parallax a 360 px — recorrido ≤ 40 px y ninguna tarea larga (> 50 ms) durante el desplazamiento.
checks.parallax = async ({ cdp }) => {
  for (const lang of LANGS) {
    await withPage(cdp, { path: '/{lang}', lang, width: 360, height: 640 }, async (page) => {
      const supported = await page.eval(() => CSS.supports('animation-timeline: view()'))
      await page.eval(() => {
        window.__long = []
        new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__long.push(Math.round(e.duration)) }).observe({ entryTypes: ['longtask'] })
        window.__travel = new Map()
      })
      const total = await page.eval(async () => {
        const wrappers = [...document.querySelectorAll('.parallax')]
        const max = document.documentElement.scrollHeight - innerHeight
        const sample = () => wrappers.forEach((w, i) => {
          const t = new DOMMatrix(getComputedStyle(w).transform).m42
          const cur = window.__travel.get(i) ?? [t, t]
          window.__travel.set(i, [Math.min(cur[0], t), Math.max(cur[1], t)])
        })
        for (let y = 0; y <= max; y += 60) {
          scrollTo(0, y)
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
          sample()
        }
        return { wrappers: wrappers.length, max }
      })
      const r = await page.eval(() => ({ long: window.__long, travel: [...window.__travel.values()].map(([a, b]) => b - a) }))
      const problems = []
      if (r.long.some((d) => d > 50)) problems.push(`tareas largas durante el scroll: ${r.long.filter((d) => d > 50)} ms`)
      if (r.travel.some((t) => t > 40.5)) problems.push(`recorrido ${Math.max(...r.travel).toFixed(1)} px (> 40)`)
      const moved = r.travel.some((t) => t > 0.5)
      if (supported && !moved) problems.push('con soporte de animation-timeline el parallax no se movió')
      report('parallax', `${lang} 360`, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `${total.wrappers} parallax, recorrido máx. ${Math.max(...r.travel).toFixed(1)} px (≤ 40), ${r.long.length} tareas largas en ${total.max} px de scroll${supported ? '' : ' (sin animation-timeline: estático)'}`)
    })
  }
}

// T16 (informativo): coste de raster del papel arrugado al desplazarse por Contacto, con y sin la capa
// (traza de Chrome; el raster de CPU de headless es una cota superior de lo que ve un móvil real).
checks.raster = async ({ cdp }) => {
  for (const width of WIDTHS.filter((w) => w >= 1024)) {
    await withPage(cdp, { path: '/{lang}', lang: LANGS[0], width, height: 900 }, async (page) => {
      const trace = async (hidePaper) => {
        await page.eval((hide) => {
          for (const el of document.querySelectorAll('.tex-paper')) el.style.display = hide ? 'none' : ''
          scrollTo(0, 0)
        }, hidePaper)
        const events = []
        const off = cdp.on((msg) => {
          if (msg.method === 'Tracing.dataCollected') events.push(...msg.params.value)
        })
        const done = new Promise((resolve) => {
          const stop = cdp.on((msg) => {
            if (msg.method === 'Tracing.tracingComplete') {
              stop()
              resolve()
            }
          })
        })
        await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline,cc,gpu', transferMode: 'ReportEvents' })
        await page.eval(async () => {
          const target = document.querySelector('#contact').getBoundingClientRect().top + scrollY - 200
          for (let y = Math.max(0, target - 400); y <= target + 800; y += 40) {
            scrollTo(0, y)
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
          }
        })
        await cdp.send('Tracing.end')
        await done
        off()
        const dur = (name) => events.filter((e) => e.name === name && e.ph === 'X').map((e) => e.dur / 1000)
        const raster = dur('RasterTask')
        const paint = dur('Paint')
        const max = (a) => (a.length ? Math.max(...a) : 0)
        const sum = (a) => a.reduce((x, y) => x + y, 0)
        return { rasterMax: max(raster), rasterSum: sum(raster), rasterN: raster.length, paintMax: max(paint) }
      }
      const without = await trace(true)
      const withPaper = await trace(false)
      const f = (n) => n.toFixed(1)
      const over = withPaper.rasterMax > 16
      report('raster', `${width}`, over ? 'fail' : 'info', `con papel: RasterTask máx. ${f(withPaper.rasterMax)} ms (${withPaper.rasterN} tareas, suma ${f(withPaper.rasterSum)} ms), Paint máx. ${f(withPaper.paintMax)} ms · sin papel: máx. ${f(without.rasterMax)} ms (suma ${f(without.rasterSum)} ms) · umbral 16 ms`)
    })
  }
}

// T18 (contrato 003 §1): el filete inferior recorta el nombre; lo que se come de las versales (NAVA) ≤ 12 % de su altura.
checks.cut = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width, opts: { reducedMotion: true }, name: `cut-${width}-${lang}-normal` }, async (page) => {
        const r = await page.eval(() => {
          const h1 = document.querySelector('#hero h1')
          const cs = getComputedStyle(h1)
          const fontPx = parseFloat(cs.fontSize)
          // La línea base de la última palabra: una caja de alto 0 alineada a la base, dentro de su .mask.
          const mask = [...h1.querySelectorAll('.mask')].pop()
          const probe = document.createElement('span')
          probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'
          mask.appendChild(probe)
          const baseline = probe.getBoundingClientRect().bottom
          probe.remove()
          const canvas = document.createElement('canvas').getContext('2d')
          canvas.font = `${cs.fontWeight} ${fontPx}px ${cs.fontFamily}`
          const m = canvas.measureText('NAVA')
          const cap = m.actualBoundingBoxAscent
          // clip-path computado: «inset(0px 0px 10.8px)» → el tercer valor es el recorte inferior.
          const cut = parseFloat(getComputedStyle(h1).clipPath.split(' ')[2]) || 0
          const bottom = h1.getBoundingClientRect().bottom
          const clipLine = bottom - cut
          return { fontPx, cap, cut, eaten: Math.max(0, baseline - clipLine), baselineGap: bottom - baseline, clip: getComputedStyle(h1).clipPath }
        })
        const ratio = r.cap ? r.eaten / r.cap : 0
        report('cut', `${lang} ${width}`, ratio <= 0.12 ? 'pass' : 'fail', `clip ${r.clip}; se come ${r.eaten.toFixed(1)} px de ${r.cap.toFixed(1)} px de versal (${(ratio * 100).toFixed(1)} %, ≤ 12 %); base a ${r.baselineGap.toFixed(1)} px del borde`)
      })
    }
  }
}

const ALL_CHECKS = [
  'landmarks', 'overflow', 'font-sizes', 'console', 'contrast', 'targets', 'focus', 'blocks', 'badge', 'hero',
  'marquee', 'lab', 'js-off', 'reduced-motion', 'forced-colors', 'blocked', 'cls', 'fonts', 'pages', 'js-bytes',
  'first-viewport', 'sticker', 'ornaments', 'textures', 'letters', 'counters', 'fichas', 'preview', 'parallax', 'cut',
]

// Solo capturas: `--check=shots --scope=<selector> --name=<pantalla>` (fuerza --shots).
checks.shots = async ({ cdp }) => {
  const shotName = typeof args.name === 'string' ? args.name : 'page'
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width, name: `${shotName}-${width}-${lang === '-' ? 'es' : lang}-normal` }, async () => {
        report('shots', `${lang} ${width}`, 'info', `${shotName}-${width}-${lang}-normal.png`)
      })
    }
  }
}

// ───────────── Ejecución ─────────────
const wanted = String(args.check ?? '').split(',').filter(Boolean)
const names = wanted.includes('all') ? ALL_CHECKS : wanted
if (!names.length) {
  console.error(`Indica --check=<${Object.keys(checks).join('|')}> (o all).`)
  process.exit(2)
}
const unknown = names.filter((n) => !checks[n])
if (unknown.length) {
  console.error(`Check desconocido: ${unknown.join(', ')}`)
  process.exit(2)
}

const browser = await launchBrowser()
let crashed = false
try {
  for (const name of names) {
    try {
      await checks[name]({ cdp: browser.cdp })
    } catch (err) {
      crashed = true
      report(name, 'error', 'fail', String(err?.message ?? err))
    }
  }
} finally {
  await browser.close()
}

const failed = results.filter((r) => r.status === 'fail').length
if (AS_JSON) console.log(JSON.stringify({ results, failed }, null, 2))
else console.log(`\n${results.length} resultados · ${failed} FAIL${crashed ? ' (hubo errores del arnés)' : ''}`)
process.exit(failed ? 1 : 0)
