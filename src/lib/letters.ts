/** Titular por letras: paso y duración del escalonado (contrato 004 §6, M1; lo ejecuta GSAP desde src/animation/specs.ts). */
export const LETTER_STEP_MS = 25
export const LETTER_DURATION_MS = 500

export type Letter = { char: string; index: number }

/** Divide un texto en palabras y letras; los espacios no consumen índice. */
export function splitLetters(text: string): Letter[][] {
  let index = 0
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => Array.from(word).map((char) => ({ char, index: index++ })))
}

/** Tiempo total hasta que la última de `count` letras termina de subir. */
export function riseTotalMs(count: number): number {
  return Math.max(0, count - 1) * LETTER_STEP_MS + LETTER_DURATION_MS
}
