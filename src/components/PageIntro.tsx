import { Checker, Star4 } from './Ornaments';
import { formatPageIndex } from '@/lib/ficha.ts';
import { splitLetters } from '@/lib/letters.ts';
import type { Dictionary } from '@/content/types.ts';

interface PageIntroProps {
  page: 'work' | 'about';
  copy: Dictionary['pages'];
}

/** Cabecera de Trabajo y Sobre mí: ficha de página, título a escala de cartel y una línea. Sin acción propia. */
const PageIntro = ({ page, copy }: PageIntroProps) => {
  const { title, intro } = copy[page];
  return (
    <section aria-labelledby="page-title" data-page-intro className="flex items-end justify-between gap-4 pb-6 pt-10">
      <div data-reveal className="min-w-0">
        <p data-enter className="font-mono text-xs uppercase tracking-[0.12em] text-bone-2">{formatPageIndex(page)}</p>
        <h1
          id="page-title"
          className="font-display text-[clamp(4rem,16vw,8rem)] uppercase leading-[0.9] text-bone"
        >
          <span className="sr-only">{title}.</span>
          <span aria-hidden="true" className="flex flex-wrap gap-x-[0.25em]">
            {splitLetters(title).map((letters) => (
              <span key={letters.map((l) => l.char).join('')} className="mask block">
                {letters.map((letter) => (
                  <span key={letter.index} className="rise">
                    {letter.char}
                  </span>
                ))}
              </span>
            ))}
            <span className="text-accent">.</span>
          </span>
        </h1>
        <p data-enter className="mt-3 max-w-[65ch] text-base text-bone">{intro}</p>
      </div>
      {page === 'work' ? (
        <div className="shrink-0 pb-3 text-accent">
          <Star4 size={40} />
        </div>
      ) : (
        <div className="shrink-0 pb-3 text-bone">
          <Checker size={72} />
        </div>
      )}
    </section>
  );
};

export default PageIntro;
