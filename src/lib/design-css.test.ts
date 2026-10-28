import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { contrastRatio } from './contrast.ts'

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8')
const fonts = readFileSync(join(process.cwd(), 'src/app/fonts.ts'), 'utf8')

/** Contenido del bloque `@theme { … }`. */
function themeBlock(source: string): string {
  const start = source.indexOf('@theme')
  assert.ok(start >= 0, 'globals.css no tiene @theme')
  const open = source.indexOf('{', start)
  const close = source.indexOf('}', open)
  return source.slice(open + 1, close)
}

function themeTokens(): Record<string, string> {
  const tokens: Record<string, string> = {}
  for (const m of themeBlock(css).matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) tokens[m[1]] = m[2].trim()
  return tokens
}

test('@theme define los tokens del sistema póster con los valores del contrato', () => {
  const t = themeTokens()
  assert.equal(t['color-carbon']?.toUpperCase(), '#141414')
  assert.equal(t['color-carbon-2']?.toUpperCase(), '#1D1D1D')
  assert.equal(t['color-bone']?.toUpperCase(), '#E9E4D8')
  assert.equal(t['color-accent']?.toUpperCase(), '#F29BB0')
  assert.equal(t['color-bone-2']?.toUpperCase(), '#A8A398')
  assert.equal(t['color-line']?.toUpperCase(), '#7A766D')
})

test('hay exactamente un token de acento', () => {
  const accents = Object.keys(themeTokens()).filter((k) => k.startsWith('color-accent'))
  assert.deepEqual(accents, ['color-accent'])
})

test('@theme declara los tres roles tipográficos', () => {
  const t = themeTokens()
  assert.match(t['font-display'] ?? '', /var\(--font-anton\)/)
  assert.match(t['font-body'] ?? '', /var\(--font-work-sans\)/)
  assert.match(t['font-mono'] ?? '', /var\(--font-plex-mono\)/)
})

type Pair = { fg: string; bg: string; threshold: number; documented: number; use: string }
const HEX = {
  carbon: '#141414',
  'carbon-2': '#1D1D1D',
  bone: '#E9E4D8',
  'bone-2': '#A8A398',
  line: '#7A766D',
  accent: '#F29BB0',
}
// Tabla de pares de docs/specs/002-poster-visual/design.md §2 (la fila del foco se parte en dos pares).
const TEXT_PAIRS: Pair[] = [
  { fg: 'bone', bg: 'carbon', threshold: 4.5, documented: 14.52, use: 'texto principal' },
  { fg: 'bone', bg: 'carbon-2', threshold: 4.5, documented: 13.29, use: 'texto en módulos y campos' },
  { fg: 'accent', bg: 'carbon', threshold: 4.5, documented: 8.85, use: 'h2, qualifier, enlaces, sello' },
  { fg: 'accent', bg: 'carbon-2', threshold: 4.5, documented: 8.1, use: 'enlaces e icono de error en módulos' },
  { fg: 'bone-2', bg: 'carbon', threshold: 4.5, documented: 7.33, use: 'microtexto y placeholders' },
  { fg: 'bone-2', bg: 'carbon-2', threshold: 4.5, documented: 6.71, use: 'microtexto en módulos' },
  { fg: 'carbon', bg: 'bone', threshold: 4.5, documented: 14.52, use: 'bloque invertido' },
  { fg: 'carbon', bg: 'accent', threshold: 4.5, documented: 8.85, use: 'CTA, envío, idioma activo' },
  { fg: 'line', bg: 'carbon', threshold: 3, documented: 4.07, use: 'marcos y bordes de control' },
  { fg: 'line', bg: 'carbon-2', threshold: 3, documented: 3.72, use: 'bordes en módulos y campos' },
  { fg: 'accent', bg: 'carbon', threshold: 3, documented: 8.85, use: 'indicador de foco y borde de error' },
  { fg: 'accent', bg: 'carbon-2', threshold: 3, documented: 8.1, use: 'indicador de foco y borde de error en módulos' },
]

test('todo par texto/fondo usado cumple su umbral WCAG y coincide con la razón documentada', () => {
  for (const p of TEXT_PAIRS) {
    const ratio = contrastRatio(HEX[p.fg as keyof typeof HEX], HEX[p.bg as keyof typeof HEX])
    assert.ok(ratio >= p.threshold, `${p.fg}/${p.bg} (${p.use}): ${ratio.toFixed(2)} < ${p.threshold}`)
    assert.ok(Math.abs(ratio - p.documented) <= 0.01, `${p.fg}/${p.bg}: calculado ${ratio.toFixed(2)}, documentado ${p.documented}`)
  }
})

