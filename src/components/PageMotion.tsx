'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  FONTS_WAIT_MS,
  MOBILE_MAX_PX,
  NAV_INTENT_ATTR,
  REFRESH_DEBOUNCE_MS,
  WAIT_TIMEOUT_MS,
} from '@/animation/config.ts';
import { createCurtain, revealCurtain } from '@/animation/curtain.ts';
import { runMotion } from '@/animation/index.ts';
import { armNavIntent } from '@/animation/intent.ts';
import { writeProbe } from '@/animation/probe.ts';
import { CURTAIN } from '@/animation/specs.ts';
import { WAIT_RELEASED_ATTR } from '@/animation/wait-script.ts';

const REDUCED = '(prefers-reduced-motion: reduce)';

// Páginas ya montadas en esta sesión: la primera es la carga directa; las siguientes, navegaciones del cliente.
let mounts = 0;

/**
 * Orquesta GSAP + ScrollTrigger en cada página (ADR-0002). Sin UI. Todo es mejora progresiva:
 * - `gsap` y `ScrollTrigger` se cargan con `import()` tras hidratar, fuera de la carga inicial.
 * - `html[data-gsap='wait']` (un script inline en la carga directa; aquí en cada página nueva, antes de pintar) lo retira
 *   esta función al arrancar, ante un error de `import()` o a los `WAIT_TIMEOUT_MS`. Si GSAP llega después, no anima.
 * - Si el salvavidas del script inline ya retiró la espera, deja `data-gsap-released`: esta hidratación consume la marca,
 *   no vuelve a ocultar la página y no anima; la navegación siguiente recupera el comportamiento normal.
 * - Todo dentro de `gsap.matchMedia()`: reduced-motion no hace nada; móvil con amplitudes a la mitad.
 * - El telón de página (M8) es de entrada: navega Next normal y la página nueva se destapa. Va después del cambio de ruta.
 * - Al desmontar, `mm.revert()` destruye triggers, timelines y estilos en línea (REQ-19).
 */
