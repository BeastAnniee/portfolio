'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import { formatFicha, formatSectionFicha } from '@/lib/ficha.ts';
import { anchorOffset, previewOffset, shouldPreview } from '@/lib/lab-preview.ts';
import { resolveProjectMedia } from '@/lib/project-view.ts';
import ProjectCard from './ProjectCard';
import SectionHeading from './SectionHeading';

interface LabProps {
  copy: Dictionary['lab'];
  techLabels: Dictionary['techLabels'];
  /** Etiqueta de ficha («LAB»); el número es el índice real en `facts.projects.lab`. */
  ficha: string;
}

const previews = facts.projects.lab.flatMap((project) => {
  const { image } = resolveProjectMedia(project);
  return image ? [{ id: project.id, image }] : [];
});

const Lab = ({ copy, techLabels, ficha }: LabProps) => {
  const [open, setOpen] = useState(false);
  // Vista previa solo con cursor real y sin reduced-motion; si no, la imagen está en la propia fila.
  const [preview, setPreview] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hover = window.matchMedia('(hover: hover)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPreview(shouldPreview({ hover: hover.matches, reducedMotion: reduced.matches }));
    update();
    hover.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      hover.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, []);

  const show = (row: Element | null, offset: (list: DOMRect, previewHeight: number) => number) => {
    const list = listRef.current;
    const card = previewRef.current;
    const id = row instanceof HTMLElement ? row.dataset.labId ?? null : null;
    if (!list || !card) return;
    card.style.setProperty('--y', `${offset(list.getBoundingClientRect(), card.offsetHeight)}px`);
    setActiveId(id && previews.some((p) => p.id === id) ? id : null);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLOListElement>) => {
    if (!preview) return;
    const row = (event.target as Element).closest('[data-lab-row]');
    show(row, (list, previewHeight) =>
      previewOffset({ pointerY: event.clientY, listTop: list.top, listHeight: list.height, previewHeight }),
    );
  };

  const onFocus = (event: React.FocusEvent<HTMLOListElement>) => {
    if (!preview) return;
    const row = (event.target as Element).closest('[data-lab-row]');
    show(row, (list, previewHeight) =>
      anchorOffset({
        rowTop: row?.getBoundingClientRect().top ?? list.top,
        listTop: list.top,
        listHeight: list.height,
        previewHeight,
      }),
    );
  };

  return (
    <section id="lab" aria-labelledby="lab-title" className="@container py-10">
      <SectionHeading id="lab-title" ficha={formatSectionFicha('lab')}>{copy.title}</SectionHeading>
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

      <div id="lab-panel" hidden={!open} data-preview={preview ? '' : undefined} className="relative">
        <ol
          ref={listRef}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActiveId(null)}
          onFocus={onFocus}
          onBlur={(event) => {
            if (!listRef.current?.contains(event.relatedTarget as Node | null)) setActiveId(null);
          }}
          className={preview ? '@3xl:pr-64' : ''}
        >
          {facts.projects.lab.map((project, index) => (
            <li
              key={project.id}
              data-lab-row
              data-lab-id={project.id}
              className="min-w-0 break-words border-t border-line py-6"
            >
              <ProjectCard
                project={project}
                copy={copy.items[project.id]}
                techLabels={techLabels}
                resultLabel=""
                openLabel={copy.openProject}
                variant="row"
                ficha={formatFicha(ficha, index)}
                className="duo-trigger"
              />
            </li>
          ))}
        </ol>

        {/* Miniatura decorativa en la columna reservada de la derecha: solo se mueve en vertical. */}
        <div
          ref={previewRef}
          className="lab-preview pointer-events-none absolute right-0 top-0 w-60"
          style={{ transform: 'translateY(var(--y, 0px))', opacity: activeId ? 1 : 0 }}
          aria-hidden="true"
        >
          <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-carbon-2">
            {previews.map((item) => (
              <Image
                key={item.id}
                src={item.image}
                alt=""
                fill
                sizes="240px"
                className={`object-cover ${activeId === item.id ? '' : 'hidden'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Lab;
