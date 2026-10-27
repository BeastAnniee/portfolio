'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Dictionary } from '@/content/types.ts';
import type { Locale } from '@/lib/locale.ts';
import { nowStatus } from '@/lib/now-status.ts';
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
    <section id="now" aria-labelledby="now-title" className="px-4 py-6 sm:px-6 lg:px-10">
      <SectionHeading id="now-title">{copy.title}</SectionHeading>
      <p className="mb-4 text-sm font-medium text-bento-graphite">
        {label}: <time dateTime={updatedAt}>{date}</time>
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        {cards.map((card) => (
          <li key={card.id} className="min-w-0 rounded-[20px] bg-bento-lilac p-5 sm:p-6">
            <h3 className="mb-2 font-display text-lg font-bold text-bento-black">{card.title}</h3>
            <p className="break-words text-sm leading-relaxed text-bento-black">{card.body}</p>
            {card.href && card.link && (
              <a
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-1 rounded-full text-sm font-semibold text-bento-black underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2 focus-visible:ring-offset-bento-lilac"
              >
                {card.link}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-bento-black">
        <span className="font-semibold">{copy.openTo.label}: </span>
        {copy.openTo.text}
      </p>
    </section>
  );
};

export default Now;
