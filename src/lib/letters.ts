/** Titular por letras: paso y duración del escalonado (contrato 003 §6). */
export const LETTER_STEP_MS = 18
export const LETTER_DURATION_MS = 200

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