test('los pares de la tabla usan los mismos hex que @theme', () => {
  const t = themeTokens()
  for (const [name, hex] of Object.entries(HEX)) assert.equal(t[`color-${name}`]?.toUpperCase(), hex, name)
})

test('accent sobre bone no es un par permitido (≈ 1,6:1)', () => {
  assert.ok(contrastRatio(HEX.accent, HEX.bone) < 3)
  assert.ok(!TEXT_PAIRS.some((p) => p.fg === 'accent' && p.bg === 'bone'))
})

test('contrastRatio: negro sobre blanco es 21:1 y es simétrico', () => {
  assert.equal(Math.round(contrastRatio('#000000', '#FFFFFF')), 21)
  assert.equal(contrastRatio('#141414', '#E9E4D8'), contrastRatio('#E9E4D8', '#141414'))
})

test('fonts.ts carga solo de next/font/google los tres roles del contrato', () => {
  const imports = [...fonts.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1])
  assert.deepEqual(imports, ['next/font/google'])
  for (const name of ['Anton', 'Work_Sans', 'IBM_Plex_Mono']) assert.match(fonts, new RegExp(`\\b${name}\\b`))
  assert.doesNotMatch(fonts, /Inter|Bricolage/)
  assert.match(fonts, /--font-anton/)
  assert.match(fonts, /--font-work-sans/)
  assert.match(fonts, /--font-plex-mono/)
  assert.match(fonts, /export const fontClasses/)
})

// ───────────── T4: primitivos de movimiento, imagen y accesibilidad ─────────────
const flat = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')

/** Cuerpo `{ … }` que empieza en `open` (índice de la llave de apertura). */
function matchBraces(source: string, open: number): string {
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}' && --depth === 0) return source.slice(open + 1, i)
  }
  throw new Error('llaves sin cerrar')
}

