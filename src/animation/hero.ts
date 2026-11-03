import type { gsap as Gsap } from 'gsap'
import { HERO_SCRUB_MOBILE } from './config.ts'
import { HERO_PHOTO, PAGE_INTRO_ENTRY, SCRUB_HERO, adaptSteps, clearPropsOf, heroEntry } from './specs.ts'

type GsapApi = typeof Gsap

/** M1 + M2: entrada orquestada del Hero y asentado de la foto. Todo sale de `specs.ts`. */
export function heroTimeline(gsap: GsapApi, isMobile: boolean, delay: number) {
  const tl = gsap.timeline({ delay })
  for (const step of [...heroEntry(isMobile), ...adaptSteps(PAGE_INTRO_ENTRY, isMobile)]) {
    if (!document.querySelector(step.target)) continue
    tl.fromTo(
      step.target,
      { ...step.from },
      { ...step.to, duration: step.duration, ease: step.ease, stagger: step.stagger, clearProps: clearPropsOf(step.to) },
      step.at,
    )
  }
  if (document.querySelector(HERO_PHOTO.target)) {
    // La foto conserva su transform: el scrub de M5 también lo escribe (clearProps lo pisaría).
    tl.fromTo(HERO_PHOTO.target, { ...HERO_PHOTO.from }, { ...HERO_PHOTO.to, duration: HERO_PHOTO.duration, ease: HERO_PHOTO.ease }, HERO_PHOTO.at)
  }
  return tl
}

/** M5: la foto del Hero se desplaza y crece ligeramente al salir (scrub, sin pin). */
export function heroScrub(gsap: GsapApi, isMobile: boolean): void {
  if (isMobile && !HERO_SCRUB_MOBILE) return
  if (!document.querySelector(SCRUB_HERO.target)) return
  gsap.to(SCRUB_HERO.target, {
    ...(isMobile ? SCRUB_HERO.toMobile : SCRUB_HERO.to),
    ease: 'none',
    immediateRender: false,
    scrollTrigger: {
      trigger: SCRUB_HERO.trigger,
      start: SCRUB_HERO.start,
      end: SCRUB_HERO.end,
      scrub: SCRUB_HERO.scrub,
    },
  })
}
