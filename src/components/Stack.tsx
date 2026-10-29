import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import { formatSectionFicha } from '@/lib/ficha.ts';
import SectionHeading from './SectionHeading';
import TechChips from './TechChips';

interface StackProps {
  copy: Dictionary['stack'];
  techLabels: Dictionary['techLabels'];
}

const groups = ['development', 'dataAutomation', 'tools'] as const;

const Stack = ({ copy, techLabels }: StackProps) => (
  <section id="stack" aria-labelledby="stack-title" className="@container py-10">
    <SectionHeading id="stack-title" ficha={formatSectionFicha('stack')}>{copy.title}</SectionHeading>
    <div className="grid border-t border-line @2xl:grid-cols-3 @2xl:divide-x @2xl:divide-line">
      {groups.map((group) => (
        <div
          key={group}
          className="min-w-0 border-b border-line py-6 @2xl:border-b-0 @2xl:px-6 @2xl:first:pl-0 @2xl:last:pr-0"
        >
          <h3 className="mb-4 font-display text-2xl uppercase text-bone">{copy.groups[group]}</h3>
          <TechChips items={facts.stack[group]} labels={techLabels} />
        </div>
      ))}
    </div>
  </section>
);

export default Stack;
