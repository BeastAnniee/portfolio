export const LOCALES = ['en', 'es'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** Elige idioma según Accept-Language: solo es/en, gana la mayor q, empate → el primero listado. */
export function negotiateLocale(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE

  let best: Locale = DEFAULT_LOCALE
  let bestQ = 0

  for (const part of header.split(',')) {
    const [tag, ...params] = part.split(';').map((s) => s.trim())
    const primary = tag.toLowerCase().split('-')[0]
    if (!isLocale(primary)) continue

    let q = 1
    let valid = true
    for (const param of params) {
      const match = /^q=(.*)$/i.exec(param)
      if (!match) continue
      const parsed = Number(match[1])
      if (match[1] === '' || !Number.isFinite(parsed) || parsed < 0 || parsed > 1) valid = false
      else q = parsed
    }
    if (!valid || q <= 0) continue

    if (q > bestQ) {
      best = primary
      bestQ = q
    }
  }

  return best
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'es' : 'en'
}

/** Ancla que sobrevive al cambio de idioma: solo `#` seguido de letras minúsculas. */
export function localeHash(hash: string | null | undefined): string {
  if (typeof hash !== 'string') return ''
  const match = /^#[a-z]+$/.exec(hash)
  return match?.[0] === hash ? hash : ''
}

/** Misma página en el otro idioma, conservando el ancla solo si es válida. */
export function withLocaleHash(path: string, hash: string | null | undefined): string {
  return `${path}${localeHash(hash)}`
}
