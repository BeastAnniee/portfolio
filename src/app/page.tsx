'use client';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-bento-page overflow-x-hidden">
      <Header />
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        <div className="rounded-[32px] bg-bento-container sm:rounded-[40px] overflow-hidden">
          <Hero />
          <About />
          <Projects />
          <Contact />
          <Footer />
        </div>
      </main>
    </div>
  );
}
