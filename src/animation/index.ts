import type { gsap as Gsap } from 'gsap'
import type { ScrollTrigger as ScrollTriggerPlugin } from 'gsap/ScrollTrigger'
import { heroScrub, heroTimeline } from './hero.ts'
import { labOpening } from './lab.ts'
import { drawRules, revealSections } from './reveal.ts'

export interface MotionContext {
  gsap: typeof Gsap
  ScrollTrigger: typeof ScrollTriggerPlugin
  /** Rama móvil (< 768 px): amplitudes a la mitad y escalonado ≤ 0,06 s. */
  isMobile: boolean
  /** s de retraso de M1/M3 (0,25 con telón de página). */
  delay: number
}

/** Punto de entrada: monta las animaciones de la página dentro del `matchMedia` de PageMotion. */
export function runMotion({ gsap, ScrollTrigger, isMobile, delay }: MotionContext): () => void {
  heroTimeline(gsap, isMobile, delay)
  heroScrub(gsap, isMobile)
  revealSections(gsap, ScrollTrigger, isMobile, delay)
  drawRules(gsap, isMobile)
  return labOpening(gsap, ScrollTrigger, isMobile)
}
