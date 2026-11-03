import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/locale.ts';
import type { Dictionary } from '@/content/types.ts';
import { NEXT_PAGE, pagePath } from '@/content/pages.ts';

interface NextBandProps {
  lang: Locale;
  /** Página en la que está la banda (Home o Trabajo); enlaza con la siguiente del recorrido. */
  from: 'home' | 'work';
  next: Dictionary['next'];
  pages: Dictionary['pages'];
}

/** Banda de hilo: todo el bloque es un enlace normal a la página siguiente (funciona sin JS). */
const NextBand = ({ lang, from, next, pages }: NextBandProps) => {
  const target = NEXT_PAGE[from];
  if (target === null || target === 'home') return null;
  const bridge = target === 'work' ? next.toWork : next.toAbout;
  return (
    <Link
      href={pagePath(lang, target)}
      data-reveal
      className="next-link rule-x group @container block min-h-24 py-8"
    >
      <span className="block">
        <span className="block max-w-[65ch] text-base text-bone">{bridge}</span>
        <span className="mt-3 flex items-end justify-between gap-4">
          <span className="min-w-0">
            <span className="block font-mono text-xs uppercase tracking-[0.12em] text-bone-2">{next.label}</span>
            <span className="block font-display text-[clamp(2.5rem,12cqi,6rem)] uppercase leading-[0.95] text-accent group-hover:text-bone group-focus-visible:text-bone">
              {pages[target].title}
            </span>
          </span>
          <ArrowRight className="next-arrow h-10 w-10 shrink-0 text-bone sm:h-14 sm:w-14" aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
};

export default NextBand;
