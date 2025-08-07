'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github, Folder } from 'lucide-react';

const Projects = () => {
  const featuredProjects = [
    {
      title: 'Spotify Profile',
      description: 'A web app for visualizing personalized Spotify data. View your top artists, top tracks, recently played tracks, and detailed audio information about each track. Create and save new playlists of recommended tracks based on your existing playlists and more.',
      tech: ['React', 'Express', 'Spotify API', 'Heroku'],
      github: 'https://github.com',
      external: 'https://spotify-profile.herokuapp.com/',
      image: '/api/placeholder/600/400'
    },
    {
      title: 'Halcyon Theme',
      description: 'A minimal, dark blue theme for VS Code, Sublime Text, Atom, iTerm, and more. Available on Visual Studio Marketplace, Package Control, Atom Package Manager, and npm.',
      tech: ['VS Code', 'Sublime Text', 'Atom', 'iTerm2', 'Hyper'],
      github: 'https://github.com',
      external: 'https://marketplace.visualstudio.com/',
      image: '/api/placeholder/600/400'
    },
    {
      title: 'Build a Spotify Connected App',
      description: 'Video course that teaches how to build a web app with the Spotify Web API. Topics covered include the principles of REST APIs, user auth flows, Node, Express, React, Styled Components, and more.',
      tech: ['React', 'Node.js', 'Express', 'Spotify API'],
      github: 'https://github.com',
      external: 'https://www.newline.co/',
      image: '/api/placeholder/600/400'
    }
  ];

  const otherProjects = [
    {
      title: 'Integrating Algolia Search',
      description: 'Building a custom search with Algolia in a React app',
      tech: ['Algolia', 'React', 'Gatsby'],
      github: 'https://github.com',
      external: 'https://algolia.com'
    },
    {
      title: 'React Profile',
      description: 'Online resume built with React and GitHub API',
      tech: ['React', 'GitHub API'],
      github: 'https://github.com',
      external: 'https://github.com'
    },
    {
      title: 'Spotify Top Tracks',
      description: 'React app to display user\'s top tracks and artists',
      tech: ['React', 'Spotify API', 'Express'],
      github: 'https://github.com',
      external: 'https://spotify.com'
    },
    {
      title: 'Weather App',
      description: 'Simple weather app built with vanilla JavaScript',
      tech: ['JavaScript', 'OpenWeather API', 'Sass'],
      github: 'https://github.com',
      external: 'https://openweathermap.org'
    },
    {
      title: 'Headless WordPress',
      description: 'Headless WordPress site built with Next.js and WPGraphQL',
      tech: ['Next.js', 'WordPress', 'GraphQL'],
      github: 'https://github.com',
      external: 'https://wordpress.org'
    },
    {
      title: 'Personal Website v1',
      description: 'First iteration of my personal website built with Jekyll',
      tech: ['Jekyll', 'Sass', 'JavaScript'],
      github: 'https://github.com',
      external: 'https://jekyllrb.com'
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
                    <div className="bg-[#64ffda]/20 aspect-video rounded border border-[#64ffda]/30 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-[#64ffda]/10 to-[#64ffda]/5 flex items-center justify-center">
                        <span className="text-[#64ffda] font-mono">Project Image</span>
                      </div>
                      <div className="absolute inset-0 bg-[#0a192f]/80 group-hover:bg-transparent transition-all duration-300"></div>
                    </div>
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
                <div className="bg-[#64ffda]/20 aspect-video rounded border border-[#64ffda]/30 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-[#64ffda]/10 to-[#64ffda]/5 flex items-center justify-center">
                    <span className="text-[#64ffda] font-mono">Project Image</span>
                  </div>
                  <div className="absolute inset-0 bg-[#0a192f]/80 group-hover:bg-transparent transition-all duration-300"></div>
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
