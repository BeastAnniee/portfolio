import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import ProjectCard from './ProjectCard';
import SectionHeading from './SectionHeading';

interface ProjectsProps {
  copy: Dictionary['projects'];
  techLabels: Dictionary['techLabels'];
}

const tones = ['bg-bento-purple-deep', 'bg-bento-mint', 'bg-bento-amber'];

const Projects = ({ copy, techLabels }: ProjectsProps) => (
  <section id="projects" aria-labelledby="projects-title" className="px-4 py-6 sm:px-6 lg:px-10">
    <SectionHeading id="projects-title">{copy.title}</SectionHeading>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-6">
      {facts.projects.spotlight.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          copy={copy.items[project.id]}
          techLabels={techLabels}
          resultLabel={copy.result}
          openLabel={copy.openProject}
          tone={tones[index % tones.length]}
        />
      ))}
    </div>
  </section>
);

export default Projects;
