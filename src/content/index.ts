import type { Locale } from '../lib/locale.ts'
import type { Dictionary } from './types.ts'
import { en } from './en.ts'
import { es } from './es.ts'

const dictionaries: Record<Locale, Dictionary> = { en, es }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
