import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageIntro from '@/components/PageIntro';
import Projects from '@/components/Projects';
import Lab from '@/components/Lab';
import Now from '@/components/Now';
import NextBand from '@/components/NextBand';
import PageMotion from '@/components/PageMotion';
import { isLocale } from '@/lib/locale.ts';
import { buildMetadata } from '@/lib/metadata.ts';
import { getDictionary } from '@/content/index.ts';
import { facts } from '@/content/facts.ts';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return buildMetadata(lang, getDictionary(lang), 'work');
}

export default async function WorkPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const nowCards = facts.now.cards.map((card) => ({
    id: card.id,
    href: 'href' in card ? card.href : undefined,
    ...dict.now.cards[card.id],
  }));

  return (
    <main className="w-full pt-16">
      <PageMotion />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <PageIntro page="work" copy={dict.pages} />
        <Projects page="work" copy={dict.projects} techLabels={dict.techLabels} ficha={dict.ficha.proj} />
        <Now page="work" locale={lang} updatedAt={facts.now.updatedAt} cards={nowCards} copy={dict.now} />
        <Lab page="work" copy={dict.lab} techLabels={dict.techLabels} ficha={dict.ficha.lab} />
        <NextBand lang={lang} from="work" next={dict.next} pages={dict.pages} />
      </div>
    </main>
  );
}
