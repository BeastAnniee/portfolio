'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const About = () => {
  const technologies = [
    'Python',
    'Fortran',
    'Pandas',
    'NumPy',
    'Scikit-learn','JavaScript (ES6+)',
    'TypeScript',
    'React',
    'Next.js',
    'React Router 7',
    'MySQL',
    'Node.js',
,
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
            <div className="flex flex-col max-w-xl space-y-5">
              <p className="text-[#8892b0] text-lg leading-relaxed">
                My professional trajectory is intentionally interdisciplinary. As a Physics Student 
                and Mechatronics Technician, my value lies not just in what I can code, but in how I 
                approach problems. I specialize in applying a quantitative analysis mindset—utilizing 
                Python, Fortran, and numerical methods—to break down complex challenges and translate 
                them into computational models. Web development is my primary delivery vehicle: I use 
                frameworks like React and Next.js to build robust, intuitive tools that make automated 
                and data-driven solutions accessible, ensuring scientific knowledge translates into 
                real-world impact.
              </p>
              <p className="text-[#8892b0] text-lg leading-relaxed">
                Here are a few technologies I&apos;ve been working with recently:
              </p>
            </div>

            {/* Technologies Grid*/}
            <div className="grid grid-cols-3 gap-2 mt-6">
              {technologies.map((tech, index) => (
                <span key={index} className="text-[#8892b0] text-base flex items-center">
                  <span className="text-[#64ffda] mr-2">&gt;</span> {tech}
                </span>
              ))}
            </div>

            {/* Mobile Action Buttons (visible on mobile only) */}
            <div className="flex flex-col gap-3 mt-6 w-full md:hidden">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-[#64ffda] text-[#64ffda] font-mono text-sm rounded hover:bg-[#64ffda]/10 transition-all duration-300 text-center shadow-md"
                title="Open Resume in new tab"
              >
                View Resume
              </a>
              <a
                href="/story.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-[#233554] text-[#8892b0] font-mono text-sm rounded hover:bg-[#233554]/60 hover:text-[#64ffda] transition-all duration-300 text-center shadow-none"
                title="Open Cover Letter in new tab"
              >
                More of me
              </a>
            </div>
          </motion.div>

          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative hidden md:block"
          >
            <div className="relative">
              {/* Image placeholder */}
              <div className="w-full aspect-[3/4] bg-[#64ffda]/20 rounded border-2 border-[#64ffda] relative overflow-hidden flex items-center justify-center">
                <Image
                  src="/profile.jpg"
                  alt="Profile Photo"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover rounded"
                  style={{ aspectRatio: '3/4', display: 'block' }}
                  priority
                />
              </div>
              {/* Action Buttons below the photo */}
              <div className="flex flex-col gap-3 mt-6 w-full">
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-[#64ffda] text-[#64ffda] font-mono text-sm rounded hover:bg-[#64ffda]/10 transition-all duration-300 text-center shadow-md"
                  title="Open Resume in new tab"
                >
                  View Resume
                </a>
                <a
                  href="/story.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-[#233554] text-[#8892b0] font-mono text-sm rounded hover:bg-[#233554]/60 hover:text-[#64ffda] transition-all duration-300 text-center shadow-none"
                  title="Open Cover Letter in new tab"
                >
                  View more of me
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
