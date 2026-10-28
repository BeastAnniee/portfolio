'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import { formatFicha } from '@/lib/ficha.ts';
import ProjectCard from './ProjectCard';
import SectionHeading from './SectionHeading';

interface LabProps {
  copy: Dictionary['lab'];
  techLabels: Dictionary['techLabels'];
  /** Etiqueta de ficha («LAB»); el número es el índice real en `facts.projects.lab`. */
  ficha: string;
}

const Lab = ({ copy, techLabels, ficha }: LabProps) => {
  const [open, setOpen] = useState(false);

  return (
    <section id="lab" aria-labelledby="lab-title" className="@container py-10">
      <SectionHeading id="lab-title">{copy.title}</SectionHeading>
      <p className="mb-4 max-w-[65ch] text-base text-bone">{copy.intro}</p>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="lab-panel"
        onClick={() => setOpen((value) => !value)}
        className="mb-6 inline-flex min-h-12 items-center gap-2 rounded-xl border border-line px-5 font-semibold text-bone hover:bg-bone hover:text-carbon"
      >
        {open ? copy.hide : copy.show}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div id="lab-panel" hidden={!open}>
        <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {facts.projects.lab.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              copy={copy.items[project.id]}
              techLabels={techLabels}
              resultLabel=""
              openLabel={copy.openProject}
              variant="module"
              ficha={formatFicha(ficha, index)}
              className="duo-trigger"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Lab;
