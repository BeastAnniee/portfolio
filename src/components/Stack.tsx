import type { Dictionary } from '@/content/types.ts';
import type { PageId } from '@/content/pages.ts';
import { facts } from '@/content/facts.ts';
import { formatPageSectionFicha } from '@/lib/ficha.ts';
import SectionHeading from './SectionHeading';
import TechChips from './TechChips';

interface StackProps {
  /** Página que la monta: la ficha numera por posición dentro de ella. */
  page: PageId;
  copy: Dictionary['stack'];
  techLabels: Dictionary['techLabels'];
}

const groups = ['development', 'dataAutomation', 'tools'] as const;

const Stack = ({ copy, techLabels, page }: StackProps) => (
  <section id="stack" aria-labelledby="stack-title" className="@container py-8 md:py-10">
    <div className="relative mb-8 h-6" aria-hidden="true">
      <div className="tex tex-dots-bone" aria-hidden="true" />
    </div>
    <SectionHeading id="stack-title" ficha={formatPageSectionFicha(page, 'stack')}>{copy.title}</SectionHeading>
    <div className="grid border-t border-line @2xl:grid-cols-3">
      {groups.map((group, index) => (
        <div
          key={group}
          data-reveal-item
          className="relative min-w-0 border-b border-line py-6 @2xl:border-b-0 @2xl:px-6 @2xl:first:pl-0 @2xl:last:pr-0"
        >
          {index > 0 && (
            <span className="pointer-events-none absolute inset-y-0 left-0 hidden w-px @2xl:block" aria-hidden="true">
              <span className="rule-y block h-full" />
            </span>
          )}
          <h3 className="mb-4 font-display text-2xl uppercase text-bone">{copy.groups[group]}</h3>
          <TechChips items={facts.stack[group]} labels={techLabels} />
        </div>
      ))}
    </div>
  </section>
);

export default Stack;
