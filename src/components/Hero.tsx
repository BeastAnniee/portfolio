'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import SignatureBadge from './SignatureBadge';
import CopyEmailButton from './CopyEmailButton';
import type { Dictionary } from '@/content/types.ts';

interface HeroProps {
  name: string;
  email: string;
  github: string;
  linkedin: string;
  hero: Dictionary['hero'];
  common: Dictionary['common'];
}

const socialClass =
  'flex h-11 w-11 items-center justify-center rounded-full bg-bento-page text-bento-black transition-colors hover:bg-bento-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container';

const Hero = ({ name, email, github, linkedin, hero, common }: HeroProps) => {
  const socialLinks = [
    { name: hero.github, href: github, icon: Github },
    { name: hero.linkedin, href: linkedin, icon: Linkedin },
  ];

  return (
    <section id="hero" className="relative px-4 pt-24 pb-6 sm:px-6 sm:pt-28 lg:px-10 lg:pt-32">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        {/* Intro card */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex min-w-0 flex-col justify-center rounded-[24px] px-2 py-6 sm:px-4 lg:col-span-7"
        >
          <p className="mb-4 text-base text-bento-graphite sm:text-lg">{hero.greeting}</p>

          <h1 className="mb-2 break-words font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-bento-black sm:text-6xl lg:text-7xl">
            {name}
          </h1>

          <p className="mb-6 font-display text-2xl font-bold leading-tight text-bento-purple-deep sm:text-3xl lg:text-4xl">
            {hero.title} <span className="block sm:inline">{hero.qualifier}</span>
          </p>

          <p className="mb-8 max-w-xl text-lg leading-relaxed text-bento-graphite">{hero.summary}</p>

          <div className="flex flex-wrap items-center gap-4">
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bento-purple px-6 py-3 text-sm font-semibold text-bento-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
            >
              {hero.cta}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </motion.a>

            <div className="flex items-center gap-2">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className={socialClass}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </motion.a>
                );
              })}
              <CopyEmailButton email={email} label={common.copyEmail} copiedText={common.emailCopied} />
            </div>
          </div>
        </motion.div>

        {/* Photo card */}
        <motion.div
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative flex items-center justify-center rounded-[24px] bg-bento-container p-6 lg:col-span-5"
        >
          <div className="relative">
            <div
              className="absolute -inset-8 -z-10 translate-x-4 -translate-y-4 rounded-full bg-bento-lilac opacity-70 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative h-56 w-56 overflow-hidden rounded-full bg-bento-page sm:h-64 sm:w-64">
              <Image
                src="/profile.jpg"
                alt={hero.photoAlt}
                fill
                sizes="256px"
                className="object-cover grayscale contrast-[1.1]"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -right-6">
              <SignatureBadge text={hero.badge} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
