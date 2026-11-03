import type { Locale } from '../lib/locale.ts'

/** Páginas del sitio en orden de recorrido: Home → Trabajo → Sobre mí. */
export const PAGES = ['home', 'work', 'about'] as const
export type PageId = (typeof PAGES)[number]

/** Secciones con ancla de cada página, en orden del DOM (el Hero y las bandas no cuentan). */
export const PAGE_SECTIONS = {
  home: ['featured', 'numbers', 'stack', 'contact'],
  work: ['projects', 'now', 'lab'],
  about: ['experience', 'achievements', 'education', 'contact'],
} as const satisfies Record<PageId, readonly string[]>

export type PageSectionId<P extends PageId = PageId> = (typeof PAGE_SECTIONS)[P][number]

/** Página siguiente del recorrido (la última no tiene). */
export const NEXT_PAGE: Record<PageId, PageId | null> = {
  home: 'work',
  work: 'about',
  about: null,
}

const SEGMENT: Record<PageId, string> = { home: '', work: '/work', about: '/about' }

export function pagePath(lang: Locale, page: PageId): string {
  return `/${lang}${SEGMENT[page]}`
}

const LEGACY_PAGE: Record<string, PageId> = {
  now: 'work',
  experience: 'about',
  stack: 'home',
  achievements: 'about',
  education: 'about',
  projects: 'work',
  lab: 'work',
}

/** Destino de un ancla antigua de la landing única; `null` si no hay que moverla. */
export function legacyTarget(lang: Locale, hash: string): string | null {
  const match = /^#([a-z]+)$/.exec(hash)
  if (!match || !Object.hasOwn(LEGACY_PAGE, match[1])) return null
  return `${pagePath(lang, LEGACY_PAGE[match[1]])}${hash}`
}

/** Misma página en el otro idioma; una ruta desconocida cae en Home. */
export function switchLocalePath(current: Locale, pathname: string): string {
  const other: Locale = current === 'en' ? 'es' : 'en'
  const rest = pathname.replace(/\/+$/, '').slice(`/${current}`.length)
  const page = PAGES.find((p) => SEGMENT[p] === rest && pathname.startsWith(`/${current}`)) ?? 'home'
  return pagePath(other, page)
}
