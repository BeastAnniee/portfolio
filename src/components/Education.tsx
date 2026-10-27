import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import SectionHeading from './SectionHeading';

const Education = ({ copy }: { copy: Dictionary['education'] }) => (
  <section id="education" aria-labelledby="education-title" className="px-4 py-6 sm:px-6 lg:px-10">
    <SectionHeading id="education-title">{copy.title}</SectionHeading>

    <ul className="space-y-4">
      {facts.education.map((entry) => (
        <li key={entry.id} className="min-w-0 rounded-[20px] bg-bento-page p-5 sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <h3 className="break-words font-display text-lg font-bold text-bento-black">{entry.institution}</h3>
            <p className="text-sm font-medium text-bento-graphite">{entry.period ?? copy.inProgress}</p>
          </div>
          <p className="mt-1 break-words text-sm text-bento-graphite">{copy.items[entry.id]}</p>
        </li>
      ))}
    </ul>

    <p className="mt-4 text-sm text-bento-black">
      <span className="font-semibold">{copy.languages.title}: </span>
      {facts.languages
        .map((language) => {
          const item = copy.languages.items[language.id];
          return `${item.name}: ${item.level}${language.cefr ? ` (${language.cefr})` : ''}`;
        })
        .join(' | ')}
    </p>
  </section>
);

export default Education;
