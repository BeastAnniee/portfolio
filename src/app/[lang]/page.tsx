import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Now from '@/components/Now';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Stack from '@/components/Stack';
import Achievements from '@/components/Achievements';
import Education from '@/components/Education';
import Lab from '@/components/Lab';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { isLocale } from '@/lib/locale.ts';
import { buildMarqueeItems } from '@/lib/marquee.ts';
import { getDictionary, SECTION_IDS } from '@/content/index.ts';
import { facts } from '@/content/facts.ts';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const nowCards = facts.now.cards.map((card) => ({
    id: card.id,
    href: 'href' in card ? card.href : undefined,
    ...dict.now.cards[card.id],
  }));

  return (
    <div className="min-h-screen bg-carbon text-bone">
      <Header
        locale={lang}
        nav={dict.nav}
        brand={dict.nav.brand}
        cvHref={facts.cv[lang]}
        sections={SECTION_IDS}
      />
      <main className="w-full pt-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
          <Hero
            name={facts.profile.name}
            email={facts.profile.email}
            github={facts.profile.github}
            linkedin={facts.profile.linkedin}
            hero={dict.hero}
            common={dict.common}
            sticker={dict.sticker.label}
          />
          <Marquee
            items={buildMarqueeItems(dict, facts)}
            label={dict.marquee.label}
            pause={dict.marquee.pause}
            play={dict.marquee.play}
          />
          <Now locale={lang} updatedAt={facts.now.updatedAt} cards={nowCards} copy={dict.now} />
          <Experience copy={dict.experience} techLabels={dict.techLabels} ficha={dict.ficha.exp} />
          <Projects copy={dict.projects} techLabels={dict.techLabels} ficha={dict.ficha.proj} />
          <Stack copy={dict.stack} techLabels={dict.techLabels} />
          <Achievements copy={dict.achievements} ficha={dict.ficha.ach} />
          <Education copy={dict.education} ficha={dict.ficha.edu} />
          <Lab copy={dict.lab} techLabels={dict.techLabels} ficha={dict.ficha.lab} />
        </div>
        <Contact copy={dict.contact} email={facts.profile.email} />
      </main>
      <Footer
        email={facts.profile.email}
        github={facts.profile.github}
        linkedin={facts.profile.linkedin}
        hero={dict.hero}
        common={dict.common}
        footer={dict.footer}
      />
    </div>
  );
}
