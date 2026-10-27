import type { Dictionary } from '@/content/types.ts';
import { facts } from '@/content/facts.ts';
import SectionHeading from './SectionHeading';
import TechChips from './TechChips';

interface StackProps {
  copy: Dictionary['stack'];
  techLabels: Dictionary['techLabels'];
}

const groups = ['development', 'dataAutomation', 'tools'] as const;

const Stack = ({ copy, techLabels }: StackProps) => (
  <section id="stack" aria-labelledby="stack-title" className="px-4 py-6 sm:px-6 lg:px-10">
    <SectionHeading id="stack-title">{copy.title}</SectionHeading>
    <div className="grid gap-4 md:grid-cols-3 sm:gap-6">
      {groups.map((group) => (
        <div key={group} className="min-w-0 rounded-[20px] bg-bento-page p-5 sm:p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-bento-black">{copy.groups[group]}</h3>
          <TechChips items={facts.stack[group]} labels={techLabels} />
        </div>
      ))}
    </div>
  </section>
);

export default Stack;
