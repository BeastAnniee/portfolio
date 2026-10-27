import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import SectionHeading from './SectionHeading';

const Achievements = ({ copy }: { copy: Dictionary['achievements'] }) => (
  <section id="achievements" aria-labelledby="achievements-title" className="px-4 py-6 sm:px-6 lg:px-10">
    <SectionHeading id="achievements-title">{copy.title}</SectionHeading>

    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {facts.achievements.map((achievement) => {
        const item = copy.items[achievement.id];
        return (
          <li key={achievement.id} className="min-w-0 rounded-[20px] bg-bento-amber p-5">
            <p className="break-words font-display text-base font-bold text-bento-black">
              {item.event}
              {achievement.year && <span className="font-medium"> · {achievement.year}</span>}
            </p>
            <p className="mt-2 break-words text-sm leading-relaxed text-bento-black">{item.result}</p>
          </li>
        );
      })}
    </ul>
  </section>
);

export default Achievements;
