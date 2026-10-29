'use client';

import { useEffect, useRef } from 'react';
import { COUNT_MS, countAt, isCountable } from '@/lib/count-up.ts';

/**
 * Cifra que cuenta de 0 al valor una sola vez al entrar en vista. El HTML servido ya trae el valor final
 * (sin JS, con reduced-motion o sin IntersectionObserver no se anima); los lectores reciben siempre el
 * valor final en `sr-only`. Solo se cuentan enteros (`isCountable`); el resto se pinta tal cual.
 */
const CountUp = ({ value }: { value: string }) => {
  const visible = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = visible.current;
    if (!node || !isCountable(value)) return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const target = Number(value);
    let frame = 0;
    // Ancho del valor final: la cuenta nunca cambia el tamaño de la caja (CLS 0).
    node.style.minWidth = `${node.getBoundingClientRect().width}px`;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const elapsed = now - start;
          node.textContent = elapsed >= COUNT_MS ? value : String(countAt(target, elapsed));
          if (elapsed < COUNT_MS) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      node.textContent = value;
    };
  }, [value]);

  return (
    <>
      <span className="sr-only">{value}</span>
      <span ref={visible} aria-hidden="true" className="inline-block">{value}</span>
    </>
  );
};

export default CountUp;
