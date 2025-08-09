'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'About', href: '#about', number: '01' },
    { name: 'Projects', href: '#projects', number: '02' },
    { name: 'Contact', href: '#contact', number: '03' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ y: -25, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, delay: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden lg:block ${
        isScrolled 
          ? 'bg-[#0a192f]/95 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
            >
              <span className="text-2xl font-bold">
                <span className="text-[#ccd6f6]">aldair</span>
                <span className="text-[#64ffda]">.</span>
              </span>
            </motion.div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection(item.href)}
                className="flex items-center gap-2 text-[#ccd6f6] hover:text-[#64ffda] transition-all duration-300 font-mono text-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.1 + index * 0.1 }}
              >
                <span className="text-[#64ffda] text-xs">{item.number}.</span>
                <span>{item.name}</span>
              </motion.button>
            ))}
            
            <motion.a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 px-4 py-2 border border-[#64ffda] text-[#64ffda] font-mono text-sm rounded hover:bg-[#64ffda]/10 transition-all duration-300"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.1 + navItems.length * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Resume
            </motion.a>
          </nav>

        </div>
      </div>
    </motion.header>
  );
};

export default Header; 