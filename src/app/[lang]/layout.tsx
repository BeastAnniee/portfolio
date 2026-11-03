import type { Viewport } from 'next'
import { notFound } from 'next/navigation'
import '../globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import MotionProvider from '@/components/MotionProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { fontClasses } from '../fonts'
import { LOCALES, isLocale } from '@/lib/locale.ts'
import { getDictionary } from '@/content/index.ts'
import { WAIT_SCRIPT } from '@/animation/wait-script.ts'
import { facts } from '@/content/facts.ts'

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  const dict = getDictionary(lang)
  return (
    <html lang={lang} className={fontClasses} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: WAIT_SCRIPT }} />
      </head>
      <body>
        <SpeedInsights />
        <MotionProvider>
          <div className="min-h-screen bg-carbon text-bone">
            <Header locale={lang} nav={dict.nav} brand={dict.nav.brand} cvHref={facts.cv[lang]} />
            {children}
            <Footer
              email={facts.profile.email}
              github={facts.profile.github}
              linkedin={facts.profile.linkedin}
              hero={dict.hero}
              common={dict.common}
              footer={dict.footer}
            />
          </div>
        </MotionProvider>
      </body>
    </html>
  )
}
