import { NAV_INTENT_ATTR, NAV_INTENT_TIMEOUT_MS } from './config.ts'

export interface ClickInfo {
  button: number
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  defaultPrevented: boolean
  anchor: { href: string; target?: string; download?: boolean } | null
  origin: string
  /** `location.pathname` de la página en la que ocurre el clic. */
  current: string
}

const trim = (path: string) => path.replace(/\/+$/, '') || '/'

/** ¿El clic es un clic simple sobre un enlace interno que cambia de ruta? Solo entonces hay telón de página. */
export function isPlainInternalClick(c: ClickInfo): boolean {
  if (c.button !== 0 || c.metaKey || c.ctrlKey || c.shiftKey || c.altKey || c.defaultPrevented) return false
  if (!c.anchor || c.anchor.download) return false
  if (c.anchor.target && c.anchor.target !== '_self') return false
  let url: URL
  try {
    url = new URL(c.anchor.href)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  if (url.origin !== c.origin) return false
  return trim(url.pathname) !== trim(c.current)
}

/**
 * Registra la bandera de navegación: un clic simple sobre un enlace interno deja `data-nav-intent` en `<html>` (que
 * sobrevive a la navegación del cliente) para que la página nueva ponga el telón. Va en captura y no cambia el clic:
 * navega Next normal, sin `preventDefault` ni esperas. El selector de idioma (recarga completa) queda fuera.
 * Si el clic no acaba en navegación, la bandera se retira sola (ver `armIntentClear`).
 */
export function armNavIntent(): () => void {
  let cancelClear: (() => void) | undefined
  const onClick = (event: MouseEvent) => {
    const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
    if (!anchor || anchor.hasAttribute('hreflang')) return
    const plain = isPlainInternalClick({
      button: event.button,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      defaultPrevented: event.defaultPrevented,
      anchor: { href: anchor.href, target: anchor.target, download: anchor.hasAttribute('download') },
      origin: window.location.origin,
      current: window.location.pathname,
    })
    if (!plain) return
    const root = document.documentElement
    root.setAttribute(NAV_INTENT_ATTR, '1')
    cancelClear?.()
    cancelClear = armIntentClear(
      root,
      (callback, ms) => window.setTimeout(callback, ms),
      (id) => window.clearTimeout(id),
    )
  }
  document.addEventListener('click', onClick, true)
  return () => {
    document.removeEventListener('click', onClick, true)
    cancelClear?.()
  }
}

/** Elemento de `<html>` que necesita la limpieza de la bandera (se inyecta en las pruebas). */
export interface IntentRoot {
  getAttribute(name: string): string | null
  removeAttribute(name: string): void
}

/**
 * Arma la limpieza de la bandera: si `data-nav-intent` sigue en `1` cuando pasa `NAV_INTENT_TIMEOUT_MS` (el clic no
 * acabó en navegación), se retira para que el siguiente montaje no ponga el telón sin que nadie lo haya pedido.
 * Devuelve la función que cancela el temporizador al desmontar.
 */
export function armIntentClear(
  root: IntentRoot,
  schedule: (callback: () => void, ms: number) => number,
  cancel: (id: number) => void,
): () => void {
  const id = schedule(() => {
    if (root.getAttribute(NAV_INTENT_ATTR) === '1') root.removeAttribute(NAV_INTENT_ATTR)
  }, NAV_INTENT_TIMEOUT_MS)
  return () => cancel(id)
}
