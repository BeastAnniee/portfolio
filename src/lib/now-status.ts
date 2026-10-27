export const FRESH_DAYS = 90

export type NowStatus =
  | { state: 'fresh' }
  | { state: 'stale'; reason: 'old' | 'missing' | 'invalid' | 'future' }

const DAY_MS = 86_400_000

function calendarDay(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day) / DAY_MS
}

/** Vigencia de Now a la fecha de la visita, en días naturales (≤ 90 vigente). */
export function nowStatus(updatedAt: string | undefined | null, today: Date): NowStatus {
  if (!updatedAt) return { state: 'stale', reason: 'missing' }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(updatedAt)
  if (!match) return { state: 'stale', reason: 'invalid' }
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const check = new Date(Date.UTC(y, m - 1, d))
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    return { state: 'stale', reason: 'invalid' }
  }

  const age = calendarDay(today.getFullYear(), today.getMonth() + 1, today.getDate()) - calendarDay(y, m, d)
  if (age < 0) return { state: 'stale', reason: 'future' }
  if (age > FRESH_DAYS) return { state: 'stale', reason: 'old' }
  return { state: 'fresh' }
}
