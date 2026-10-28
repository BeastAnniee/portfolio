#!/usr/bin/env node
// Arnés de comprobación visual de la spec 002: Chrome headless por CDP, sin dependencias.
// No forma parte del gate (necesita Chrome y un servidor): es la evidencia L4 de /tc-validate.
//
// Uso:
//   node scripts/visual-check.mjs --url=http://localhost:3000 --check=landmarks,overflow
//     [--langs=en,es] [--widths=320,390,1280] [--scope=<selector>] [--shots] [--json]
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
const SHOTS_DIR = join(ROOT, 'docs', 'specs', '002-poster-visual', 'screens')

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
            inverted: !!el.closest('.inverted'),
          }
        }, SCOPE)
        if (!info) continue
        if (first === null) first = info.id
        else if (info.id === first) break
        if (info.inScope) seen.push(info)
      }
      const accent = 'rgb(242, 155, 176)'
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
          const rects = [...h1.querySelectorAll('.rise')].map((w) => ({ text: w.textContent.trim(), rect: w.getBoundingClientRect() }))
          const words = rects.map((w) => ({ text: w.text, width: w.rect.width }))
          const oneLine = rects.length > 1 && rects.every((w) => Math.abs(w.rect.top - rects[0].rect.top) < 2)
          const lineWidth = oneLine ? rects[rects.length - 1].rect.right - rects[0].rect.left : null
          const duo = document.querySelector('#hero .duo')
          const img = duo?.querySelector('img')
          const cta = document.querySelector('#hero a[href="#projects"]')?.getBoundingClientRect()
          return {
            text: h1.textContent.replace(/\s+/g, ' ').trim(),
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
        if (r.layers !== 3) problems.push(`${r.layers} capas de duotono (esperadas 3)`)
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

// REQ-4 / AC-6: Projects es el bloque invertido (bone/carbon); como máximo 2 secciones con fondo bone.
checks.inverted = async ({ cdp }) => {
  for (const lang of LANGS) {
    for (const width of WIDTHS) {
      await withPage(cdp, { path: '/{lang}', lang, width }, async (page) => {
        const r = await page.eval(() => {
          const p = document.querySelector('section#projects')
          const cs = p && getComputedStyle(p)
          const bone = [...document.querySelectorAll('section')].filter((s) => getComputedStyle(s).backgroundColor === 'rgb(233, 228, 216)').length
          return { bg: cs?.backgroundColor, color: cs?.color, bone, inverted: !!p?.classList.contains('inverted') }
        })
        const problems = []
        if (r.bg !== 'rgb(233, 228, 216)' || r.color !== 'rgb(20, 20, 20)') problems.push(`#projects ${r.bg} / ${r.color}`)
        if (r.bone > 2) problems.push(`${r.bone} secciones con fondo bone`)
        if (!r.inverted) problems.push('falta la clase .inverted (foco en carbon)')
        report('inverted', `${lang} ${width}`, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `bone/carbon; ${r.bone} sección(es) bone`)
      })
    }
  }
}

// REQ-8/9/12 / AC-7: Lab plegable, módulos carbon-2, duotono → color con hover y foco, permanente sin hover.
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
          const arts = [...document.querySelectorAll('#lab article')]
          return {
            expanded: document.querySelector('#lab button[aria-expanded]').getAttribute('aria-expanded'),
            n: arts.length,
            bad: arts.filter((a) => { const cs = getComputedStyle(a); return cs.backgroundColor !== 'rgb(29, 29, 29)' || cs.borderTopWidth !== '1px' }).length,
            withImage: arts.filter((a) => a.querySelector('.duo')).length,
          }
        })
        if (open.expanded !== 'true') problems.push('no se despliega')
        if (open.n === 0 || open.bad) problems.push(`${open.bad}/${open.n} tarjetas no son módulo carbon-2 con borde`)
        const opacities = () => page.eval(() => {
          const art = [...document.querySelectorAll('#lab article')].find((a) => a.querySelector('.duo'))
          const layers = [...art.querySelectorAll('.duo-layer')].map((l) => getComputedStyle(l).opacity)
          return { layers, grain: getComputedStyle(art.querySelector('.grain')).opacity }
        })
        const point = await page.eval(() => {
          const art = [...document.querySelectorAll('#lab article')].find((a) => a.querySelector('.duo'))
          art.scrollIntoView({ block: 'center' })
          const r = art.getBoundingClientRect()
          return { x: r.left + r.width / 2, y: r.top + 20 }
        })
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 })
        await new Promise((res) => setTimeout(res, 300))
        const rest = await opacities()
        if (!rest.layers.every((o) => o === '1')) problems.push(`en reposo las capas valen ${rest.layers}`)
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y })
        await new Promise((res) => setTimeout(res, 300))
        const hover = await opacities()
        if (width >= 320 && !hover.layers.every((o) => o === '0')) problems.push(`con hover las capas valen ${hover.layers}`)
        if (Number(hover.grain) <= 0) problems.push('el grano desaparece con hover')
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 })
        await page.eval(() => [...document.querySelectorAll('#lab article')].find((a) => a.querySelector('.duo')).querySelector('a').focus())
        await new Promise((res) => setTimeout(res, 300))
        const focus = await opacities()
        if (!focus.layers.every((o) => o === '0')) problems.push(`con foco las capas valen ${focus.layers}`)
        report('lab', label, problems.length ? 'fail' : 'pass', problems.length ? problems.join('; ') : `${open.n} módulos (${open.withImage} con duotono); hover y foco → color; grano ${hover.grain}`)
        await page.shot(`lab-${width}-${lang}-open`)
      })
      // Sin hover real: el duotono es el estado permanente.
      await withPage(cdp, { path: '/{lang}', lang, width, opts: { noHover: true } }, async (page) => {
        await page.eval(() => document.querySelector('#lab button[aria-expanded]').click())
        const pt = await page.eval(() => {
          const art = [...document.querySelectorAll('#lab article')].find((a) => a.querySelector('.duo'))
          art.scrollIntoView({ block: 'center' })
          const r = art.getBoundingClientRect()
          return { x: r.left + r.width / 2, y: r.top + 20 }
        })
        await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y })
        await new Promise((res) => setTimeout(res, 300))
        const layers = await page.eval(() => [...[...document.querySelectorAll('#lab article')].find((a) => a.querySelector('.duo')).querySelectorAll('.duo-layer')].map((l) => getComputedStyle(l).opacity))
        const mm = await page.eval(() => matchMedia('(hover: hover)').matches)
        report('lab', `${lang} ${width} sin hover`, layers.every((o) => o === '1') ? 'pass' : 'fail', `capas ${layers}; (hover:hover)=${mm}`)
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
          return { id, invalid: el.getAttribute('aria-invalid'), border: cs.borderTopWidth, color: cs.borderTopColor, icon: !!err?.querySelector('svg'), text: err?.textContent.trim(), ok: err?.textContent.trim() === requiredText }
        }), fields, c.errors.required)
        for (const e of empty) {
          if (e.invalid !== 'true') problems.push(`${e.id} sin aria-invalid`)
          if (e.border !== '2px' || e.color !== 'rgb(242, 155, 176)') problems.push(`${e.id} borde ${e.border} ${e.color}`)
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
            return { text: st?.textContent.trim(), icon: !!st?.querySelector('svg'), border: cs?.borderTopWidth, color: cs?.borderTopColor }
          })
          if (ok.text !== c.success || !ok.icon || ok.border !== '1px' || ok.color !== 'rgb(233, 228, 216)') problems.push(`éxito: «${ok.text}» icono=${ok.icon} borde ${ok.border} ${ok.color}`)
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
            return { text: a.textContent.trim(), icon: !!a.querySelector('svg'), border: cs.borderTopWidth, color: cs.borderTopColor, underline: link && getComputedStyle(link).textDecorationLine, focused: document.activeElement === a, outline: cs.outlineStyle }
          })
          if (!fail) problems.push('fallo: no hay role=alert')
          else {
            if (!fail.text.includes(c.failure) || !fail.icon) problems.push(`fallo: «${fail.text.slice(0, 30)}» icono=${fail.icon}`)
            if (fail.border !== '2px' || fail.color !== 'rgb(242, 155, 176)') problems.push(`fallo: borde ${fail.border} ${fail.color}`)
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
        const layers = [...document.querySelectorAll('.duo-sat, .duo-mul, .duo-lift')].filter((l) => getComputedStyle(l).display !== 'none').length
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
      if (r.layers) problems.push(`${r.layers} capas de duotono visibles`)
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
          nameMax: Math.max(...[...document.querySelectorAll('h1 .rise')].map((w) => w.getBoundingClientRect().width)),
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
  report('pages', 'capturas', 'info', 'guardadas en docs/specs/002-poster-visual/screens/')
}

const ALL_CHECKS = [
  'landmarks', 'overflow', 'font-sizes', 'console', 'contrast', 'targets', 'focus', 'inverted', 'badge', 'hero',
  'marquee', 'lab', 'js-off', 'reduced-motion', 'forced-colors', 'blocked', 'cls', 'fonts', 'pages', 'js-bytes',
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
