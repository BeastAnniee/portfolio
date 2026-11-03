import { LETTER_DURATION_MS, LETTER_STEP_MS } from '../lib/letters.ts'
import { amplitude, stagger } from './config.ts'

/** Las animaciones son datos: selectores, propiedades, tiempos. Un ejecutor delgado los pasa a GSAP (contrato 004 §6). */
export type Props = Record<string, number | string>

export interface Step {
  id: string
  target: string
  from: Props
  to: Props
  /** s */
  duration: number
  ease: string
  /** s entre elementos (si hay varios) */
  stagger?: number
  /** s de arranque en el timeline */
  at: number
  /** Máximo de elementos que se esperan (para el presupuesto de tiempo) */
  targets: number
}

/** Solo composición: transform, opacity y la variable `--p` de los filetes. Nada de layout, filter ni clip-path. */
export const ALLOWED_PROPS = ['x', 'y', 'xPercent', 'yPercent', 'scale', 'scaleX', 'scaleY', 'rotate', 'opacity', '--p'] as const

/** `clip-path` opcional del M2: solo se activa si la medición a 360 px no muestra tareas largas. */
export const HERO_CLIP_REVEAL = false

/** M1: entrada orquestada del Hero. Total ≤ 1,4 s; el nombre se lee a 0,6 s. */
export const HERO_ENTRY: readonly Step[] = [
  {
    id: 'letters',
    target: '#hero h1 .rise',
    from: { yPercent: 105 },
    to: { yPercent: 0 },
    duration: LETTER_DURATION_MS / 1000,
    ease: 'power3.out',
    stagger: LETTER_STEP_MS / 1000,
    at: 0,
    targets: 16,
  },
  {
    id: 'enter',
    target: '#hero [data-enter]:not(.ha-pin):not([data-badge-wrap])',
    from: { y: 16, opacity: 0 },
    to: { y: 0, opacity: 1 },
    duration: 0.45,
    ease: 'power3.out',
    stagger: 0.08,
    at: 0.55,
    targets: 4,
  },
  {
    id: 'pin',
    target: '#hero .ha-pin',
    from: { scale: 0.6, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 0.4,
    ease: 'back.out(1.7)',
    at: 0.7,
    targets: 1,
  },
  {
    id: 'ornaments',
    target: '#hero svg.ornament',
    from: { rotate: -90 },
    to: { rotate: 0 },
    duration: 0.6,
    ease: 'power3.out',
    at: 0.8,
    targets: 2,
  },
  {
    id: 'badge',
    target: '#hero [data-badge-wrap]',
    from: { scale: 0.6, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    duration: 0.4,
    ease: 'back.out(1.7)',
    at: 0.9,
    targets: 1,
  },
]

/** M1b: entrada del título de Trabajo y Sobre mí: las letras suben desde su máscara, como el nombre del Hero. */
export const PAGE_INTRO_ENTRY: readonly Step[] = [
  {
    id: 'title',
    target: '[data-page-intro] .rise',
    from: { yPercent: 105 },
    to: { yPercent: 0 },
    duration: LETTER_DURATION_MS / 1000,
    ease: 'power3.out',
    stagger: LETTER_STEP_MS / 1000,
    at: 0,
    targets: 8,
  },
  {
    id: 'intro',
    target: '[data-page-intro] [data-enter]',
    from: { y: 16, opacity: 0 },
    to: { y: 0, opacity: 1 },
    duration: 0.45,
    ease: 'power3.out',
    stagger: 0.08,
    at: 0.3,
    targets: 2,
  },
]

/** M2: la foto del Hero asienta desde 1,12. El duotono, el grano y el punteado no se tocan. */
export const HERO_PHOTO: Step = {
  id: 'photo',
  target: '#hero [data-hero-photo] img',
  from: { scale: 1.12 },
  to: { scale: 1 },
  duration: 1.2,
  ease: 'power2.out',
  at: 0,
  targets: 1,
}

/** M3: revelado de secciones con el scroll; los bloques invertidos solo suben (el fondo nunca arranca transparente). */
export const REVEAL = {
  target: '[data-reveal], [data-reveal-item]',
  start: 'top 85%',
  once: true,
  duration: 0.6,
  ease: 'power3.out',
  stagger: 0.08,
  /** s que el contenido (`data-reveal-item`) espera tras su titular: el titular entra primero. */
  follow: 0.2,
  from: { y: 32, opacity: 0 },
  fromMobile: { y: 24, opacity: 0 },
  block: { selector: '[data-block]', from: { y: 48 }, fromMobile: { y: 24 } },
  /** Lo que ya orquestan M1/M1b (Hero y cabecera de página) no se revela por scroll. */
  skip: '#hero, [data-page-intro]',
  to: { y: 0, opacity: 1 },
} as const

/** M4: titular de sección; sube desde su máscara. */
export const RISE = {
  target: '[data-rise]',
  from: { yPercent: 105 },
  to: { yPercent: 0 },
  duration: 0.6,
  ease: 'power3.out',
} as const

/** M5: scrub elegido en lugar del pin: la foto del Hero al salir. */
export const SCRUB_HERO = {
  target: '#hero [data-hero-photo] img',
  trigger: '#hero',
  start: 'top top',
  end: 'bottom top',
  scrub: 0.6,
  to: { yPercent: 8, scale: 1.06 },
  toMobile: { yPercent: 4, scale: 1.03 },
} as const

/** M6: filetes que se dibujan (`--p` 0→1) entre `top 90%` y `top 60%`. */
export const RULES = {
  target: '.rule-x, .rule-y',
  from: { '--p': 0 },
  to: { '--p': 1 },
  start: 'top 90%',
  end: 'top 60%',
  scrub: true,
} as const

/** M7: apertura del Lab (cerrar es instantáneo; no se anima `height`). */
export const LAB_OPEN = {
  target: '#lab-panel li[data-lab-row]',
  from: { y: 16, opacity: 0 },
  to: { y: 0, opacity: 1 },
  duration: 0.35,
  stagger: 0.05,
  ease: 'power3.out',
} as const

/** M8: telón de entrada tras un clic interno; M1/M3 de la página nueva empiezan a 0,25 s. */
export const CURTAIN = {
  from: { scaleY: 1 },
  to: { scaleY: 0 },
  origin: 'bottom',
  duration: 0.7,
  ease: 'power3.inOut',
  pageStartDelay: 0.3,
} as const

/** Ajusta pasos a la rama (móvil: mitad de amplitud, escalonado ≤ 0,06 s). */
export function adaptSteps(steps: readonly Step[], isMobile: boolean): Step[] {
  return steps.map((step) => ({
    ...step,
    from: typeof step.from.y === 'number' ? { ...step.from, y: amplitude(step.from.y, isMobile) } : step.from,
    stagger: step.stagger === undefined ? undefined : stagger(step.stagger, isMobile),
  }))
}

/** Pasos de la entrada del Hero ya ajustados a la rama (móvil: mitad de amplitud, escalonado ≤ 0,06 s). */
export function heroEntry(isMobile: boolean): Step[] {
  return HERO_ENTRY.map((step) => ({
    ...step,
    from: typeof step.from.y === 'number' ? { ...step.from, y: amplitude(step.from.y, isMobile) } : step.from,
    stagger: step.stagger === undefined ? undefined : stagger(step.stagger, isMobile),
  }))
}

/** Duración total (s) de un conjunto de pasos de un mismo timeline. */
export function entryTotal(steps: readonly Step[]): number {
  return Math.max(...steps.map((s) => s.at + s.duration + (s.stagger ?? 0) * Math.max(0, s.targets - 1)))
}

/** Nombres de todas las propiedades que anima un conjunto de pasos o tweens. */
export function propsOf(...items: Array<Props | readonly Props[]>): string[] {
  const names = new Set<string>()
  for (const item of items) for (const p of Array.isArray(item) ? item : [item]) for (const k of Object.keys(p)) names.add(k)
  return [...names]
}

/** `clearProps` de GSAP sin tocar estilos ajenos (Next/Image escribe estilos en línea): solo lo que el tween escribió. */
export function clearPropsOf(to: Props): string {
  const css = new Set<string>()
  for (const k of Object.keys(to)) css.add(k === 'opacity' || k.startsWith('--') ? k : 'transform')
  return [...css].join(',')
}
