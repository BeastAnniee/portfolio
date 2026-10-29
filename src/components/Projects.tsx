import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import { formatFicha } from '@/lib/ficha.ts';
import ProjectCard from './ProjectCard';
import { formatSectionFicha } from '@/lib/ficha.ts';
import SectionHeading from './SectionHeading';

interface ProjectsProps {
  copy: Dictionary['projects'];
  techLabels: Dictionary['techLabels'];
  /** Etiqueta de ficha («PROJ.»); el número es el índice real en `facts.projects.spotlight`. */
  ficha: string;
}

// Bloque invertido (data-block="bone"): bone/carbon, sin acento ni grises. Con Contact (acento) suman 2, no adyacentes.
const Projects = ({ copy, techLabels, ficha }: ProjectsProps) => (
  <section
    id="projects"
    data-block="bone"
    aria-labelledby="projects-title"
    className="inverted @container my-10 rounded-2xl border border-transparent bg-bone p-5 text-carbon @2xl:p-8"
  >
    <SectionHeading id="projects-title" inverted ficha={formatSectionFicha('projects')}>
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
