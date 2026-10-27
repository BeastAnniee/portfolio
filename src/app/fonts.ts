import { Inter, Bricolage_Grotesque } from 'next/font/google'

export const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-bricolage',
})

export const fontClasses = `${inter.variable} ${bricolage.variable} font-body antialiased`
