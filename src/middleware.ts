import { NextResponse, type NextRequest } from 'next/server'
import { negotiateLocale } from '@/lib/locale.ts'

/** Solo decide el idioma de `/`: redirección temporal según Accept-Language. */
export function middleware(request: NextRequest) {
  const locale = negotiateLocale(request.headers.get('accept-language'))
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}`
  const response = NextResponse.redirect(url, 307)
  response.headers.set('Vary', 'Accept-Language')
  return response
}

export const config = { matcher: ['/'] }
