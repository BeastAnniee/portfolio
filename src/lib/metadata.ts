import type { Metadata } from 'next'
import type { Locale } from './locale.ts'
import type { Dictionary } from '../content/types.ts'
import { pagePath } from '../content/pages.ts'
import type { PageId } from '../content/pages.ts'
import { facts } from '../content/facts.ts'

export const SITE_URL = 'https://aldair.me'

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', es: 'es_MX' }

export function buildMetadata(locale: Locale, dict: Dictionary, page: PageId = 'home'): Metadata {
  const other: Locale = locale === 'en' ? 'es' : 'en'
  const copy = page === 'home' ? null : dict.pages[page]
  const title = copy ? `${copy.title} | ${dict.meta.title}` : dict.meta.title
  const description = copy ? `${copy.intro} ${dict.meta.description}` : dict.meta.description
  const url = pagePath(locale, page)
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords: dict.meta.keywords,
    authors: [{ name: facts.profile.name }],
    alternates: {
      canonical: url,
      languages: { en: pagePath('en', page), es: pagePath('es', page), 'x-default': pagePath('en', page) },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      locale: dict.meta.ogLocale || OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[other]],
      images: [{ url: '/profile.jpg', alt: dict.meta.imageAlt }],
    },
  }
}
