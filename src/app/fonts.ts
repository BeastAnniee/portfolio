import { Anton, Work_Sans, IBM_Plex_Mono } from 'next/font/google'

export const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-anton',
  // El respaldo de next/font (Arial ajustada) es mucho más ancho que Anton; se calibra a mano en globals.css ('Anton Fallback').
  adjustFontFallback: false,
})
export const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-work-sans',
})
export const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
})

export const fontClasses = `${anton.variable} ${workSans.variable} ${plexMono.variable} font-body antialiased`
