import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { contrastRatio } from './contrast.ts'
import { LETTER_DURATION_MS, LETTER_STEP_MS } from './letters.ts'

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
  assert.equal(t['color-accent']?.toUpperCase(), '#EE5583')
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
  accent: '#EE5583',
}
// Tabla de pares de docs/specs/003-poster-caracter/design.md §2 (la fila del foco se parte en dos pares).
const TEXT_PAIRS: Pair[] = [
  { fg: 'bone', bg: 'carbon', threshold: 4.5, documented: 14.52, use: 'texto principal' },
  { fg: 'bone', bg: 'carbon-2', threshold: 4.5, documented: 13.29, use: 'campos y botón de Contact' },
  { fg: 'bone-2', bg: 'carbon', threshold: 4.5, documented: 7.33, use: 'microtexto, fichas y placeholders' },
  { fg: 'bone-2', bg: 'carbon-2', threshold: 4.5, documented: 6.71, use: 'microtexto en campos' },
  { fg: 'accent', bg: 'carbon', threshold: 4.5, documented: 5.49, use: 'h2, cargo, enlaces, sello' },
  { fg: 'accent', bg: 'carbon-2', threshold: 4.5, documented: 5.03, use: 'enlaces e icono sobre carbon-2' },
  { fg: 'carbon', bg: 'accent', threshold: 4.5, documented: 5.49, use: 'bloque de acento, CTA, pegatina' },
  { fg: 'carbon', bg: 'bone', threshold: 4.5, documented: 14.52, use: 'bloque Projects; botón y campo en error' },
  { fg: 'line', bg: 'carbon', threshold: 3, documented: 4.07, use: 'marcos y bordes de control' },
  { fg: 'line', bg: 'carbon-2', threshold: 3, documented: 3.72, use: 'bordes en campos' },
  { fg: 'accent', bg: 'carbon', threshold: 3, documented: 5.49, use: 'indicador de foco global' },
  { fg: 'carbon', bg: 'accent', threshold: 3, documented: 5.49, use: 'foco y borde de error en el bloque de acento' },
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

test('pares prohibidos: bone/accent, accent/bone y line/accent no cumplen y no están en la tabla', () => {
  const near = (a: number, b: number) => Math.abs(a - b) <= 0.01
  assert.ok(near(contrastRatio(HEX.bone, HEX.accent), 2.64))
  assert.ok(near(contrastRatio(HEX.accent, HEX.bone), 2.64))
  assert.ok(near(contrastRatio(HEX.line, HEX.accent), 1.35))
  for (const [fg, bg] of [['bone', 'accent'], ['accent', 'bone'], ['line', 'accent']]) {
    assert.ok(contrastRatio(HEX[fg as keyof typeof HEX], HEX[bg as keyof typeof HEX]) < 3, `${fg}/${bg}`)
    assert.ok(!TEXT_PAIRS.some((p) => p.fg === fg && p.bg === bg), `${fg}/${bg} no puede estar en la tabla`)
  }
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
    '.tex', '.tex-dots-bone', '.tex-dots-carbon', '.duo-dots', '.torn-top', '.ornament',
  ]) {
    assert.match(flat, new RegExp(`${escapeRe(c)}[ ,:{.\\[]`), `falta ${c}`)
  }
})

