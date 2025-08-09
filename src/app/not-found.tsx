'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a192f] px-6 py-24">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          className="text-5xl font-bold text-[#64ffda] mb-4"
        >
          404
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="text-2xl font-semibold text-[#ccd6f6] mb-6"
        >
          No resources available for so many demos
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="text-[#8892b0] mb-8 text-center max-w-md"
        >
          Sorry, I can&apos;t provide a live demo for this project because server resources are limited.<br />
          If you are genuinely interested in seeing a demo, feel free to contact me and I&apos;ll gladly share one with you!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
        >
          <Link href="/" className="px-6 py-3 rounded bg-[#64ffda]/10 text-[#64ffda] border border-[#64ffda] font-mono hover:bg-[#64ffda]/20 transition-all">
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
