'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bento-page px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex max-w-md flex-col items-center justify-center rounded-[24px] bg-bento-container p-10 text-center"
      >
        <span className="mb-4 font-display text-5xl font-extrabold text-bento-purple">404</span>
        <h1 className="mb-4 font-display text-2xl font-bold text-bento-black">
          No resources available for so many demos
        </h1>
        <p className="mb-8 leading-relaxed text-bento-graphite">
          Sorry, I can&apos;t provide a live demo for this project because server resources are
          limited. If you are genuinely interested in seeing a demo, feel free to contact me and
          I&apos;ll gladly share one with you!
        </p>
        <Link
          href="/"
          className="rounded-full bg-bento-purple px-6 py-3 text-sm font-semibold text-bento-black transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
