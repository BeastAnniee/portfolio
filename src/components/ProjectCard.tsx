import { ArrowUpRight } from 'lucide-react';
import type { ProjectFact } from '@/content/facts.ts';
import type { ProjectCopy } from '@/content/types.ts';
import { resolveProjectMedia } from '@/lib/project-view.ts';
import DuoImage from './DuoImage';
import TechChips from './TechChips';

interface ProjectCardProps {
  project: ProjectFact;
  copy: ProjectCopy;
  techLabels: Record<string, string>;
  resultLabel: string;
  openLabel: string;
  /** `inverted`: sobre bone con texto carbon. `row`: fila del Lab (sin caja); su imagen es `lab-inline`. */
  variant: 'inverted' | 'row';
  /** Microtexto de ficha («PROJ. 01»). */
  ficha: string;
  className?: string;
}

const ProjectCard = ({
  project,
  copy,
  techLabels,
  resultLabel,
  openLabel,
  variant,
  ficha,
  className = '',
}: ProjectCardProps) => {
  const { image, href } = resolveProjectMedia(project);
  const title = project.version ? `${project.name} ${project.version}` : project.name;
  const inverted = variant === 'inverted';

  return (
    <article
      className={`flex min-w-0 flex-col ${inverted ? 'text-carbon' : 'text-bone'} ${className}`}
    >
      {image && (
        <DuoImage
          src={image}
          alt=""
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`mb-4 aspect-[16/9] rounded-lg ${inverted ? '' : 'lab-inline w-full max-w-xs'}`}
        />
      )}
      <p className={`mb-2 font-mono text-xs uppercase tracking-[0.12em] ${inverted ? 'text-carbon' : 'text-bone-2'}`}>
        {ficha}
      </p>
      <h3 className="mb-2 break-words font-display text-2xl uppercase">{title}</h3>
      <p className="mb-4 max-w-[65ch] break-words text-base">{copy.description}</p>
      {copy.result && (
        <p className="mb-4 max-w-[65ch] break-words text-base">
          <span className="font-semibold">{resultLabel}: </span>
          {copy.result}
        </p>
      )}
      <div className="mt-auto flex flex-col gap-4">
        <TechChips items={project.tech} labels={techLabels} inverted={inverted} />
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${openLabel}: ${title}`}
            className={`inline-flex min-h-11 w-fit items-center gap-1 rounded-lg font-semibold underline underline-offset-4 ${
              inverted ? 'text-carbon' : 'text-accent hover:text-bone'
            }`}
          >
            {openLabel}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
};

export default ProjectCard;
