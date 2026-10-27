import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
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
    <div className="min-h-screen bg-bento-page overflow-x-hidden">
      <Header
        locale={lang}
        nav={dict.nav}
        brand={dict.nav.brand}
        cvHref={facts.cv[lang]}
        sections={SECTION_IDS}
      />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        <div className="rounded-[32px] bg-bento-container sm:rounded-[40px] overflow-hidden">
          <Hero
            name={facts.profile.name}
            email={facts.profile.email}
            github={facts.profile.github}
            linkedin={facts.profile.linkedin}
            hero={dict.hero}
            common={dict.common}
          />
          <Now locale={lang} updatedAt={facts.now.updatedAt} cards={nowCards} copy={dict.now} />
          <Experience copy={dict.experience} techLabels={dict.techLabels} />
          <Projects copy={dict.projects} techLabels={dict.techLabels} />
          <Stack copy={dict.stack} techLabels={dict.techLabels} />
          <Achievements copy={dict.achievements} />
          <Education copy={dict.education} />
          <Lab copy={dict.lab} techLabels={dict.techLabels} />
          <Contact copy={dict.contact} email={facts.profile.email} />
          <Footer
            email={facts.profile.email}
            github={facts.profile.github}
            linkedin={facts.profile.linkedin}
            hero={dict.hero}
            common={dict.common}
            footer={dict.footer}
          />
        </div>
      </main>
    </div>
  );
}
