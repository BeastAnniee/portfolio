'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

type Project = {
  title: string;
  description: string;
  tech: string[];
  github: string;
  image: string;
};

const LinkGlyph = () => (
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bento-container text-bento-black transition-transform duration-200 group-hover:scale-110">
    <ArrowUpRight className="h-4 w-4" />
  </span>
);

const TechTags = ({ tech }: { tech: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {tech.map((t) => (
      <span
        key={t}
        className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-medium text-bento-black"
      >
        {t}
      </span>
    ))}
  </div>
);

const FeaturedCard = ({ project }: { project: Project }) => (
  <motion.a
    href={project.github}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="group relative flex flex-col gap-6 rounded-[24px] bg-bento-purple-deep p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container sm:p-8 md:flex-row md:items-center"
  >
    <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-[16px] md:h-56 md:w-72">
      <Image
        src={project.image}
        alt={project.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 288px"
      />
    </div>

    <div className="flex-1">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-bento-black/70">
            Featured
          </span>
          <h3 className="font-display text-2xl font-bold text-bento-black">{project.title}</h3>
        </div>
        <LinkGlyph />
      </div>
      <p className="mb-4 leading-relaxed text-bento-black/80">{project.description}</p>
      <TechTags tech={project.tech} />
    </div>
  </motion.a>
);

const tileTones = ['bg-bento-mint', 'bg-bento-amber', 'bg-bento-lilac', 'bg-bento-purple'];

const ProjectTile = ({ project, index }: { project: Project; index: number }) => {
  const tone = tileTones[index % tileTones.length];
  const wide = index % 3 === 0;

  return (
    <motion.a
      href={project.github}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
      viewport={{ once: true }}
      className={`group relative flex h-full flex-col rounded-[20px] p-6 transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container ${tone} ${
        wide ? 'sm:col-span-2' : ''
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <h4 className="font-display text-lg font-bold text-bento-black">{project.title}</h4>
        <LinkGlyph />
      </div>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-bento-black/80">{project.description}</p>
      <TechTags tech={project.tech} />
    </motion.a>
  );
};

const Projects = () => {
  const featuredProjects: Project[] = [
    {
      title: 'Portfolio',
      description:
        'A personal portfolio showcasing selected projects and ideas — built with Next.js, Tailwind CSS, and TypeScript. Focused on purposeful design and clean code.',
      tech: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
      github: 'https://github.com/BeastAnniee/portfolio',
      image: '/portfolio.png',
    },
  ];

  const otherProjects: Project[] = [
    {
      title: 'Archive',
      description:
        'Web platform for STEAM students to upload, document, and showcase academic projects. Helps build a professional portfolio with categories, charts, and community sharing.',
      tech: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB'],
      github: 'https://github.com/BeastAnniee/archive',
      image: '/404.png',
    },
    {
      title: 'Crypto Market Analytics CLI',
      description:
        'End-to-end scientific programming tool for crypto market analysis. Uses NumPy/Pandas for numerical modeling and Matplotlib for result visualization.',
      tech: ['Python', 'NumPy', 'Pandas', 'Matplotlib', 'Coinlore API'],
      github: 'https://github.com/BeastAnniee/crypto_market_analytics_cli',
      image: '/cma_image.png',
    },
    {
      title: 'Curve Fitting',
      description: 'Scripts demonstrating curve fitting and interpolation techniques with Python',
      tech: ['Python', 'NumPy', 'Sympy', 'Matplotlib'],
      github: 'https://github.com/BeastAnniee/curve-fitting-and-interpolation',
      image: '/404.png',
    },
    {
      title: 'Numerical Methods',
      description: 'Practice and apply numerical methods across various mathematical topics',
      tech: ['Python', 'NumPy', 'Matplotlib'],
      github: 'https://github.com/BeastAnniee/numerical-methods',
      image: '/404.png',
    },
    {
      title: 'Blackjack CLI Game',
      description: 'A console-based Blackjack game built with Python',
      tech: ['Python'],
      github: 'https://github.com/BeastAnniee/blackjack-console',
      image: '/404.png',
    },
    {
      title: 'Root Finding',
      description: 'Implementation of various numerical methods to solve nonlinear equations',
      tech: ['Python', 'NumPy', 'Sympy'],
      github: 'https://github.com/BeastAnniee/equation-root-finding',
      image: '/404.png',
    },
    {
      title: 'Python & Physics',
      description: 'Collection of Python scripts for physics simulations and calculations',
      tech: ['Python', 'Matplotlib'],
      github: 'https://github.com/BeastAnniee/python-basics-and-physics',
      image: '/404.png',
    },
    {
      title: 'Fortran & Physics',
      description: 'A set of beginner and intermediate Fortran programs for physics',
      tech: ['Fortran'],
      github: 'https://github.com/BeastAnniee/fortran-basics-and-physics',
      image: '/404.png',
    },
  ];

  return (
    <section id="projects" className="px-4 py-6 sm:px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-6 inline-flex items-center gap-2 rounded-full bg-bento-page px-4 py-1.5"
      >
        <span className="text-sm font-semibold text-bento-black">Projects</span>
      </motion.div>

      <div className="mb-4 space-y-4 sm:mb-6 sm:space-y-6">
        {featuredProjects.map((project) => (
          <FeaturedCard key={project.title} project={project} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {otherProjects.map((project, index) => (
          <ProjectTile key={project.title} project={project} index={index} />
        ))}
      </div>
    </section>
  );
};

export default Projects;
