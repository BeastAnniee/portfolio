'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import ProjectCard from './ProjectCard';
import SectionHeading from './SectionHeading';

interface LabProps {
  copy: Dictionary['lab'];
  techLabels: Dictionary['techLabels'];
}

const tones = ['bg-bento-mint', 'bg-bento-amber', 'bg-bento-lilac', 'bg-bento-purple'];

const Lab = ({ copy, techLabels }: LabProps) => {
  const [open, setOpen] = useState(false);

  return (
    <section id="lab" aria-labelledby="lab-title" className="px-4 py-6 sm:px-6 lg:px-10">
      <SectionHeading id="lab-title">{copy.title}</SectionHeading>
      <p className="mb-4 text-sm text-bento-graphite">{copy.intro}</p>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="lab-panel"
        onClick={() => setOpen((value) => !value)}
        className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-bento-page px-5 text-sm font-semibold text-bento-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
      >
        {open ? copy.hide : copy.show}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div id="lab-panel" hidden={!open}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {facts.projects.lab.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              copy={copy.items[project.id]}
              techLabels={techLabels}
              resultLabel=""
              openLabel={copy.openProject}
              tone={tones[index % tones.length]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Lab;
