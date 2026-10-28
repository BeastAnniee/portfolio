import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import { formatFicha } from '@/lib/ficha.ts';
import SectionHeading from './SectionHeading';
import TechChips from './TechChips';

interface ExperienceProps {
  copy: Dictionary['experience'];
  techLabels: Dictionary['techLabels'];
  /** Etiqueta de ficha («EXP.»); el número es el índice real en `facts.experience`. */
  ficha: string;
}

const jobs: readonly (typeof facts.experience)[number][] = facts.experience;

const micro = 'font-mono text-xs uppercase tracking-[0.12em] text-bone-2';

const Experience = ({ copy, techLabels, ficha }: ExperienceProps) => (
  <section id="experience" aria-labelledby="experience-title" className="@container py-10">
    <SectionHeading id="experience-title">{copy.title}</SectionHeading>

    {jobs.length === 0 ? (
      <p className="border-t border-line py-6 text-base text-bone">{copy.empty}</p>
    ) : (
      <ol>
        {jobs.map((job, index) => {
          const item = copy.items[job.id];
          return (
            <li
              key={job.id}
              className="grid min-w-0 gap-4 border-t border-line py-8 @2xl:grid-cols-12 @2xl:gap-8"
            >
              <div className="min-w-0 @2xl:col-span-4">
                <p className={`mb-2 ${micro}`}>{formatFicha(ficha, index)}</p>
                <h3 className="break-words font-display text-2xl uppercase text-bone">{job.company}</h3>
                <p className={`mt-1 ${micro}`}>{job.period}</p>
              </div>

              <div className="min-w-0 @2xl:col-span-8">
                <p className="mb-4 break-words text-xl font-semibold leading-snug text-bone">{item.role}</p>

                {job.metrics.length > 0 && (
                  <dl className="mb-4 flex flex-wrap gap-x-6 gap-y-3">
                    {job.metrics.map((metric, i) => (
                      <div key={item.metrics[i]} className="flex min-w-0 flex-col-reverse border-l border-line pl-4">
                        <dt className={`mt-1 break-words ${micro}`}>{item.metrics[i]}</dt>
                        <dd className="font-display text-2xl leading-none text-accent">{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <ul className="mb-4 max-w-[65ch] list-disc space-y-2 pl-5 text-base text-bone marker:text-accent">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="break-words">
                      {bullet}
                    </li>
                  ))}
                </ul>

                {job.tech.length > 0 && <TechChips items={job.tech} labels={techLabels} />}
              </div>
            </li>
          );
        })}
      </ol>
    )}
  </section>
);

export default Experience;
