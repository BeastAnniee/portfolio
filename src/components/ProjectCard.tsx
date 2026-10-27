import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { ProjectFact } from '@/content/facts.ts';
import type { ProjectCopy } from '@/content/types.ts';
import { resolveProjectMedia } from '@/lib/project-view.ts';
import TechChips from './TechChips';

interface ProjectCardProps {
  project: ProjectFact;
  copy: ProjectCopy;
  techLabels: Record<string, string>;
  resultLabel: string;
  openLabel: string;
  tone: string;
}

const ProjectCard = ({ project, copy, techLabels, resultLabel, openLabel, tone }: ProjectCardProps) => {
  const { image, href } = resolveProjectMedia(project);
  const title = project.version ? `${project.name} ${project.version}` : project.name;

  return (
    <article className={`flex min-w-0 flex-col rounded-[20px] p-5 sm:p-6 ${tone}`}>
      {image && (
        <div className="relative mb-4 h-40 w-full overflow-hidden rounded-[14px]">
          <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
      )}
      <h3 className="mb-2 break-words font-display text-xl font-bold text-bento-black">{title}</h3>
      <p className="mb-4 break-words text-sm leading-relaxed text-bento-black">{copy.description}</p>
      {copy.result && (
        <p className="mb-4 break-words text-sm text-bento-black">
          <span className="font-semibold">{resultLabel}: </span>
          {copy.result}
        </p>
      )}
      <div className="mt-auto flex flex-col gap-4">
        <TechChips items={project.tech} labels={techLabels} />
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${openLabel}: ${title}`}
            className="inline-flex min-h-11 w-fit items-center gap-1 rounded-full text-sm font-semibold text-bento-black underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2"
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
