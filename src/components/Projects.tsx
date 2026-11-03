import type { Dictionary } from '@/content/types.ts';
import type { PageId } from '@/content/pages.ts';
import { facts } from '@/content/facts.ts';
import { formatFicha } from '@/lib/ficha.ts';
import ProjectCard from './ProjectCard';
import { formatPageSectionFicha } from '@/lib/ficha.ts';
import { Checker } from './Ornaments';
import SectionHeading from './SectionHeading';

interface ProjectsProps {
  /** Página que la monta: la ficha numera por posición dentro de ella. */
  page: PageId;
  copy: Dictionary['projects'];
  techLabels: Dictionary['techLabels'];
  /** Etiqueta de ficha («PROJ.»); el número es el índice real en `facts.projects.spotlight`. */
  ficha: string;
}

// Bloque invertido (data-block="bone"): bone/carbon, sin acento ni grises. Con Contact (acento) suman 2, no adyacentes.
const Projects = ({ copy, techLabels, ficha, page }: ProjectsProps) => (
  <section
    id="projects"
    data-block="bone"
    data-reveal-item
    aria-labelledby="projects-title"
    className="inverted @container relative my-10 rounded-2xl border border-transparent bg-bone p-5 text-carbon @2xl:p-8"
  >
    <div className="pointer-events-none absolute right-5 top-2 text-carbon @2xl:right-8 @2xl:top-5">
      <Checker size={72} />
    </div>
    <SectionHeading id="projects-title" inverted ficha={formatPageSectionFicha(page, 'projects')}>
      {copy.title}
    </SectionHeading>
    <div className="grid grid-cols-1 divide-y divide-carbon @2xl:grid-cols-2 @2xl:divide-x @2xl:divide-y-0">
      {facts.projects.spotlight.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          copy={copy.items[project.id]}
          techLabels={techLabels}
          resultLabel={copy.result}
          openLabel={copy.openProject}
          variant="inverted"
          ficha={formatFicha(ficha, index)}
          className="py-6 first:pt-0 last:pb-0 @2xl:px-6 @2xl:py-0 @2xl:first:pl-0 @2xl:last:pr-0"
        />
      ))}
    </div>
  </section>
);

export default Projects;
