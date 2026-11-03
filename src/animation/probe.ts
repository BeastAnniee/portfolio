import type { gsap as Gsap } from 'gsap'
import type { ScrollTrigger as ScrollTriggerPlugin } from 'gsap/ScrollTrigger'

/**
 * Sonda de pruebas en `<html>`: nº de ScrollTrigger vivos y de hijos de `gsap.globalTimeline`. La lee el arnés
 * (AC-19) para comprobar que al navegar no quedan triggers ni timelines huérfanos, sin exponer globales.
 */
export function writeProbe(gsap: typeof Gsap, ScrollTrigger: typeof ScrollTriggerPlugin): void {
  document.documentElement.dataset.motionSt = String(ScrollTrigger.getAll().length)
  document.documentElement.dataset.motionTw = String(gsap.globalTimeline.getChildren(false, true, true).length)
}