function blocks(prefix: string): string[] {
  const out: string[] = []
  let from = 0
  for (;;) {
    const at = flat.indexOf(prefix, from)
    if (at < 0) return out
    const open = flat.indexOf('{', at)
    out.push(matchBraces(flat, open))
    from = open + 1
  }
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Declaraciones de la regla cuyo selector es exactamente `selector` (fuera de @media y @keyframes). */
function rule(selector: string, source = flat): string {
  const m = new RegExp(`(?:^|[};] |\\} )${escapeRe(selector)} \\{([^}]*)\\}`).exec(source)
  assert.ok(m, `falta la regla ${selector}`)
  return m[1]
}

const reduced = blocks('@media (prefers-reduced-motion: reduce)').join(' ')
const forced = blocks('@media (forced-colors: active)').join(' ')

test('todo @keyframes anima solo transform y/o opacity', () => {
  const frames = blocks('@keyframes')
  assert.ok(frames.length > 0, 'no se encontró ningún @keyframes: el extractor está roto')
  for (const body of frames) {
    for (const m of body.matchAll(/([a-z-]+)\s*:/g)) {
      assert.ok(m[1] === 'transform' || m[1] === 'opacity', `@keyframes anima «${m[1]}»`)
    }
  }
})

test('existen las clases del catálogo de movimiento e imagen', () => {
  for (const c of [
    '.mask', '.rise', '.rule-x', '.rule-y', '.press', '.duo', '.duo-layer', '.duo-sat', '.duo-mul',
    '.duo-lift', '.duo-trigger', '.grain', '.badge-spin', '.marquee-track', '.spin',
  ]) {
    assert.match(flat, new RegExp(`${escapeRe(c)}[ ,:{.\\[]`), `falta ${c}`)
  }
})

test('prefers-reduced-motion detiene lo infinito y deja el marquee legible', () => {
  assert.match(reduced, /\.badge-spin, \.marquee-track, \.spin \{ animation: none !important;? \}/)
  assert.match(reduced, /\.rise, \.rule-x, \.rule-y \{ animation: none;? \}/)
  assert.match(reduced, /\.marquee-track \{[^}]*flex-wrap: wrap/)
  assert.match(reduced, /\.marquee-copy \{ display: none;? \}/)
  assert.match(reduced, /\.marquee-pause \{ display: none;? \}/)
  assert.match(reduced, /animation-duration: 0\.01ms/, 'se conserva el acortamiento global')
})

test('la pausa de la cinta detiene también el sello (WCAG 2.2.2) y el noscript deja la cinta legible', () => {
  assert.match(flat, /html\[data-motion-paused\] \.badge-spin,\s*html\[data-motion-paused\] \.marquee-track\s*\{\s*animation-play-state: paused/)
  const marquee = readFileSync(join(process.cwd(), 'src/components/Marquee.tsx'), 'utf8')
  assert.match(marquee, /documentElement/)
  assert.match(marquee, /data-motion-paused|motionPaused/)
  const noscript = marquee.match(/<noscript>[\s\S]*<\/noscript>/)?.[0] ?? ''
  for (const part of ['animation:none', 'flex-wrap:wrap', 'width:auto', '.marquee-copy{display:none}', '.marquee-pause{display:none}']) {
    assert.ok(noscript.includes(part), `noscript sin ${part}`)
  }
})

test('forced-colors oculta las capas del duotono y fija el foco del sistema', () => {
  assert.match(forced, /\.duo-sat, \.duo-mul, \.duo-lift \{ display: none;? \}/)
  assert.match(forced, /outline: 2px solid Highlight/)
})

test('sin transition: all, sombras ni degradados', () => {
  assert.doesNotMatch(flat, /transition:\s*all|transition-property:\s*all/)
  assert.doesNotMatch(flat, /box-shadow|drop-shadow/)
  assert.doesNotMatch(flat, /gradient\(/)
})

test('duraciones del catálogo: rise 360 ms, filetes 500 ms, press 120 ms, capas 200 ms', () => {
  const rise = rule('.rise')
  assert.match(rise, /360ms/)
  assert.match(rise, /backwards/)
  assert.match(rise, /calc\(var\(--i, 0\) \* 60ms\)/)
  for (const sel of ['.rule-x::before, .rule-x::after', '.rule-y::before, .rule-y::after']) {
    const r = rule(sel)
    assert.match(r, /500ms/, sel)
    assert.match(r, /backwards/, sel)
  }
  assert.match(rule('.press'), /transform 120ms/)
  assert.match(rule('.duo-layer'), /opacity 200ms/)
  assert.match(rule('.spin'), /900ms/)
  assert.match(rule('.badge-spin'), /24s linear infinite/)
  assert.match(rule('.marquee-track'), /var\(--dur, 45s\) linear infinite/)
})

test('el duotono mezcla en capas aisladas y el color vuelve con hover/foco', () => {
  assert.match(rule('.duo'), /isolation: isolate/)
  assert.match(rule('.duo'), /overflow: hidden/)
  assert.match(rule('.duo-sat'), /mix-blend-mode: saturation/)
  assert.match(rule('.duo-mul'), /mix-blend-mode: multiply/)
  assert.match(rule('.duo-lift'), /mix-blend-mode: lighten/)
  const grain = rule('.grain')
  assert.match(grain, /pointer-events: none/)
  assert.match(grain, /feTurbulence/)
  assert.doesNotMatch(grain, /animation/)
  assert.match(flat, /\.duo-trigger:focus-within \.duo-layer \{ opacity: 0;? \}/)
  const hover = blocks('@media (hover: hover)').join(' ')
  assert.match(hover, /\.duo-trigger:hover \.duo-layer \{ opacity: 0;? \}/)
})

test('foco global con outline de 2 px en accent, y en carbon dentro del bloque invertido', () => {
  assert.match(flat, /:focus-visible \{ outline: 2px solid var\(--color-accent\); outline-offset: 3px;? \}/)
  assert.match(flat, /\.inverted :focus-visible \{ outline-color: var\(--color-carbon\);? \}/)
})

test('respaldo de Anton (REQ-19): no depende de Impact y cubre Windows, macOS, Android y Linux', () => {
  const face = /@font-face\s*\{[^}]*font-family:\s*'Anton Fallback'[^}]*\}/.exec(css)?.[0]
  assert.ok(face, 'falta @font-face «Anton Fallback»')
  for (const name of ['Arial', 'Roboto', 'Liberation Sans', 'DejaVu Sans', 'Helvetica Neue']) {
    assert.ok(face.includes(`local('${name}')`), `el respaldo no incluye ${name}`)
  }
  assert.doesNotMatch(face, /Impact/, 'Impact no existe en Android ni Linux')
  // Las fuentes del respaldo miden ≈ 1,4× Anton en mayúsculas: sin reducir, el nombre se sale del marco.
  const adjust = Number(/size-adjust:\s*(\d+(?:\.\d+)?)%/.exec(face)?.[1])
  assert.ok(adjust >= 55 && adjust <= 70, `size-adjust ${adjust}% fuera de 55–70 %`)
})

test('--font-display no deja en la pila fuentes sin ajustar que desborden el marco', () => {
  const display = /--font-display:\s*([^;]+);/.exec(css)?.[1] ?? ''
  assert.match(display, /'Anton Fallback'/)
  assert.doesNotMatch(display, /Impact|Arial Narrow/)
})
