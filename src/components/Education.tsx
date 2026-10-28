import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import { formatFicha } from '@/lib/ficha.ts';
import SectionHeading from './SectionHeading';

interface EducationProps {
  copy: Dictionary['education'];
  /** Etiqueta de ficha («EDU.»); el número es el índice real en `facts.education`. */
  ficha: string;
}

const micro = 'font-mono text-xs uppercase tracking-[0.12em] text-bone-2';

const Education = ({ copy, ficha }: EducationProps) => (
  <section id="education" aria-labelledby="education-title" className="@container py-10">
    <SectionHeading id="education-title">{copy.title}</SectionHeading>

    <ul>
      {facts.education.map((entry, index) => (
        <li
          key={entry.id}
          className="grid min-w-0 gap-2 border-t border-line py-5 @2xl:grid-cols-12 @2xl:gap-8"
        >
          <div className="@2xl:col-span-3">
            <p className={micro}>{formatFicha(ficha, index)}</p>
            <p className={`mt-1 ${micro}`}>{entry.period ?? copy.inProgress}</p>
          </div>
          <div className="min-w-0 @2xl:col-span-9">
            <h3 className="break-words font-display text-2xl uppercase text-bone">{entry.institution}</h3>
            <p className="mt-1 break-words text-base text-bone">{copy.items[entry.id]}</p>
          </div>
        </li>
      ))}
    </ul>

    <p className="mt-4 max-w-[65ch] border-t border-line pt-5 text-base text-bone">
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
