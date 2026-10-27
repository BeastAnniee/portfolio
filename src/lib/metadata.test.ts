import test from 'node:test'
import assert from 'node:assert/strict'
import { buildMetadata } from './metadata.ts'
import { en } from '../content/en.ts'
import { es } from '../content/es.ts'

const metaEn = buildMetadata('en', en)
const metaEs = buildMetadata('es', es)

test('título y descripción distintos por idioma', () => {
  assert.notEqual(metaEn.title, metaEs.title)
  assert.notEqual(metaEn.description, metaEs.description)
  assert.equal(metaEn.title, en.meta.title)
  assert.equal(metaEs.title, es.meta.title)
})

test('metadataBase, canonical y hreflang', () => {
  for (const [locale, meta] of [['en', metaEn], ['es', metaEs]] as const) {
    assert.equal(meta.metadataBase?.href, 'https://aldair.me/')
    assert.equal(meta.alternates?.canonical, `/${locale}`)
    assert.deepEqual(meta.alternates?.languages, { en: '/en', es: '/es', 'x-default': '/en' })
  }
})

test('Open Graph por idioma con imagen existente y autoría', () => {
  assert.equal((metaEn.openGraph as { locale: string }).locale, 'en_US')
  assert.equal((metaEs.openGraph as { locale: string }).locale, 'es_MX')
  assert.deepEqual((metaEn.openGraph as { alternateLocale: string[] }).alternateLocale, ['es_MX'])
  assert.deepEqual((metaEs.openGraph as { alternateLocale: string[] }).alternateLocale, ['en_US'])
  const images = (metaEs.openGraph as { images: Array<{ url: string; alt: string }> }).images
  assert.equal(images[0].url, '/profile.jpg')
  assert.equal(images[0].alt, es.meta.imageAlt)
  assert.deepEqual(metaEn.authors, [{ name: 'Jostin Aldair Nava' }])
})
