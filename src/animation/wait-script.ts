/**
 * Script inline (≤ 200 bytes) que va en `<head>` de `[lang]/layout.tsx`: marca `html[data-gsap='wait']` solo si la
 * persona no pidió menos movimiento. `PageMotion` lo retira al arrancar, ante un error de `import()` o a los
 * `WAIT_TIMEOUT_MS`. Además, el propio script arma un salvavidas (`WAIT_SCRIPT_TIMEOUT_MS`): si el bundle de Next no
 * llega a hidratar, retira el estado de espera por sí solo y el Hero nunca queda oculto. Si el script no está o falla,
 * el contenido está en su estado final (mejora progresiva).
 */
export const WAIT_SCRIPT_TIMEOUT_MS = 2500

/** Marca que deja el salvavidas en `<html>` al retirar `data-gsap`; `PageMotion` la consume y no vuelve a ocultar la página. */
export const WAIT_RELEASED_ATTR = 'data-gsap-released'

export const WAIT_SCRIPT = `!matchMedia('(prefers-reduced-motion:reduce)').matches&&(d=document.documentElement,d.dataset.gsap='wait',setTimeout(()=>d.dataset.gsap=='wait'&&(delete d.dataset.gsap,d.dataset.gsapReleased=1),${WAIT_SCRIPT_TIMEOUT_MS}))`