const PageMotion = () => {
  const curtainRef = useRef<HTMLDivElement | null>(null);
  // El salvavidas inline ya mostró la página: esta hidratación no debe volver a ocultarla ni animarla.
  const releasedRef = useRef(false);

  // Antes del primer fotograma: estado de espera (sin parpadeo de letras) y telón si hubo clic en un enlace interno.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const intent = root.getAttribute(NAV_INTENT_ATTR) === '1';
    root.removeAttribute(NAV_INTENT_ATTR);
    if (root.hasAttribute(WAIT_RELEASED_ATTR)) {
      releasedRef.current = true;
      return;
    }
    if (window.matchMedia(REDUCED).matches) return;
    root.dataset.gsap = 'wait';
    if (intent) curtainRef.current = createCurtain();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const release = () => root.removeAttribute('data-gsap');
    const navigated = mounts++ > 0;
    // Cada página nueva empieza arriba, salvo que el enlace lleve ancla (#contact...).
    // Se reafirma tras el primer refresh de posiciones: un resto de scroll suave de la página anterior no debe dejar la nueva a unos píxeles.
    const toTop = navigated && !window.location.hash;
    if (toTop) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    let userScrolled = false;
    const markUser = () => { userScrolled = true; };
    const userEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    if (toTop) userEvents.forEach((e) => window.addEventListener(e, markUser, { once: true, passive: true }));
    const settleTimer = toTop
      ? window.setTimeout(() => {
          if (!userScrolled && window.scrollY > 0) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 400)
      : 0;
    const curtain = curtainRef.current;
    curtainRef.current = null;
    const removeCurtain = () => curtain?.remove();

    // Tras navegar, si el foco quedó en body pasa al contenido nuevo.
    const focusTimer = navigated
      ? window.setTimeout(() => {
          if (document.activeElement !== document.body) return;
          const main = document.querySelector('main');
          if (main) {
            main.tabIndex = -1;
            main.focus({ preventScroll: true });
          }
        }, 150)
      : 0;

    if (window.matchMedia(REDUCED).matches) {
      root.removeAttribute(WAIT_RELEASED_ATTR);
      release();
      root.dataset.motionSt = '0';
      root.dataset.motionTw = '0';
      return () => {
        window.clearTimeout(focusTimer);
        window.clearTimeout(settleTimer);
        userEvents.forEach((e) => window.removeEventListener(e, markUser));
      };
    }

    if (releasedRef.current) {
      // La página ya está en su estado final: se consume la marca y no se anima.
      root.removeAttribute(WAIT_RELEASED_ATTR);
      release();
      root.dataset.motionSt = '0';
      root.dataset.motionTw = '0';
      // Las navegaciones siguientes (sin marca) recuperan el telón y la entrada normales.
      const stopIntent = armNavIntent();
      return () => {
        window.clearTimeout(focusTimer);
        window.clearTimeout(settleTimer);
        userEvents.forEach((e) => window.removeEventListener(e, markUser));
        stopIntent();
      };
    }

    const stopIntent = armNavIntent();
    let cancelled = false;
    let late = false;
    let cleanup: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      late = true;
      release();
      removeCurtain();
    }, WAIT_TIMEOUT_MS);

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      .then(async ([{ gsap }, { ScrollTrigger }]) => {
        if (late || cancelled) return;
        if (root.hasAttribute(WAIT_RELEASED_ATTR)) {
          // El salvavidas retiró la espera mientras cargaba GSAP: la página ya es visible y no se anima.
          late = true;
          window.clearTimeout(timer);
          root.removeAttribute(WAIT_RELEASED_ATTR);
          release();
          removeCurtain();
          return;
        }
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true });

        // La entrada del Hero espera a las fuentes (como mucho FONTS_WAIT_MS) para no medir con el respaldo.
        const fontsReady = document.fonts.ready;
        await Promise.race([fontsReady, new Promise((resolve) => window.setTimeout(resolve, FONTS_WAIT_MS))]);
        if (late || cancelled) return;
        window.clearTimeout(timer);

        const mm = gsap.matchMedia();
        mm.add(
          {
            reduce: REDUCED,
            desktop: `(prefers-reduced-motion: no-preference) and (min-width: ${MOBILE_MAX_PX + 1}px)`,
            mobile: `(prefers-reduced-motion: no-preference) and (max-width: ${MOBILE_MAX_PX}px)`,
          },
          (context) => {
            const { reduce, mobile } = context.conditions as Record<string, boolean>;
            if (reduce || root.hasAttribute(WAIT_RELEASED_ATTR)) {
              // Reduced-motion o salvavidas ya disparado: estado final, sin animar.
              root.removeAttribute(WAIT_RELEASED_ATTR);
              removeCurtain();
              release();
              return;
            }
            const stop = runMotion({
              gsap,
              ScrollTrigger,
              isMobile: Boolean(mobile),
              delay: curtain ? CURTAIN.pageStartDelay : 0,
            });
            // El estado de espera se retira después de fijar los estados iniciales: sin parpadeo.
            release();
            if (curtain) revealCurtain(gsap, curtain);
            return stop;
          },
        );
        writeProbe(gsap, ScrollTrigger);

        // Posiciones: tras fuentes, tras la carga completa y ante cambios de alto de <main>.
        void fontsReady.then(() => ScrollTrigger.refresh());
        const refresh = () => ScrollTrigger.refresh();
        if (document.readyState === 'complete') refresh();
        else window.addEventListener('load', refresh);
        let debounce = 0;
        const main = document.querySelector('main');
        const resize = main
          ? new ResizeObserver(() => {
              window.clearTimeout(debounce);
              debounce = window.setTimeout(refresh, REFRESH_DEBOUNCE_MS);
            })
          : null;
        resize?.observe(main as Element);

        cleanup = () => {
          window.removeEventListener('load', refresh);
          window.clearTimeout(debounce);
          resize?.disconnect();
          mm.revert();
          writeProbe(gsap, ScrollTrigger);
        };
      })
      .catch(() => {
        release();
        removeCurtain();
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(focusTimer);
      window.clearTimeout(settleTimer);
      userEvents.forEach((e) => window.removeEventListener(e, markUser));
      stopIntent();
      cleanup?.();
      removeCurtain();
      // No se libera data-gsap aquí: la página nueva lo fija antes de pintar y es quien lo retira.
    };
  }, []);

  return null;
};

export default PageMotion;
