'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const SignatureBadge = () => {
  const text = 'AVAILABLE FOR WORK • AVAILABLE FOR WORK • ';

  return (
    <div className="relative h-28 w-28 shrink-0" aria-hidden="true">
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <path id="badge-circle-path" d="M 50,50 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0" />
          </defs>
          <text fontSize="7.4" fontWeight={700} letterSpacing="1.5" fill="#000000" className="font-display">
            <textPath href="#badge-circle-path" startOffset="0%">
              {text}
            </textPath>
          </text>
        </svg>
      </motion.div>
      <div className="absolute inset-[22%] flex items-center justify-center rounded-full bg-bento-purple">
        <ArrowUpRight className="h-6 w-6 text-bento-black" />
      </div>
    </div>
  );
};

export default SignatureBadge;
