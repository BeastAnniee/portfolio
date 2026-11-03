import type { gsap as Gsap } from 'gsap'
import type { ScrollTrigger as ScrollTriggerPlugin } from 'gsap/ScrollTrigger'
import { LAB_OPEN_EVENT, amplitude, stagger } from './config.ts'
import { LAB_OPEN, clearPropsOf } from './specs.ts'

/**
 * M7: al abrir el Lab (`Lab.tsx` avisa con un evento de `window`, sin importar GSAP) sus filas entran con
 * `opacity` y `y`; cerrar es instantáneo. Tras abrir cambia el alto de la página: `ScrollTrigger.refresh()`.
 * Devuelve la función que quita el listener.
 */
export function labOpening(gsap: typeof Gsap, ScrollTrigger: typeof ScrollTriggerPlugin, isMobile: boolean): () => void {
  const onOpen = () => {
    const rows = document.querySelectorAll(LAB_OPEN.target)
    if (rows.length) {
      gsap.fromTo(
        rows,
        { ...LAB_OPEN.from, y: amplitude(LAB_OPEN.from.y, isMobile) },
        {
          ...LAB_OPEN.to,
          duration: LAB_OPEN.duration,
          ease: LAB_OPEN.ease,
          stagger: stagger(LAB_OPEN.stagger, isMobile),
          clearProps: clearPropsOf(LAB_OPEN.to),
        },
      )
    }
    ScrollTrigger.refresh()
  }
  window.addEventListener(LAB_OPEN_EVENT, onOpen)
  return () => window.removeEventListener(LAB_OPEN_EVENT, onOpen)
}
