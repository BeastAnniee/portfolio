import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import SectionHeading from './SectionHeading';
import TechChips from './TechChips';

interface ExperienceProps {
  copy: Dictionary['experience'];
  techLabels: Dictionary['techLabels'];
}

const jobs: readonly (typeof facts.experience)[number][] = facts.experience;

const Experience = ({ copy, techLabels }: ExperienceProps) => (
  <section id="experience" aria-labelledby="experience-title" className="px-4 py-6 sm:px-6 lg:px-10">
    <SectionHeading id="experience-title">{copy.title}</SectionHeading>

    {jobs.length === 0 ? (
      <p className="text-bento-graphite">{copy.empty}</p>
    ) : (
      <ol className="space-y-4 sm:space-y-6">
        {jobs.map((job) => {
          const item = copy.items[job.id];
          return (
            <li key={job.id} className="min-w-0 rounded-[20px] bg-bento-page p-5 sm:p-6">
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className="break-words font-display text-xl font-bold text-bento-black">{job.company}</h3>
                <p className="text-sm font-medium text-bento-graphite">{job.period}</p>
              </div>
              <p className="mb-4 break-words text-sm font-semibold text-bento-black">{item.role}</p>

              {job.metrics.length > 0 && (
                <dl className="mb-4 flex flex-wrap gap-3">
                  {job.metrics.map((metric, index) => (
                    <div key={item.metrics[index]} className="flex flex-col-reverse rounded-[14px] bg-bento-mint px-4 py-2">
                      <dt className="mt-1 text-xs font-medium text-bento-black">{item.metrics[index]}</dt>
                      <dd className="font-display text-2xl font-extrabold leading-none text-bento-black">
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <ul className="mb-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-bento-graphite marker:text-bento-black">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="break-words">
                    {bullet}
                  </li>
                ))}
              </ul>

              {job.tech.length > 0 && <TechChips items={job.tech} labels={techLabels} />}
            </li>
          );
        })}
      </ol>
    )}
  </section>
);

export default Experience;
