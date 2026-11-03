import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/locale.ts';
import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import { pagePath } from '@/content/pages.ts';
import { formatPageSectionFicha } from '@/lib/ficha.ts';
import { numbersFromFacts } from '@/lib/numbers.ts';
import CountUp from './CountUp';
import { RingMarks } from './Ornaments';
import SectionHeading from './SectionHeading';

interface NumbersProps {
  lang: Locale;
  copy: Dictionary['experience'];
  home: Dictionary['home'];
}

const micro = 'font-mono text-xs uppercase tracking-[0.12em] text-bone-2';

/** Más de este número de caracteres y la cifra pide dos columnas. */
const WIDE = 4;

const jobs: readonly (typeof facts.experience)[number][] = facts.experience;

/** Cifras de la experiencia (mismas `metrics` que Experience): el gancho de Home; el contexto vive en Sobre mí. */
const Numbers = ({ lang, copy, home }: NumbersProps) => {
  const numbers = numbersFromFacts(jobs);
  if (numbers.length === 0) return null;

  return (
    <section id="numbers" aria-labelledby="numbers-title" className="@container py-10">
      <SectionHeading id="numbers-title" ficha={formatPageSectionFicha('home', 'numbers')}>
        {copy.title}
      </SectionHeading>

      {/* Una cifra larga («40→100 %») ocupa dos columnas: 2 de 2 bajo 768 px y 2 de 5 desde 768 px (las demás, 1). */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-8 @3xl:grid-cols-5 @3xl:gap-x-6">
        {numbers.map(({ value, jobId, metricIndex }) => {
          const job = jobs.find((j) => j.id === jobId);
          return (
            <div
              key={`${jobId}-${metricIndex}`}
              data-reveal-item
              className={`flex min-w-0 flex-col border-l border-line pl-4${value.length > WIDE ? ' col-span-2' : ''}`}
            >
              <dt className={`order-2 mt-2 break-words ${micro}`}>{copy.items[jobId as keyof typeof copy.items].metrics[metricIndex]}</dt>
              <dd className="order-1 whitespace-nowrap font-display text-[clamp(3.5rem,7.5cqi,6rem)] leading-none text-accent">
                <CountUp value={value} />
              </dd>
              <dd className={`order-3 mt-1 break-words ${micro}`}>
                {job?.company} · {job?.period}
              </dd>
            </div>
          );
        })}
      </dl>

      <div data-reveal-item className="mt-8 flex items-end justify-between gap-6 @3xl:min-h-28">
        <Link
          href={`${pagePath(lang, 'about')}#experience`}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg font-semibold text-accent underline underline-offset-4 hover:text-bone"
        >
          {home.fullExperience}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="hidden text-bone @3xl:block">
          <RingMarks size={96} />
        </div>
      </div>
    </section>
  );
};

export default Numbers;
