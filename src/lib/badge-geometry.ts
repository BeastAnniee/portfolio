/** Geometría del sello: un glifo por carácter sobre un anillo, con paso de arco fijo (sin `textLength`). */

/** Avance del arco por glifo, en px (el avance mono de 12 px es ≈ 7,2 px: holgura de 1,8 px). */
export const BADGE_STEP = 9
/** Holgura entre el anillo de glifos y el borde del disco, en px. */
const BADGE_PADDING = 12

export interface BadgeGlyph {
  char: string
  /** Grados en sentido horario desde las 12 en punto. */
  angle: number
}

/** Radio del anillo para `n` glifos (contando los espacios). */
export function badgeRadius(n: number): number {
  return (n * BADGE_STEP) / (2 * Math.PI)
}

/** Lado de la caja cuadrada del sello. */
export function badgeBox(n: number): number {
  return 2 * (badgeRadius(n) + BADGE_PADDING)
}

/** Glifos a dibujar: los espacios ocupan posición pero no se pintan. */
export function badgeGlyphs(text: string): BadgeGlyph[] {
  const chars = Array.from(text)
  const n = chars.length
  const glyphs: BadgeGlyph[] = []
  chars.forEach((char, i) => {
    if (char !== ' ') glyphs.push({ char, angle: (i * 360) / n })
  })
  return glyphs
}
