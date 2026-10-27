import type { Locale } from '../lib/locale.ts'
import type { Dictionary } from './types.ts'
import { en } from './en.ts'
import { es } from './es.ts'

export const SECTION_IDS = [
  'hero',
  'now',
  'experience',
  'projects',
  'stack',
  'achievements',
  'education',
  'lab',
  'contact',
] as const

const dictionaries: Record<Locale, Dictionary> = { en, es }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
