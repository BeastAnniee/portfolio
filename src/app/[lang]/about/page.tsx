import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageIntro from '@/components/PageIntro';
import Experience from '@/components/Experience';
import Achievements from '@/components/Achievements';
import Education from '@/components/Education';
import Contact from '@/components/Contact';
import PageMotion from '@/components/PageMotion';
import { isLocale } from '@/lib/locale.ts';
import { buildMetadata } from '@/lib/metadata.ts';
import { getDictionary } from '@/content/index.ts';
import { facts } from '@/content/facts.ts';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return buildMetadata(lang, getDictionary(lang), 'about');
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <main className="w-full pt-16">
      <PageMotion />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <PageIntro page="about" copy={dict.pages} />
        <Experience page="about" copy={dict.experience} techLabels={dict.techLabels} ficha={dict.ficha.exp} />
        <Achievements page="about" copy={dict.achievements} ficha={dict.ficha.ach} />
        <Education page="about" copy={dict.education} ficha={dict.ficha.edu} />
      </div>
      <Contact page="about" copy={dict.contact} email={facts.profile.email} />
    </main>
  );
}
