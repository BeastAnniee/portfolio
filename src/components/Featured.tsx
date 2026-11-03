import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Locale } from '@/lib/locale.ts';
import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import { pagePath } from '@/content/pages.ts';
import { formatFicha, formatPageSectionFicha } from '@/lib/ficha.ts';
import { Star4 } from './Ornaments';
import SectionHeading from './SectionHeading';

interface FeaturedProps {
  lang: Locale;
  copy: Dictionary['projects'];
  home: Dictionary['home'];
  /** Etiqueta de ficha («PROJ.»); el número es el índice real en `facts.projects.spotlight`. */
  ficha: string;
}

// Bloque invertido (data-block="bone"): resumen de los dos proyectos; resultado, tecnologías y enlaces viven en Trabajo.
const Featured = ({ lang, copy, home, ficha }: FeaturedProps) => {
  const projects = facts.projects.spotlight;
  if (projects.length === 0) return null;

  return (
    <section
      id="featured"
      data-block="bone"
      data-reveal-item
      aria-labelledby="featured-title"
      className="inverted @container relative my-10 rounded-2xl border border-transparent bg-bone p-5 text-carbon @2xl:p-8"
    >
      <div className="pointer-events-none absolute right-5 top-5 text-carbon @2xl:right-8 @2xl:top-8">
        <Star4 size={40} />
      </div>
      <div className="pr-14">
        <SectionHeading id="featured-title" inverted ficha={formatPageSectionFicha('home', 'featured')}>
          {copy.title}
        </SectionHeading>
      </div>

      <div className="grid grid-cols-1 divide-y divide-carbon @2xl:grid-cols-2 @2xl:divide-x @2xl:divide-y-0">
        {projects.map((project, index) => (
          <article key={project.id} data-reveal-item className="min-w-0 py-6 first:pt-0 last:pb-0 @2xl:px-6 @2xl:py-0 @2xl:first:pl-0 @2xl:last:pr-0">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-carbon">
              {formatFicha(ficha, index)}
            </p>
            <h3 className="mb-2 break-words font-display text-2xl uppercase">
              {project.version ? `${project.name} ${project.version}` : project.name}
            </h3>
            <p className="max-w-[65ch] break-words text-base">{copy.items[project.id].description}</p>
          </article>
        ))}
      </div>

      <Link
        href={`${pagePath(lang, 'work')}#projects`}
        data-reveal-item
        className="mt-6 inline-flex min-h-11 items-center gap-1 rounded-lg font-semibold underline underline-offset-4"
      >
        {home.allWork}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
};

export default Featured;
