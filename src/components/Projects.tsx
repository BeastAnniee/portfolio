'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, Github, Folder } from 'lucide-react';

const Projects = () => {
  const featuredProjects = [
    {
      title: 'Archive',
      description: 'Web platform for STEAM students to upload, document, and showcase academic projects. Helps build a professional portfolio with categories, charts, and community sharing.',
      tech: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB'],
      github: 'https://github.com/BeastAnniee/archive',
      external: '/demo',
      image: '/404.png'
    },
    {
      title: 'Bitlytics',
      description: 'Fullstack app for real-time cryptocurrency tracking and analysis. Python backend fetches and processes data from the Coinlore API. React frontend displays an interactive dashboard with dynamic charts, stats, and filters.',
      tech: ['React', 'Next.js', 'Python', 'Coinlore API'],
      github: 'https://github.com/BeastAnniee/bitlytics',
      external: '/demo',
      image: '/404.png'
    },
    {
      title: 'Portfolio',
      description: 'A personal portfolio showcasing selected projects and ideas — built with Next.js, Tailwind CSS, and TypeScript. Focused on purposeful design and clean code.',
      tech: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      github: 'https://github.com/BeastAnniee/portfolio',
      external: 'https://aldairdev.vercel.app/',
      image: '/portfolio.png'
    }
  ];

  const otherProjects = [
    {
      title: 'Curve Fitting and Interpolation',
      description: 'Scripts demonstrating curve fitting and interpolation techniques',
      tech: ['Python', 'NumPy', 'Sympy', 'Matplotlib', 'Pandas'],
      github: 'https://github.com/BeastAnniee/curve-fitting-and-interpolation',
      external: '/demo'
    },
    {
      title: 'Numerical Methods',
      description: 'Practice and apply numerical methods across topics',
      tech: ['Python', 'NumPy', 'Matplotlib'],
      github: 'https://github.com/BeastAnniee/numerical-methods',
      external: '/demo'
    },
    {
      title: 'Blackjack Console Game',
      description: 'Blackjack game built with Python',
      tech: ['Python', 'Matplotlib'],
      github: 'https://github.com/BeastAnniee/blackjack-console',
      external: '/demo'
    },
    {
      title: 'Equation Root Finding',
      description: 'Implementation of various numerical methods to solve nonlinear equations',
      tech: ['Python', 'NumPy', 'Sympy', 'Matplotlib', 'Pandas'],
      github: 'https://github.com/BeastAnniee/equation-root-finding',
      external: '/demo'
    },
    {
      title: 'Python Basics and Physics',
      description: 'Implementation of various numerical methods to solve nonlinear equations',
      tech: ['Python', 'Matplotlib'],
      github: 'https://github.com/BeastAnniee/python-basics-and-physics',
      external: '/demo'
    },
    {
      title: 'Fortran Basics and Physics',
      description: 'A set of beginner and intermediate Fortran programs',
      tech: ['Fortran'],
      github: 'https://github.com/BeastAnniee/fortran-basics-and-physics',
      external: '/demo'
    }
  ];

  return (
    <section id="projects" className="py-24 px-6 lg:px-8 bg-[#0a192f]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-center gap-4 mb-16"
        >
          <span className="text-[#64ffda] font-mono text-xl">02.</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#ccd6f6]">Some Things I&apos;ve Built</h2>
          <div className="flex-1 h-px bg-[#233554] ml-4"></div>
        </motion.div>

        {/* Featured Projects */}
        <div className="space-y-24 mb-32">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="space-y-6 md:space-y-0"
            >
              {/* Mobile Layout: Title/Subtitle First */}
              <div className="md:hidden space-y-2">
                <p className="text-[#64ffda] font-mono text-sm">Featured Project</p>
                <h3 className="text-2xl font-bold text-[#ccd6f6]">
                  {project.title}
                </h3>
              </div>

              {/* Desktop Grid Layout */}
              <div className={`hidden md:grid md:grid-cols-12 gap-4 items-center ${
                index % 2 === 1 ? 'md:text-right' : ''
              }`}>
                {/* Project Image - Desktop */}
                <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="relative group">
                    <motion.div
                      whileHover={{ scale: 1.04, y: -6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="bg-[#64ffda]/20 aspect-video rounded border border-[#64ffda]/30 overflow-hidden relative cursor-pointer"
                    >
                      <Image
                        src={project.image}
                        alt={project.title + ' preview'}
                        fill
                        className="object-cover w-full h-full"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Project Info - Desktop */}
                <div className={`md:col-span-5 ${index % 2 === 1 ? 'md:order-1 md:text-right' : ''} space-y-4`}>
                  <p className="text-[#64ffda] font-mono text-sm">Featured Project</p>
                  <h3 className="text-2xl font-bold text-[#ccd6f6] group-hover:text-[#64ffda] transition-colors">
                    {project.title}
                  </h3>
                
                <div className={`bg-[#112240] p-6 rounded shadow-lg ${
                  index % 2 === 1 ? 'md:-mr-12' : 'md:-ml-12'
                } relative z-10`}>
                  <p className="text-[#8892b0] leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <ul className={`flex flex-wrap gap-4 font-mono text-sm text-[#8892b0] ${
                  index % 2 === 1 ? 'md:justify-end' : ''
                }`}>
                  {project.tech.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>

                <div className={`flex gap-3 ${index % 2 === 1 ? 'md:justify-end' : ''}`}>
                  <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-[#64ffda] text-[#64ffda] font-mono text-sm rounded hover:bg-[#64ffda]/10 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Github className="w-4 h-4" />
                    <span>Code</span>
                  </motion.a>
                  <motion.a
                    href={project.external}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#64ffda] text-[#0a192f] font-mono text-sm rounded hover:bg-[#64ffda]/90 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Demo</span>
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Mobile Layout: Image and Info */}
            <div className="md:hidden space-y-4">
              {/* Project Image - Mobile */}
              <div className="relative group">
                <div className="bg-[#64ffda]/20 aspect-video rounded border border-[#64ffda]/30 overflow-hidden relative">
                  <Image
                    src={project.image}
                    alt={project.title + ' preview'}
                    fill
                    className="object-cover w-full h-full"
                    sizes="100vw"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-[#0a192f]/20 group-hover:bg-transparent transition-all duration-300"></div>
                </div>
              </div>

              {/* Project Info - Mobile */}
              <div className="space-y-4">
                <div className="bg-[#112240] p-6 rounded shadow-lg">
                  <p className="text-[#8892b0] leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <ul className="flex flex-wrap gap-4 font-mono text-sm text-[#8892b0]">
                  {project.tech.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>

                <div className="flex gap-3">
                  <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 border border-[#64ffda] text-[#64ffda] font-mono text-sm rounded hover:bg-[#64ffda]/10 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Github className="w-4 h-4" />
                    <span>Code</span>
                  </motion.a>
                  <motion.a
                    href={project.external}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-[#64ffda] text-[#0a192f] font-mono text-sm rounded hover:bg-[#64ffda]/90 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Demo</span>
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
          ))}
        </div>

        {/* Other Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold text-[#ccd6f6] mb-2">Other Noteworthy Projects</h3>
          <p className="text-[#64ffda] font-mono text-sm">view the archive</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#112240] p-6 rounded hover:translate-y-[-4px] transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <Folder className="w-10 h-10 text-[#64ffda]" />
                <div className="flex gap-3">
                  <motion.a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8892b0] hover:text-[#64ffda] transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Github className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href={project.external}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8892b0] hover:text-[#64ffda] transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>

              <h4 className="text-xl font-bold text-[#ccd6f6] mb-3 group-hover:text-[#64ffda] transition-colors">
                {project.title}
              </h4>
              
              <p className="text-[#8892b0] mb-6 leading-relaxed">
                {project.description}
              </p>

              <ul className="flex flex-wrap gap-3 font-mono text-xs text-[#8892b0]">
                {project.tech.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
