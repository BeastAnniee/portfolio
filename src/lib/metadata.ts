import type { Metadata } from 'next'
import type { Locale } from './locale.ts'
import type { Dictionary } from '../content/types.ts'
import { facts } from '../content/facts.ts'

export const SITE_URL = 'https://aldair.me'

const OG_LOCALE: Record<Locale, string> = { en: 'en_US', es: 'es_MX' }

export function buildMetadata(locale: Locale, dict: Dictionary): Metadata {
  const other: Locale = locale === 'en' ? 'es' : 'en'
  return {
    metadataBase: new URL(SITE_URL),
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    authors: [{ name: facts.profile.name }],
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', es: '/es', 'x-default': '/en' },
    },
    openGraph: {
      type: 'website',
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${locale}`,
      locale: dict.meta.ogLocale || OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[other]],
      images: [{ url: '/profile.jpg', alt: dict.meta.imageAlt }],
    },
  }
}
