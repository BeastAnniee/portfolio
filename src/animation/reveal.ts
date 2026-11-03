import type { gsap as Gsap } from 'gsap'
import type { ScrollTrigger as ScrollTriggerPlugin } from 'gsap/ScrollTrigger'
import { FIRST_SCREEN_DELAY, MAX_BATCH, REVEAL_MOBILE, RULES_MOBILE, belowFold, stagger } from './config.ts'
import { REVEAL, RISE, RULES, clearPropsOf } from './specs.ts'

type GsapApi = typeof Gsap
type Trigger = typeof ScrollTriggerPlugin

/**
 * M3 y M4: revelado de secciones y titulares con el scroll. Solo los elementos bajo el pliegue reciben un estado
 * inicial (`gsap.set`); lo que ya se ve al cargar no se toca. `once`: nunca se vuelve a ocultar. Los bloques
 * `bone`/`accent` solo suben: su fondo nunca arranca transparente.
 */
export function revealSections(gsap: GsapApi, ScrollTrigger: Trigger, isMobile: boolean, delay: number): void {
  if (isMobile && !REVEAL_MOBILE) return
  const born = performance.now()
  // El retraso del telón solo aplica a lo que entra justo al cargar la página.
  const lead = () => (performance.now() - born < 1000 ? delay : 0)
  const vh = window.innerHeight
  const from = isMobile ? REVEAL.fromMobile : REVEAL.from
  const blockFrom = isMobile ? REVEAL.block.fromMobile : REVEAL.block.from
  const isBlock = (el: Element) => el.matches(REVEAL.block.selector)

  // Todo el contenido entra; lo que ya se ve al cargar espera tras el titular (FIRST_SCREEN_DELAY). Hero y PageIntro tienen su timeline.
  const items = [...document.querySelectorAll<HTMLElement>(REVEAL.target)].filter((el) => !el.closest(REVEAL.skip))
  const firstScreen = new WeakSet<Element>(items.filter((el) => !belowFold(el.getBoundingClientRect().top, vh)))
  for (const el of items) gsap.set(el, { ...(isBlock(el) ? blockFrom : from) })
  ScrollTrigger.batch(items, {
    start: REVEAL.start,
    once: REVEAL.once,
    batchMax: MAX_BATCH,
    onEnter: (batch) => {
      const rest = batch.filter((el) => !isBlock(el))
      const blocks = batch.filter(isBlock)
      if (rest.length) {
        gsap.to(rest, {
          ...REVEAL.to,
          duration: REVEAL.duration,
          ease: REVEAL.ease,
          stagger: stagger(REVEAL.stagger, isMobile),
          delay: (_i: number, el: Element) =>
            lead() + (firstScreen.has(el) ? FIRST_SCREEN_DELAY : 0) + (el.hasAttribute('data-reveal-item') ? REVEAL.follow : 0),
          clearProps: clearPropsOf(REVEAL.to),
        })
      }
      if (blocks.length) {
        gsap.to(blocks, {
          y: 0,
          duration: REVEAL.duration,
          ease: REVEAL.ease,
          delay: (_i: number, el: Element) => lead() + (firstScreen.has(el) ? FIRST_SCREEN_DELAY : 0),
          clearProps: 'transform',
        })
      }
    },
  })

  const titles = [...document.querySelectorAll<HTMLElement>(RISE.target)].filter((el) => !el.closest(REVEAL.skip))
  for (const el of titles) gsap.set(el, { ...RISE.from })
  ScrollTrigger.batch(titles, {
    start: REVEAL.start,
    once: REVEAL.once,
    batchMax: MAX_BATCH,
    onEnter: (batch) => {
      gsap.to(batch, { ...RISE.to, duration: RISE.duration, ease: RISE.ease, delay: lead(), clearProps: clearPropsOf(RISE.to) })
    },
  })
}

/** M6: los filetes se dibujan con el scroll (`--p` de 0 a 1); sin JS o sin GSAP valen 1 y están dibujados. */
export function drawRules(gsap: GsapApi, isMobile: boolean): void {
  if (isMobile && !RULES_MOBILE) return
  for (const el of document.querySelectorAll<HTMLElement>(RULES.target)) {
    gsap.fromTo(
      el,
      { ...RULES.from },
      { ...RULES.to, ease: 'none', scrollTrigger: { trigger: el, start: RULES.start, end: RULES.end, scrub: RULES.scrub } },
    )
  }
}
