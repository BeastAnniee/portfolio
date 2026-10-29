/** Duración de la cuenta de las cifras de Experience (contrato 003 §6). */
export const COUNT_MS = 500

/** Solo se anima un entero sin signo; relaciones («40→100 %») y marcadores no se cuentan. */
export function isCountable(value: string): boolean {
  return /^\d+$/.test(value)
}

/** Valor mostrado a los `elapsedMs` ms: ease-out cúbica de 0 a `target`. */
export function countAt(target: number, elapsedMs: number): number {
  const t = Math.min(1, Math.max(0, elapsedMs / COUNT_MS))
  const eased = 1 - Math.pow(1 - t, 3)
  return Math.min(target, Math.round(target * eased))
}
