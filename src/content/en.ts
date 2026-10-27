import type { Dictionary } from './types.ts'

export const en: Dictionary = {
  meta: {
    title: 'Jostin Aldair Nava — Software Engineer | Data & Automation',
    description:
      'Software engineer focused on data and automation: WMS integrated with ERP, data pipelines and BI. Full-stack with TypeScript, NestJS, React and Python.',
    keywords: ['Software Engineer', 'Full Stack', 'Automation', 'Data', 'TypeScript', 'NestJS', 'React', 'Python'],
    ogLocale: 'en_US',
    imageAlt: 'Portrait of Jostin Aldair Nava',
  },
  nav: {
    brand: 'Jostin Aldair Nava',
    menuLabel: 'Main navigation',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    cv: 'Résumé',
    sections: {
      hero: 'Home',
      now: 'Now',
      experience: 'Experience',
      projects: 'Projects',
      stack: 'Stack',
      achievements: 'Achievements',
      education: 'Education',
      lab: 'Lab',
      contact: 'Contact',
    },
    language: { label: 'Language', en: 'English', es: 'Español', current: 'current language' },
  },
  hero: {
    greeting: "Hi, I'm",
    title: 'Software Engineer',
    qualifier: 'focused on data and automation.',
    summary:
      'Full Stack and automation developer with experience in warehouse management systems (WMS) integrated with ERP, data pipelines, and business intelligence tools. Background in Physics and Software Engineering brings a rigorous, systematic approach.',
    cta: 'Check out my work',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    photoAlt: 'Portrait of Jostin Aldair Nava',
    badge: 'AVAILABLE FOR WORK • AVAILABLE FOR WORK • ',
  },
  footer: { builtBy: 'Designed & built by Jostin Aldair Nava' },
  common: { copyEmail: 'Copy email address', emailCopied: 'Email copied to clipboard!' },
  notFound: {
    title: 'Page not found',
    body: "The page you're looking for doesn't exist.",
    home: 'Back to home',
  },
  now: {
    title: 'Now',
    updated: 'Updated',
    lastUpdated: 'Last updated',
    dateUnavailable: 'date unavailable',
    cards: {
      mes: {
        title: 'Industrial MES',
        body: 'Building a manufacturing execution system: production line registration, warehouse control, and connection with POPs and PDAs.',
      },
      archive: {
        title: 'Archive',
        body: "A shared repository of students' scientific papers.",
        link: 'View repository',
      },
    },
    openTo: { label: 'Open to', text: 'Software Engineer focused on data and automation' },
  },
  contact: {
    badge: 'Get in touch',
    title: "Let's work together",
    intro: "I'm always open to discussing new opportunities, collaborations, or just having a chat about data and automation. Drop me a message!",
    labels: { name: 'Name', email: 'Email', subject: 'Subject', message: 'Message' },
    placeholders: {
      name: 'Your name',
      email: 'your.email@example.com',
      subject: "What's this about?",
      message: 'Tell me about your project, idea, or just say hello!',
    },
    submit: 'Send message',
    sending: 'Sending...',
    success: "Your message was sent successfully! I'll get back to you soon.",
    errors: { required: 'This field is required.', invalidEmail: 'Enter a valid email address.' },
    failure: "Your message could not be sent. What you wrote is still here. You can also write to me directly at",
  },
  achievements: {
    title: 'Achievements',
    items: {
      frc: {
        event: 'FIRST Robotics — FRC TIGRES 6652',
        result: 'Administrative coordinator and team member; reached the Worlds; competed in Monterrey, Torreón, Houston and Alabama.',
      },
      chairmans: {
        event: "Chairman's Award — FIRST Championship Houston",
        result: 'Division-level award.',
      },
      deans: {
        event: "Dean's List Semi-finalist",
        result: 'Semi-finalist with FRC TIGRES 6652.',
      },
      hackmty2025: {
        event: 'Hack MTY — Open Innovation by Banorte',
        result: '3rd place with team Ghekkin.',
      },
      hackmty2026: {
        event: 'Hack MTY — Open Innovation by Banorte',
        result: '3rd place with Maya.',
      },
      fll: {
        event: 'FIRST LEGO League',
        result: 'Best programming award and Global Innovation Award nomination; Mexico City, Monterrey and LEGOLAND California.',
      },
    },
  },
  projects: {
    title: 'Projects',
    result: 'Result',
    openProject: 'Open project',
    items: {
      maya: {
        description: 'AI financial assistant.',
        result: '3rd place, Open Innovation by Banorte, Hack MTY 2026',
      },
      caustix: {
        description: 'Physics library in Python (NumPy), with an independent RK4 verifier in Fortran that lives only on GitHub (not in the published package).',
        result: 'v1.0.0 + independent RK4 verifier',
      },
    },
  },
  lab: {
    title: 'Lab',
    intro: 'Academic projects and experiments.',
    show: 'Show academic projects',
    hide: 'Hide academic projects',
    openProject: 'Open project',
    items: {
      portfolio: {
        description: 'A personal portfolio showcasing selected projects and ideas, built with Next.js, Tailwind CSS, and TypeScript. Focused on purposeful design and clean code.',
      },
      cma: {
        description: 'End-to-end scientific programming tool for crypto market analysis. Uses NumPy/Pandas for numerical modeling and Matplotlib for result visualization.',
      },
      'curve-fitting': {
        description: 'Scripts demonstrating curve fitting and interpolation techniques with Python.',
      },
      'numerical-methods': {
        description: 'Practice and apply numerical methods across various mathematical topics.',
      },
      blackjack: { description: 'A console-based Blackjack game built with Python.' },
      'root-finding': {
        description: 'Implementation of various numerical methods to solve nonlinear equations.',
      },
      'python-physics': {
        description: 'Collection of Python scripts for physics simulations and calculations.',
      },
      'fortran-physics': {
        description: 'A set of beginner and intermediate Fortran programs for physics.',
      },
    },
  },
  experience: {
    title: 'Experience',
    empty: 'No experience to show yet.',
    items: {
      softbank: {
        role: 'Full Stack Developer — Warehouse WMS / PDA System (ERP integration)',
        bullets: [
          'Carried out the migration of a warehouse WMS backend from Express to NestJS (strict TypeScript), achieving verified functional parity with the legacy system through a contract-test suite that compares both APIs.',
          'Integrated the WMS with the ERP across receiving, cycle counting, inventory, transfers, and scrap, keeping warehouse operations in sync with response validation and typed failure handling.',
          'Made the platform production-ready: PIN-based JWT authentication with role-based access, closure of exposed system routes, and reliability controls (30 s query timeout, DB keepalive, PM2), validated by integration, e2e, and equivalence tests.',
          'Delivered an Android PDA app (React/Vite + Capacitor) with 17 operational screens, barcode scanning, and 3-language support (ES/EN/KO), featuring a redesigned, AA-accessible UI with light/dark mode for floor operations.',
        ],
        metrics: ['PDA screens', 'languages'],
      },
      playout: {
        role: 'Data Analyst & Automation Developer',
        bullets: [
          'Led a historical sales data recovery, raising data concordance from 40% to 100% and enabling multi-year trend analysis.',
          'Designed master control databases (shipments, arrivals, inventory, sales, finances) structured around demand forecasting models.',
          'Built operational dashboards adopted across 6 departments and automated workflows (smart alerts, auto-assignment, status triggers) that reduced manual coordination.',
          'Deployed automated ETL pipelines and QA/testing routines for the e-commerce site, improving release confidence.',
        ],
        metrics: ['data concordance', 'departments'],
      },
      gh2: {
        role: 'Frontend Developer',
        bullets: [
          'Developed web apps with React, TypeScript, Next.js, and React Router v7 (SSR), including real-time pricing logic and e-commerce flows integrated with REST APIs; modular components with Material UI and Vite.',
        ],
        metrics: [],
      },
    },
  },
  education: {
    title: 'Education',
    inProgress: 'In progress',
    items: {
      ucnl: 'B.Sc. Software Engineering',
      uanl: 'B.Sc. Physics (incomplete)',
      eiao: 'Associate Degree in Industrial Mechatronics',
    },
    languages: {
      title: 'Languages',
      items: {
        es: { name: 'Spanish', level: 'native' },
        en: { name: 'English', level: 'intermediate' },
      },
    },
  },
  stack: {
    title: 'Stack',
    groups: { development: 'Development', dataAutomation: 'Data & Automation', tools: 'Tools' },
  },
  techLabels: {
    'Advanced Excel': 'Advanced Excel',
    'automated testing': 'automated testing',
    'MCP server': 'MCP server',
  },
}
