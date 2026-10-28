'use client';

import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';

interface MarqueeProps {
  items: readonly string[];
  label: string;
  pause: string;
  play: string;
}

const Marquee = ({ items, label, pause, play }: MarqueeProps) => {
  const [paused, setPaused] = useState(false);

  // Un solo mecanismo de pausa para todo el movimiento continuo: cinta y sello
  useEffect(() => {
    const root = document.documentElement;
    if (paused) root.setAttribute('data-motion-paused', '');
    else root.removeAttribute('data-motion-paused');
    return () => root.removeAttribute('data-motion-paused');
  }, [paused]);

  const list = (copy: boolean) => (
    <ul
      className={`marquee-list flex shrink-0 items-center${copy ? ' marquee-copy' : ''}`}
      aria-hidden={copy ? true : undefined}
    >
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center whitespace-nowrap font-mono text-xs uppercase tracking-[0.12em] text-bone"
        >
          {item}
          <span aria-hidden="true" className="px-4 text-bone-2">
            ·
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <div
        role="group"
        aria-label={label}
        className="marquee rule-x my-6 flex min-h-12 items-stretch"
      >
        <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
          <div className="marquee-track items-center">
            {list(false)}
            {list(true)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? play : pause}
          className="marquee-pause press my-px flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-xl border border-line text-bone hover:bg-bone hover:text-carbon"
        >
          {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      <noscript>
        <style>{'.marquee-track{animation:none;flex-wrap:wrap;width:auto}.marquee-list{flex-wrap:wrap;flex-shrink:1;min-width:0}.marquee-list li{white-space:normal}.marquee-copy{display:none}.marquee-pause{display:none}'}</style>
      </noscript>
    </>
  );
};

export default Marquee;
