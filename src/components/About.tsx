'use client';

import { motion } from 'framer-motion';

type Stat = {
  value: string;
  label: string;
  bg: string;
};

const About = () => {
  const technologies = [
    'Python',
    'SQL',
    'Pandas',
    'monday.com',
    'NumPy',
    'JavaScript (ES6+)',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'MySQL',
    'Fortran',
  ];

  const stats: Stat[] = [
    { value: '6', label: 'departments using dashboards I built', bg: 'bg-bento-amber' },
    { value: '40→100%', label: 'sales data match rate after historical recovery', bg: 'bg-bento-mint' },
    { value: '1000s', label: 'records processed through automated ETL pipelines', bg: 'bg-bento-purple' },
  ];

  return (
    <section id="about" className="px-4 py-6 sm:px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-6 inline-flex items-center gap-2 rounded-full bg-bento-page px-4 py-1.5"
      >
        <span className="text-sm font-semibold text-bento-black">About</span>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        {/* Bio card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="rounded-[24px] bg-bento-container p-6 sm:p-8 lg:col-span-7"
        >
          <p className="mb-6 text-lg leading-relaxed text-bento-graphite">
            My focus is building data solutions end-to-end: from extraction and cleaning to
            automated pipelines and dashboards teams actually use. At PlayOut Kids, I&apos;ve
            designed master control databases for demand forecasting and built operational
            dashboards adopted by 6 departments — commercial, operations, e-commerce, web,
            finance, and leadership. A background in Physics and Mechatronics Engineering gives
            me a rigorous, systematic approach to breaking down problems, and I use React and
            Next.js to turn that analysis into interfaces people can actually use, not just
            notebooks.
          </p>

          <p className="mb-4 text-sm font-semibold text-bento-black">
            Technologies I work with:
          </p>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-bento-mint px-3 py-1.5 text-sm font-medium text-bento-black"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 lg:col-span-5 lg:grid-cols-1">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
              viewport={{ once: true }}
              className={`flex flex-col justify-center rounded-[24px] p-6 ${stat.bg}`}
            >
              <span className="font-display text-4xl font-extrabold leading-none text-bento-black sm:text-5xl">
                {stat.value}
              </span>
              <span className="mt-2 text-sm font-medium text-bento-black/80">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
