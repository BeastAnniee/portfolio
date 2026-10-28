import Link from 'next/link'
import './globals.css'
import { fontClasses } from './fonts'
import { en } from '@/content/en.ts'
import { es } from '@/content/es.ts'

const entries = [
  { lang: 'en', href: '/en', copy: en.notFound },
  { lang: 'es', href: '/es', copy: es.notFound },
] as const

export default function NotFound() {
  return (
    <html lang="en">
      <body className={fontClasses}>
        <main className="flex min-h-screen flex-col items-center justify-center bg-bento-page px-6 py-24">
          <div className="flex max-w-md flex-col items-center justify-center rounded-[24px] bg-bento-container p-10 text-center">
            <span className="mb-4 font-display text-5xl font-extrabold text-bento-purple">404</span>
            {entries.map(({ lang, href, copy }) => (
              <div key={lang} lang={lang} className="mb-6 last:mb-0">
                <h1 className="mb-2 font-display text-2xl font-bold text-bento-black">{copy.title}</h1>
                <p className="mb-4 leading-relaxed text-bento-graphite">{copy.body}</p>
                <Link
                  href={href}
                  className="inline-flex min-h-11 items-center rounded-full bg-bento-purple px-6 py-3 text-sm font-semibold text-bento-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
                >
                  {copy.home} ({lang.toUpperCase()})
                </Link>
              </div>
            ))}
          </div>
        </main>
      </body>
    </html>
  )
}
