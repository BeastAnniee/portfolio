'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

interface CopyEmailButtonProps {
  email: string;
  label: string;
  copiedText: string;
}

const CopyEmailButton = ({ email, label, copiedText }: CopyEmailButtonProps) => {
  const [showCopied, setShowCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return;
    }
    setShowCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShowCopied(false), 2500);
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handleCopy}
        aria-label={label}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-bento-page text-bento-black transition-colors hover:bg-bento-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
      >
        <Mail className="h-5 w-5" aria-hidden="true" />
      </motion.button>
      <div role="status" aria-live="polite">
        {showCopied && (
          <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-bento-black px-6 py-3 text-sm font-medium text-bento-container animate-fade-in">
            {copiedText}
          </div>
        )}
      </div>
    </>
  );
};

export default CopyEmailButton;
