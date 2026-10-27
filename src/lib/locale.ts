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

/** Ruta de la misma página en el otro idioma; solo se conserva un ancla del tipo #seccion. */
export function switchLocaleHref(current: Locale, hash: string): string {
  const anchor = /^#[a-z-]+$/.test(hash) ? hash : ''
  return `/${otherLocale(current)}${anchor}`
}
