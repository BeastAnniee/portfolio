'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import { useState } from 'react';

const Footer = () => {
  const [showCopied, setShowCopied] = useState(false);
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('jostinaval@gmail.com');
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2500);
  };

  const socialLinks = [
    { name: 'GitHub', url: 'https://github.com/BeastAnniee', icon: Github },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/aldair-nava-dev', icon: Linkedin },
    { name: 'Email', url: '', icon: Mail, isEmail: true },
  ];

  return (
    <footer className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            if (link.isEmail) {
              return (
                <motion.button
                  key={link.name}
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-bento-page text-bento-black transition-colors hover:bg-bento-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
                >
                  <Icon className="h-4 w-4" />
                </motion.button>
              );
            }
            return (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-bento-page text-bento-black transition-colors hover:bg-bento-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
              >
                <Icon className="h-4 w-4" />
              </motion.a>
            );
          })}
        </div>

        <p className="text-sm text-bento-graphite">Designed &amp; built by Aldair Nava</p>
      </div>

      {showCopied && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-bento-black px-6 py-3 text-sm font-medium text-bento-container animate-fade-in">
          Email copied to clipboard!
        </div>
      )}
    </footer>
  );
};

export default Footer;
