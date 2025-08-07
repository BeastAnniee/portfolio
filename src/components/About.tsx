'use client';

import { motion } from 'framer-motion';

const About = () => {
  const technologies = [
    'JavaScript (ES6+)',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Express',
    'MongoDB',
    'PostgreSQL',
    'Tailwind CSS',
    'Framer Motion',
    'Git & GitHub',
    'Docker'
  ];

  return (
    <section id="about" className="min-h-screen py-24 px-6 lg:px-8 bg-[#0a192f]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="text-[#64ffda] font-mono text-xl">01.</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#ccd6f6]">About Me</h2>
          <div className="flex-1 h-px bg-[#233554] ml-4"></div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 items-start">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="md:col-span-2 space-y-4"
          >
            <p className="text-[#8892b0] text-lg leading-relaxed">
              Hello! My name is Aldair and I enjoy creating things that live on the internet. 
              My interest in web development started back in 2020 when I decided to try editing 
              custom Tumblr themes — turns out hacking together a custom reblog button taught me 
              a lot about HTML & CSS!
            </p>
            
            <p className="text-[#8892b0] text-lg leading-relaxed">
              Fast-forward to today, and I&apos;ve had the privilege of working at an advertising agency, 
              a start-up, a huge corporation, and a student-led design studio. My main focus these days 
              is building accessible, inclusive products and digital experiences at Upstatement for a 
              variety of clients.
            </p>
            
            <p className="text-[#8892b0] text-lg leading-relaxed">
              I also recently launched a course that covers everything you need to build a web app 
              with the Spotify API using Node & React.
            </p>
            
            <p className="text-[#8892b0] text-lg leading-relaxed">
              Here are a few technologies I&apos;ve been working with recently:
            </p>
            
            {/* Technologies Grid */}
            <div className="grid grid-cols-2 gap-2 mt-6">
              {technologies.map((tech, index) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  className="flex items-center gap-2 text-[#8892b0] font-mono text-sm"
                >
                  <span className="text-[#64ffda]">▹</span>
                  <span>{tech}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative group hidden md:block"
          >
            <div className="relative">
              {/* Image placeholder */}
              <div className="w-full aspect-square bg-[#64ffda]/20 rounded border-2 border-[#64ffda] relative overflow-hidden">
                <div className="absolute inset-0 bg-[#64ffda]/10 flex items-center justify-center">
                  <span className="text-[#64ffda] font-mono text-lg">Profile Photo</span>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#64ffda]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Border effect */}
              <div className="absolute -inset-4 border-2 border-[#64ffda] rounded -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
