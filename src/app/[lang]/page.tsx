import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Hero from '@/components/Hero';
import LegacyAnchors from '@/components/LegacyAnchors';
import Marquee from '@/components/Marquee';
import Featured from '@/components/Featured';
import Numbers from '@/components/Numbers';
import Stack from '@/components/Stack';
import Contact from '@/components/Contact';
import NextBand from '@/components/NextBand';
import PageMotion from '@/components/PageMotion';
import { isLocale } from '@/lib/locale.ts';
import { buildMarqueeItems } from '@/lib/marquee.ts';
import { buildMetadata } from '@/lib/metadata.ts';
import { getDictionary } from '@/content/index.ts';
import { pagePath } from '@/content/pages.ts';
import { facts } from '@/content/facts.ts';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return buildMetadata(lang, getDictionary(lang), 'home');
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <main className="w-full pt-16">
      <PageMotion />
      <LegacyAnchors lang={lang} />
      <Hero
        name={facts.profile.name}
        email={facts.profile.email}
        github={facts.profile.github}
        linkedin={facts.profile.linkedin}
        hero={dict.hero}
        common={dict.common}
        sticker={dict.sticker.label}
        ctaHref={pagePath(lang, 'work')}
      />
      <Marquee items={buildMarqueeItems(dict, facts)} label={dict.marquee.label} />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <Featured lang={lang} copy={dict.projects} home={dict.home} ficha={dict.ficha.proj} />
        <Numbers lang={lang} copy={dict.experience} home={dict.home} />
        <Stack page="home" copy={dict.stack} techLabels={dict.techLabels} />
        {/* Aire entre el filete de la banda y el borde rasgado de Contact (el bloque sube 48 px al revelarse). */}
        <div className="pb-12 sm:pb-20">
          <NextBand lang={lang} from="home" next={dict.next} pages={dict.pages} />
        </div>
      </div>
      <Contact page="home" copy={dict.contact} email={facts.profile.email} />
    </main>
  );
}
