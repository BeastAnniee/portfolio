'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import SignatureBadge from './SignatureBadge';

const Hero = () => {
  const [showCopied, setShowCopied] = useState(false);
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('jostinaval@gmail.com');
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2500);
  };

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/BeastAnniee', icon: Github },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/aldair-nava-dev', icon: Linkedin },
  ];

  return (
    <section className="relative px-4 pt-24 pb-6 sm:px-6 sm:pt-28 lg:px-10 lg:pt-32">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        {/* Intro card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center rounded-[24px] px-2 py-6 sm:px-4 lg:col-span-7"
        >
          <p className="mb-4 text-base text-bento-graphite sm:text-lg">Hi, I&apos;m</p>

          <h1 className="mb-2 font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-bento-black sm:text-6xl lg:text-7xl">
            Aldair Nava
          </h1>

          <h2 className="mb-6 font-display text-2xl font-bold leading-tight text-bento-purple-deep sm:text-3xl lg:text-4xl">
            Data Analyst &amp; Automation Developer.
          </h2>

          <p className="mb-8 max-w-xl text-lg leading-relaxed text-bento-graphite">
            I build end-to-end data solutions — from extraction and cleaning to
            automated pipelines and BI dashboards adopted across commercial, finance,
            and leadership teams. I use React and Next.js to turn that data work into
            tools people actually use, not just notebooks.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-bento-purple px-6 py-3 text-sm font-semibold text-bento-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
            >
              Check out my work
              <ArrowUpRight className="h-4 w-4" />
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
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-bento-page text-bento-black transition-colors hover:bg-bento-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}

              <motion.button
                onClick={handleCopyEmail}
                aria-label="Copy email address"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-bento-page text-bento-black transition-colors hover:bg-bento-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
              >
                <Mail className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Photo card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
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
                alt="Aldair Nava"
                fill
                sizes="256px"
                className="object-cover grayscale contrast-[1.1]"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -right-6">
              <SignatureBadge />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast Copiado */}
      {showCopied && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-bento-black px-6 py-3 text-sm font-medium text-bento-container animate-fade-in">
          Email copied to clipboard!
        </div>
      )}
    </section>
  );
};

export default Hero;
