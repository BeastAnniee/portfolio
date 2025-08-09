'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import Particles from './Particles';

import { useState } from 'react';

const Hero = () => {
  const [showCopied, setShowCopied] = useState(false);
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('jostinaval@gmail.com');
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2500);
  }
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Particles Background */}
      <div className="absolute inset-0">
        <Particles
          particleCount={200}
          particleSpread={10}
          speed={0.08}
          particleColors={['#64ffda', '#ffffff', '#8892b0']}
          moveParticlesOnHover={true}
          particleHoverFactor={0.8}
          alphaParticles={false}
          particleBaseSize={120}
          sizeRandomness={1.2}
          cameraDistance={20}
          className="w-full h-full"
        />
      </div>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0a192f]/90"></div>
      
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-left max-w-4xl">
          {/* Greeting */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[#64ffda] font-mono text-base sm:text-lg mb-5"
          >
            Hi, my name is
          </motion.p>
          
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#ccd6f6] mb-2 leading-tight"
          >
            Aldair.
          </motion.h1>
          
          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#8892b0] mb-6 leading-tight"
          >
            Coding with purpose.
          </motion.h2>
          
          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-[#8892b0] text-lg max-w-2xl mb-12 leading-relaxed"
          >
            Junior software developer focused on accesible digital products. 
            Specialized in frontend development with React, Typescript and Next.js.
            Also experienced in Python for scripting, automation, and data solutions.
          </motion.p>
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <motion.a
              href="#projects"
              className="inline-block px-7 py-4 border border-[#64ffda] text-[#64ffda] font-mono text-sm rounded bg-transparent hover:bg-[#64ffda]/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Check out my work!
            </motion.a>
          </motion.div>
        </div>
      </div>
      
      {/* Social Links - Fixed Position */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="fixed left-10 bottom-0 hidden lg:flex flex-col items-center gap-6 z-20"
      >
        <motion.a
          href="https://github.com/BeastAnniee"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8892b0] hover:text-[#64ffda] hover:-translate-y-1 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
        >
          <Github className="w-5 h-5" />
        </motion.a>
        
        <motion.a
          href="https://linkedin.com/in/jostin-aldair-nava-l%C3%B3pez-437986320/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8892b0] hover:text-[#64ffda] hover:-translate-y-1 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
        >
          <Linkedin className="w-5 h-5" />
        </motion.a>
        
        <motion.button
          onClick={handleCopyEmail}
          className="text-[#8892b0] hover:text-[#64ffda] hover:-translate-y-1 transition-all duration-300 focus:outline-none"
          whileHover={{ scale: 1.1 }}
          aria-label="Copiar correo electrónico"
        >
          <Mail className="w-5 h-5" />
        </motion.button>
        
        <div className="w-px h-24 bg-[#8892b0] mt-6"></div>
      </motion.div>
      
      {/* Email - Fixed Position */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="fixed right-10 bottom-0 hidden lg:flex flex-col items-center gap-6 z-20"
      >
        <motion.button
          onClick={handleCopyEmail}
          className="text-[#8892b0] hover:text-[#64ffda] font-mono text-sm tracking-widest hover:-translate-y-1 transition-all duration-300 focus:outline-none"
          style={{ writingMode: 'vertical-rl' }}
          whileHover={{ scale: 1.05 }}
          aria-label="Copiar correo electrónico"
        >
          jostinaval@gmail.com
        </motion.button>
        
        <div className="w-px h-24 bg-[#8892b0] mt-6"></div>
      </motion.div>
      
      {/* Toast Copiado */}
      {showCopied && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-[#233554] text-[#64ffda] px-6 py-3 rounded shadow-lg font-sans text-base z-50 animate-fade-in">
          ¡Correo copiado al portapapeles!
        </div>
      )}
    </section>
  );
};

export default Hero;
