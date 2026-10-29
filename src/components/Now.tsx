'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { Dictionary } from '@/content/types.ts';
import type { Locale } from '@/lib/locale.ts';
import { nowStatus } from '@/lib/now-status.ts';
import { formatSectionFicha } from '@/lib/ficha.ts';
import SectionHeading from './SectionHeading';

interface NowCard {
  id: string;
  title: string;
  body: string;
  link?: string;
  href?: string;
}

interface NowProps {
  locale: Locale;
  updatedAt: string;
  cards: NowCard[];
  copy: Dictionary['now'];
}

function formatDate(locale: Locale, updatedAt: string): string | null {
  const date = new Date(`${updatedAt}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}

const Now = ({ locale, updatedAt, cards, copy }: NowProps) => {
  // Estado seguro en el HTML servido; la vigencia se evalúa con la fecha de la visita.
  const [fresh, setFresh] = useState(false);

  useEffect(() => {
    setFresh(nowStatus(updatedAt, new Date()).state === 'fresh');
  }, [updatedAt]);

  const date = formatDate(locale, updatedAt) ?? copy.dateUnavailable;
  const label = fresh ? copy.updated : copy.lastUpdated;

  return (
    <section id="now" aria-labelledby="now-title" className="@container py-10">
      <SectionHeading id="now-title" ficha={formatSectionFicha('now')}>{copy.title}</SectionHeading>
      <p className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-bone-2">
        {!fresh && <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />}
        <span>
          {label}: <time dateTime={updatedAt}>{date}</time>
        </span>
      </p>

      <ul className="grid gap-4 @2xl:grid-cols-2">
        {cards.map((card) => (
          <li key={card.id} className="min-w-0 rounded-xl border border-line bg-carbon-2 p-5 @2xl:p-6">
            <h3 className="mb-2 break-words font-display text-2xl uppercase text-bone">{card.title}</h3>
            <p className="break-words text-base text-bone">{card.body}</p>
            {card.href && card.link && (
              <a
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-lg font-semibold text-accent underline underline-offset-4 hover:text-bone"
              >
                {card.link}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-[65ch] text-base text-bone">
        <span className="font-semibold">{copy.openTo.label}: </span>
        {copy.openTo.text}
      </p>
    </section>
  );
};

export default Now;
