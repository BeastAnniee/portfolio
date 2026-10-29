import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import { formatFicha, formatSectionFicha } from '@/lib/ficha.ts';
import SectionHeading from './SectionHeading';

interface AchievementsProps {
  copy: Dictionary['achievements'];
  /** Etiqueta de ficha («ACH.»); el número es el índice real en `facts.achievements`. */
  ficha: string;
}

const micro = 'font-mono text-xs uppercase tracking-[0.12em] text-bone-2';

const Achievements = ({ copy, ficha }: AchievementsProps) => (
  <section id="achievements" aria-labelledby="achievements-title" className="@container py-10">
    <SectionHeading id="achievements-title" ficha={formatSectionFicha('achievements')}>{copy.title}</SectionHeading>

    <ul>
      {facts.achievements.map((achievement, index) => {
        const item = copy.items[achievement.id];
        return (
          <li
            key={achievement.id}
            className="grid min-w-0 gap-2 border-t border-line py-5 @2xl:grid-cols-12 @2xl:gap-8"
          >
            <p className={`${micro} @2xl:col-span-3`}>
              {formatFicha(ficha, index)}
              {achievement.year && <span> · {achievement.year}</span>}
            </p>
            <div className="min-w-0 @2xl:col-span-9">
              <p className="break-words font-display text-2xl uppercase text-bone">{item.event}</p>
              <p className="mt-2 max-w-[65ch] break-words text-base text-bone">{item.result}</p>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);

export default Achievements;
