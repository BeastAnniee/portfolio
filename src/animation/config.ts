/** Constantes de movimiento (contrato 004 §6). Sin acceso a `window` ni `document`: se prueban con el ejecutor de Node. */

/** Ancho máximo (px) de la rama móvil de `gsap.matchMedia()`; la rama completa empieza en 768. */
export const MOBILE_MAX_PX = 767

/** Salvavidas: pasado este tiempo `html[data-gsap='wait']` se retira y, si GSAP llega después, no anima. */
export const WAIT_TIMEOUT_MS = 1200

/** Espera máxima de la carga de fuentes antes de la entrada del Hero. */
export const FONTS_WAIT_MS = 600

/** Rebote de `ScrollTrigger.refresh()` ante cambios de alto de `main`. */
export const REFRESH_DEBOUNCE_MS = 200

/** Atributo de `<html>` con la bandera de navegación: un clic simple sobre un enlace interno pide telón. */
export const NAV_INTENT_ATTR = 'data-nav-intent'

/** Salvavidas de la bandera de navegación: si el clic no acaba en navegación, se retira a los 1 s. */
export const NAV_INTENT_TIMEOUT_MS = 1000

/** Evento de `window` con el que `Lab.tsx` avisa de que se abrió (sin importar GSAP). */
export const LAB_OPEN_EVENT = 'motion:lab-open'

/** Máximo de elementos por lote de revelado. */
export const MAX_BATCH = 6

/** Escalonado máximo (s) en la rama móvil. */
export const MOBILE_MAX_STAGGER = 0.06

/**
 * Respaldos por constante si la traza a 360 px muestra una tarea > 50 ms (contrato §6, «Pin descartado y respaldo»):
 * 1) `HERO_SCRUB_MOBILE = false` apaga M5 bajo 768 px; 2) si persiste, también `REVEAL_MOBILE` y `RULES_MOBILE`
 * (quedan solo M1 y M8). Es una decisión de esta constante, no de cada vista.
 */
export const HERO_SCRUB_MOBILE = true
export const REVEAL_MOBILE = true
export const RULES_MOBILE = true

/** Amplitud (px) de un desplazamiento: la mitad en móvil. */
export function amplitude(value: number, isMobile: boolean): number {
  return isMobile ? value / 2 : value
}

/** Escalonado (s): en móvil nunca supera `MOBILE_MAX_STAGGER`. */
export function stagger(value: number, isMobile: boolean): number {
  return isMobile ? Math.min(value, MOBILE_MAX_STAGGER) : value
}

/** s extra que espera el contenido de la primera pantalla (fuera de Hero y PageIntro) para entrar después del titular. */
export const FIRST_SCREEN_DELAY = 0.3

/** `true` para lo que está bajo el pliegue; lo de la primera pantalla entra con `FIRST_SCREEN_DELAY`. */
export function belowFold(top: number, viewportHeight: number): boolean {
  return top > 0.9 * viewportHeight
}
