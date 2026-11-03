import type { gsap as Gsap } from 'gsap'
import { CURTAIN } from './specs.ts'

/**
 * M8: telón de entrada. Un `div` de color de acento creado por JS (sin texto, inerte, fuera del árbol de accesibilidad y
 * sin capturar eventos) que cubre la página nueva en su primer fotograma y se retira hacia abajo. Se pone a `scaleY(1)`
 * antes de pintar y se revela después del cambio de ruta: el clic no se retrasa.
 */
export function createCurtain(): HTMLDivElement {
  const el = document.createElement('div')
  el.setAttribute('aria-hidden', 'true')
  el.setAttribute('inert', '')
  el.className = 'bg-accent'
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '60',
    pointerEvents: 'none',
    transformOrigin: CURTAIN.origin,
    transform: 'scaleY(1)',
  })
  document.body.appendChild(el)
  return el
}

/** Retira el telón con `scaleY 1→0`; el primer `keydown`/`pointerdown` lo completa al instante. */
export function revealCurtain(gsap: typeof Gsap, curtain: HTMLElement): void {
  const finish = () => {
    off()
    curtain.remove()
  }
  const tween = gsap.fromTo(
    curtain,
    { ...CURTAIN.from },
    { ...CURTAIN.to, duration: CURTAIN.duration, ease: CURTAIN.ease, transformOrigin: CURTAIN.origin, onComplete: finish },
  )
  const skip = () => tween.progress(1)
  const off = () => {
    document.removeEventListener('keydown', skip, true)
    document.removeEventListener('pointerdown', skip, true)
  }
  document.addEventListener('keydown', skip, { capture: true, once: true })
  document.addEventListener('pointerdown', skip, { capture: true, once: true })
}
