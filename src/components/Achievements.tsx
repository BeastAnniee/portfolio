import type { Dictionary } from '@/content/types.ts';
import type { PageId } from '@/content/pages.ts';
import { facts } from '@/content/facts.ts';
import { formatFicha, formatPageSectionFicha } from '@/lib/ficha.ts';
import { Checker } from './Ornaments';
import SectionHeading from './SectionHeading';

interface AchievementsProps {
  /** Página que la monta: la ficha numera por posición dentro de ella. */
  page: PageId;
  copy: Dictionary['achievements'];
  /** Etiqueta de ficha («ACH.»); el número es el índice real en `facts.achievements`. */
  ficha: string;
}

const micro = 'font-mono text-xs uppercase tracking-[0.12em] text-carbon';

// Bloque invertido (data-block="bone"): bone/carbon, sin acento ni grises. Con Contact (acento) suman 2, no adyacentes.
const Achievements = ({ copy, ficha, page }: AchievementsProps) => (
  <section
    id="achievements"
    data-block="bone"
    aria-labelledby="achievements-title"
    className="inverted @container relative my-8 rounded-2xl md:my-10 border border-transparent bg-bone p-5 text-carbon @2xl:p-8"
  >
    <div className="pointer-events-none absolute right-5 top-2 text-carbon @2xl:right-8 @2xl:top-5">
      <Checker size={72} />
    </div>
    <SectionHeading id="achievements-title" inverted ficha={formatPageSectionFicha(page, 'achievements')}>
      {copy.title}
    </SectionHeading>

    <ul className="divide-y divide-carbon">
      {facts.achievements.map((achievement, index) => {
        const item = copy.items[achievement.id];
        return (
          <li key={achievement.id} data-reveal-item className="grid min-w-0 gap-2 py-4 first:pt-0 last:pb-0 @2xl:py-5 @2xl:grid-cols-12 @2xl:gap-8">
            <p className={`${micro} @2xl:col-span-3`}>
              {formatFicha(ficha, index)}
              {achievement.year && <span> · {achievement.year}</span>}
            </p>
            <div className="min-w-0 @2xl:col-span-9">
              <p className="break-words font-display text-2xl uppercase">{item.event}</p>
              <p className="mt-2 max-w-[65ch] break-words text-base">{item.result}</p>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);

export default Achievements;
