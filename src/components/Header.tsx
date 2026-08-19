'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-4 left-1/2 z-50 hidden -translate-x-1/2 lg:block"
    >
      <div
        className={`flex items-center gap-8 rounded-full border border-black/5 px-6 py-3 transition-all duration-300 ${
          isScrolled ? 'bg-bento-container/90 shadow-sm backdrop-blur-md' : 'bg-bento-container/60 backdrop-blur-md'
        }`}
      >
        <span className="text-lg font-extrabold font-display tracking-tight text-bento-black">
          aldair<span className="text-bento-purple">.</span>
        </span>

        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.href)}
              className="rounded-full text-sm font-medium text-bento-graphite transition-colors duration-200 hover:text-bento-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
            >
              {item.name}
            </button>
          ))}

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-bento-purple px-4 py-1.5 text-sm font-semibold text-bento-black transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
          >
            Resume
          </a>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
