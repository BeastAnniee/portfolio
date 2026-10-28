import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import '../globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import MotionProvider from '@/components/MotionProvider'
import { fontClasses } from '../fonts'
import { LOCALES, isLocale } from '@/lib/locale.ts'
import { buildMetadata } from '@/lib/metadata.ts'
import { getDictionary } from '@/content/index.ts'

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return buildMetadata(lang, getDictionary(lang))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return (
    <html lang={lang} className={fontClasses}>
      <body>
        <SpeedInsights />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  )
}