test('prefers-reduced-motion detiene lo infinito y deja el marquee legible', () => {
  assert.match(reduced, /\.badge-spin, \.marquee-track, \.spin \{ animation: none !important;? \}/)
  assert.match(reduced, /\.rise, \.parallax, \.rule-x, \.rule-y \{ animation: none;? \}/)
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

test('forced-colors oculta duotono, punteado, texturas y ornamentos; el borde rasgado pasa a línea; foco del sistema', () => {
  assert.match(forced, /\.duo-sat, \.duo-mul, \.duo-lift, \.duo-dots, \.tex, \.ornament \{ display: none;? \}/)
  assert.match(forced, /\.torn-top \{ clip-path: none; border-top: 2px solid CanvasText;? \}/)
  assert.match(forced, /outline: 2px solid Highlight/)
})

test('texturas (contrato 003 §5): capas vacías, sin pointer-events, sin animación, sin degradados', () => {
  for (const sel of ['.tex', '.duo-dots']) {
    const r = rule(sel)
    assert.match(r, /pointer-events: none/, sel)
    assert.doesNotMatch(r, /animation/, sel)
  }
  for (const sel of ['.tex-dots-bone', '.tex-dots-carbon', '.torn-top', '.ornament']) rule(sel)
  assert.match(rule('.ornament'), /pointer-events: none/)
})

test('punteado: tile SVG de 8 px con <circle> en data-URI (sin radial-gradient) y opacidades del contrato', () => {
  for (const sel of ['.tex-dots-bone', '.tex-dots-carbon', '.duo-dots']) {
    const r = rule(sel)
    assert.match(r, /data:image\/svg\+xml/, sel)
    assert.match(r, /%3Ccircle/, sel)
    assert.match(r, /width='8' height='8'/, sel)
  }
  const opacity = (sel: string) => Number(/opacity: ([\d.]+)/.exec(rule(sel))?.[1])
  assert.equal(opacity('.duo-dots'), 0.35)
  assert.equal(opacity('.tex-dots-bone'), 0.3)
  assert.equal(opacity('.tex-dots-carbon'), 0.2)
  for (const sel of ['.duo-dots', '.tex-dots-bone', '.tex-dots-carbon']) assert.ok(opacity(sel) <= 0.35, sel)
  assert.match(rule('.tex-dots-bone'), /%23E9E4D8/i)
  assert.match(rule('.tex-dots-carbon'), /%23141414/i)
  assert.match(rule('.duo-dots'), /mix-blend-mode: multiply/)
})

test('papel arrugado (condicional, T16): filtro SVG de luz distante, multiply, ≤ 0,35, estático y sin degradados', () => {
  const r = rule('.tex-paper')
  assert.match(r, /data:image\/svg\+xml/)
  for (const part of ['feTurbulence', 'feDiffuseLighting', 'feDistantLight']) assert.ok(r.includes(part), part)
  assert.match(r, /mix-blend-mode: multiply/)
  assert.ok(Number(/opacity: ([\d.]+)/.exec(r)?.[1]) <= 0.35)
  assert.doesNotMatch(r, /animation|gradient\(/)
  // Como el resto de texturas, hereda .tex en el marcado y por eso desaparece con forced-colors.
  assert.match(forced, /\.tex[ ,]/)
})

test('grano más fuerte: opacidad entre 0,20 y 0,30 (contrato 0,26)', () => {
  const o = Number(/opacity: ([\d.]+)/.exec(rule('.grain'))?.[1])
  assert.equal(o, 0.26)
  assert.ok(o >= 0.2 && o <= 0.3)
})

test('borde rasgado: clip-path polygon() fijo del contrato §5', () => {
  const r = rule('.torn-top')
  assert.match(r, /clip-path: polygon\(/)
  assert.match(
    r,
    /polygon\(0 6px, 4% 1px, 8% 8px, 12% 3px, 16% 9px, 20% 2px, 24% 7px, 28% 0, 32% 8px, 36% 4px, 40% 10px, 44% 1px, 48% 6px, 52% 2px, 56% 9px, 60% 3px, 64% 8px, 68% 0, 72% 7px, 76% 4px, 80% 10px, 84% 2px, 88% 6px, 92% 1px, 96% 8px, 100% 3px, 100% 100%, 0 100%\)/,
  )
})

test('bloque de acento: selección carbon/bone y foco en carbon', () => {
  assert.match(flat, /\[data-block="accent"\] ::selection \{ background: var\(--color-carbon\); color: var\(--color-bone\);? \}/)
})

test('sin transition: all, sombras ni degradados', () => {
  assert.doesNotMatch(flat, /transition:\s*all|transition-property:\s*all/)
  assert.doesNotMatch(flat, /box-shadow|drop-shadow/)
  assert.doesNotMatch(flat, /gradient\(/)
})

test('duraciones del catálogo: letras 200 ms/18 ms, filetes 500 ms, press 120 ms, capas 200 ms', () => {
  const rise = rule('.rise')
  assert.ok(rise.includes(`${LETTER_DURATION_MS}ms`), rise)
  assert.match(rise, /backwards/)
  assert.ok(rise.includes(`calc(var(--i, 0) * ${LETTER_STEP_MS}ms)`), rise)
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
  assert.match(
    flat,
    /\.inverted :focus-visible, \[data-block="accent"\] :focus-visible \{ outline-color: var\(--color-carbon\);? \}/,
  )
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

// ───────────── T6: letras, pegatina, parallax y vista previa ─────────────
test('pegatina: giro -6° en reposo, -12° con hover (solo hover real) y foco; solo transform, 150 ms', () => {
  const sticker = rule('.sticker')
  assert.match(sticker, /--r: -6deg/)
  assert.match(sticker, /transform: rotate\(var\(--r\)\)/)
  assert.match(sticker, /transition: transform 150ms ease-out/)
  assert.match(blocks('@media (hover: hover)').join(' '), /\.sticker:hover \{ --r: -12deg;? \}/)
  assert.match(rule('.sticker:focus-visible'), /--r: -12deg/)
  // 6° adicionales (≤ 8°) y 12° totales (≤ 16°)
  assert.ok(12 - 6 <= 8 && 12 <= 16)
})

test('parallax: CSS scroll-driven solo con soporte, la mitad de amplitud bajo 768 px', () => {
  const base = rule('.parallax')
  assert.doesNotMatch(base, /animation/, 'sin soporte queda estático')
  assert.match(base, /--d: calc\(var\(--d-full, 0px\) \/ 2\)/)
  assert.match(blocks('@media (min-width: 768px)').join(' '), /\.parallax \{ --d: var\(--d-full, 0px\);? \}/)
  const supported = blocks('@supports (animation-timeline: view())').join(' ')
  assert.match(supported, /\.parallax \{ animation: drift linear both; animation-timeline: view\(\);? \}/)
  const outside = flat.replace(supported, '').replace('@supports (animation-timeline: view())', '')
  assert.doesNotMatch(outside, /animation-timeline/, 'animation-timeline solo dentro de @supports')
  const drift = blocks('@keyframes drift').join(' ')
  assert.match(drift, /translateY\(calc\(var\(--d\) \* -1\)\)/)
  assert.match(drift, /translateY\(var\(--d\)\)/)
})

test('nombre recortado por abajo: --cut .07em con margen negativo compensado', () => {
  const r = rule('.name-cut')
  assert.match(r, /--cut: \.07em/)
  assert.match(r, /clip-path: inset\(0 0 var\(--cut\) 0\)/)
  assert.match(r, /margin-bottom: calc\(var\(--cut\) \* -1\)/)
})

test('vista previa del Lab: transform 120 ms y opacity 150 ms; solo se muestra con data-preview en ≥ 48 rem', () => {
  const r = rule('.lab-preview')
  assert.match(r, /transition: transform 120ms ease-out, opacity 150ms ease-out/)
  assert.match(r, /display: none/)
  const wide = blocks('@container (min-width: 48rem)').join(' ')
  assert.match(wide, /\[data-preview\] \.lab-preview \{ display: block;? \}/)
  assert.match(wide, /\[data-preview\] \.lab-inline \{ display: none;? \}/)
  assert.doesNotMatch(flat.replace(wide, ''), /\[data-preview\] \.lab-inline/, 'la imagen en fila solo se oculta con data-preview')
})

test('reduced-motion: pegatina sin transición ni giro extra, vista previa fuera de juego', () => {
  assert.match(reduced, /\.sticker \{ transition: none;? \}/)
  assert.match(reduced, /\.sticker:hover, \.sticker:focus-visible \{ --r: -6deg;? \}/)
  assert.match(reduced, /\.lab-preview \{ display: none( !important)?;? \}/)
})

test('ningún transition anima propiedades distintas de transform y opacity', () => {
  for (const m of flat.matchAll(/transition: ([^;}]+)/g)) {
    for (const part of m[1].split(',')) {
      const prop = part.trim().split(' ')[0]
      assert.ok(['transform', 'opacity', 'none'].includes(prop), `transition de «${prop}»`)
    }
  }
})
