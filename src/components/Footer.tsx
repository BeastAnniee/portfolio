'use client';

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/BeastAnniee',
      icon: Github
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/jostin-aldair-nava-l%C3%B3pez-437986320/',
      icon: Linkedin
    },
    {
      name: 'Email',
      url: 'mailto:jostinaval@gmail.com',
      icon: Mail
    }
  ];

  return (
    <footer className="py-16 px-6 lg:px-8 bg-[#0a192f]">
      <div className="max-w-4xl mx-auto">
        {/* Social Links - Mobile Only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center gap-8 mb-8 lg:hidden"
        >
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8892b0] hover:text-[#64ffda] hover:-translate-y-1 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-6 h-6" />
              </motion.a>
            );
          })}
        </motion.div>

        {/* Footer Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-[#8892b0] font-mono text-sm mb-2">
            Designed & Built by Aldair Nava
          </p>
          
          <motion.div
            className="flex items-center justify-center gap-1 text-[#8892b0] text-xs"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <span>Made with</span>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              className="text-[#64ffda]"
            >
              <Heart className="w-3 h-3 fill-current" />
            </motion.div>
            <span>and lots of coffee</span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
