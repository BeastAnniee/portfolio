import Link from 'next/link'
import './globals.css'
import { fontClasses } from './fonts'
import { en } from '@/content/en.ts'
import { es } from '@/content/es.ts'

export const metadata = {
  title: `404 · ${en.notFound.title} / ${es.notFound.title}`,
}

const entries = [
  { lang: 'en', href: '/en', copy: en.notFound, primary: true },
  { lang: 'es', href: '/es', copy: es.notFound, primary: false },
] as const

export default function NotFound() {
  return (
    <html lang="en" className={fontClasses}>
      <body>
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-24 sm:px-6">
          <span className="mb-8 font-display text-[clamp(6rem,30vw,12rem)] leading-[0.9] text-accent">404</span>
          {entries.map(({ lang, href, copy, primary }) => (
            <div key={lang} lang={lang} className="mb-8 border-t border-line pt-6 last:mb-0">
              <h1 className="mb-2 font-display text-2xl uppercase text-bone">{copy.title}</h1>
              <p className="mb-4 max-w-[65ch] text-base text-bone">{copy.body}</p>
              <Link
                href={href}
                className={`press inline-flex h-12 items-center rounded-xl px-6 font-semibold ${
                  primary
                    ? 'bg-accent text-carbon hover:bg-bone'
                    : 'border border-line text-bone hover:bg-bone hover:text-carbon'
                }`}
              >
                {copy.home} ({lang.toUpperCase()})
              </Link>
            </div>
          ))}
        </main>
      </body>
    </html>
  )
}
