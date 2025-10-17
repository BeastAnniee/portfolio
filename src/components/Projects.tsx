'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Github, Folder } from 'lucide-react';

// Tipos de ayuda
type Project = {
  title: string;
  description: string;
  tech: string[];
  github: string;
  external?: string;
  image: string;
  featured?: boolean;
};

// Componente de tarjeta de proyecto reutilizable
const ProjectCard = (
  { project, isFeatured = false }: { project: Project; isFeatured?: boolean }
) => {
  if (isFeatured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#112240] to-[#0a192f] border border-[#1e2a4a] hover:border-[#64ffda]/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#64ffda]/10"
      >
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="inline-block text-[#64ffda] font-mono text-sm mb-2">Featured Project</span>
              <h3 className="text-2xl font-bold text-[#ccd6f6] group-hover:text-[#64ffda] transition-colors">
                {project.title}
              </h3>
            </div>
            {/* Botón superior de GitHub removido por solicitud */}
          </div>
          
          <div className="relative h-48 md:h-56 rounded-lg overflow-hidden mb-6">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/80 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
          </div>
          
          <p className="text-[#8892b0] mb-6 leading-relaxed">
            {project.description}
          </p>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {project.tech.map((tech: string) => (
              <span 
                key={tech} 
                className="px-3 py-1 bg-[#1e2a4a] text-[#64ffda] text-xs font-mono rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
          
          <div className="flex space-x-4">
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 text-sm font-medium text-[#64ffda] border border-[#64ffda] rounded hover:bg-[#64ffda]/10 transition-all duration-200 group"
            >
              <Github className="w-4 h-4 mr-2" />
              <span>View Code</span>
            </a>
            {/* Botón de demo eliminado por solicitud */}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.a
      href={project.github}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group relative h-full bg-[#112240] rounded-lg p-6 border border-[#1e2a4a] hover:border-[#64ffda]/50 transition-all duration-300 hover:-translate-y-1.5 shadow-lg hover:shadow-xl hover:shadow-[#64ffda]/5"
    >
      <div className="flex items-start mb-4">
        <Folder className="w-10 h-10 text-[#64ffda]" />
      </div>
      
      <h4 className="text-xl font-bold text-[#ccd6f6] mb-3 group-hover:text-[#64ffda] transition-colors">
        {project.title}
      </h4>
      
      <p className="text-[#8892b0] text-sm mb-6 leading-relaxed">
        {project.description}
      </p>
      
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech: string) => (
            <span 
              key={tech} 
              className="px-2.5 py-0.5 bg-[#1e2a4a] text-[#64ffda] text-xs font-mono rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.a>
  );
};

const Projects = () => {
  const featuredProjects: Project[] = [
    {
      title: 'Archive',
      description: 'Web platform for STEAM students to upload, document, and showcase academic projects. Helps build a professional portfolio with categories, charts, and community sharing.',
      tech: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB'],
      github: 'https://github.com/BeastAnniee/archive',
      external: '/demo',
      image: '/404.png',
      featured: true
    },
    {
      title: 'Crypto Market Analytics CLI',
      description: 'End-to-end scientific programming tool for crypto market analysis. Uses NumPy/Pandas for numerical modeling and Matplotlib for result visualization.',
      tech: ['Python', 'NumPy', 'Pandas', 'Matplotlib', 'Coinlore API', 'Seaborn', ' Scikit-learn'],
      github: 'https://github.com/BeastAnniee/crypto_market_analytics_cli',
      external: '/demo',
      image: '/cma_image.png',
      featured: true
    },
    {
      title: 'Portfolio',
      description: 'A personal portfolio showcasing selected projects and ideas — built with Next.js, Tailwind CSS, and TypeScript. Focused on purposeful design and clean code.',
      tech: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      github: 'https://github.com/BeastAnniee/portfolio',
      external: 'https://aldairdev.vercel.app/',
      image: '/portfolio.png',
      featured: true
    }
  ];

  const otherProjects: Project[] = [
    {
      title: 'Curve Fitting',
      description: 'Scripts demonstrating curve fitting and interpolation techniques with Python',
      tech: ['Python', 'NumPy', 'Sympy', 'Matplotlib'],
      github: 'https://github.com/BeastAnniee/curve-fitting-and-interpolation',
      external: '/demo',
      image: '/404.png'
    },
    {
      title: 'Numerical Methods',
      description: 'Practice and apply numerical methods across various mathematical topics',
      tech: ['Python', 'NumPy', 'Matplotlib'],
      github: 'https://github.com/BeastAnniee/numerical-methods',
      external: '/demo',
      image: '/404.png'
    },
    {
      title: 'Blackjack CLI Game',
      description: 'A console-based Blackjack game built with Python',
      tech: ['Python', 'Matplotlib'],
      github: 'https://github.com/BeastAnniee/blackjack-console',
      external: '/demo',
      image: '/404.png'
    },
    {
      title: 'Root Finding',
      description: 'Implementation of various numerical methods to solve nonlinear equations',
      tech: ['Python', 'NumPy', 'Sympy'],
      github: 'https://github.com/BeastAnniee/equation-root-finding',
      external: '/demo',
      image: '/404.png'
    },
    {
      title: 'Python & Physics',
      description: 'Collection of Python scripts for physics simulations and calculations',
      tech: ['Python', 'Matplotlib'],
      github: 'https://github.com/BeastAnniee/python-basics-and-physics',
      external: '/demo',
      image: '/404.png'
    },
    {
      title: 'Fortran & Physics',
      description: 'A set of beginner and intermediate Fortran programs for physics',
      tech: ['Fortran'],
      github: 'https://github.com/BeastAnniee/fortran-basics-and-physics',
      external: '/demo',
      image: '/404.png'
    }
  ];

  return (
    <section id="projects" className="py-24 px-6 lg:px-8 bg-[#0a192f]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header (estilo anterior) */}
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
        <div className="space-y-16 mb-32">
          {featuredProjects.map((project, index) => (
            <ProjectCard 
              key={`featured-${index}`} 
              project={project} 
              isFeatured={true} 
            />
          ))}
        </div>

        {/* Other Projects (encabezado estilo anterior) */}
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
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProjects.map((project, index) => (
              <ProjectCard 
                key={`other-${index}`} 
                project={project} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
