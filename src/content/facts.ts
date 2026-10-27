export interface ProjectFact {
  id: string
  name: string
  version?: string
  href?: string
  image?: string
  tech: readonly string[]
}

const projects: { spotlight: readonly ProjectFact[]; lab: readonly ProjectFact[] } = {
  spotlight: [
    {
      id: 'maya',
      name: 'Maya',
      href: 'https://ghekkinxmaya.tech/maya',
      tech: ['TypeScript', 'React', 'MCP server', 'A2UI'],
    },
    {
      id: 'caustix',
      name: 'Caustix',
      version: 'v1.0.0',
      href: 'https://github.com/BeastAnniee/caustix',
      tech: ['Python', 'NumPy', 'Fortran'],
    },
  ],
  lab: [
    {
      id: 'portfolio',
      name: 'Portfolio',
      href: 'https://github.com/BeastAnniee/portfolio',
      image: '/portfolio.png',
      tech: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    },
    {
      id: 'cma',
      name: 'Crypto Market Analytics CLI',
      href: 'https://github.com/BeastAnniee/crypto_market_analytics_cli',
      image: '/cma_image.png',
      tech: ['Python', 'NumPy', 'Pandas', 'Matplotlib', 'Coinlore API'],
    },
    {
      id: 'curve-fitting',
      name: 'Curve Fitting',
      href: 'https://github.com/BeastAnniee/curve-fitting-and-interpolation',
      tech: ['Python', 'NumPy', 'Sympy', 'Matplotlib'],
    },
    {
      id: 'numerical-methods',
      name: 'Numerical Methods',
      href: 'https://github.com/BeastAnniee/numerical-methods',
      tech: ['Python', 'NumPy', 'Matplotlib'],
    },
    {
      id: 'blackjack',
      name: 'Blackjack CLI Game',
      href: 'https://github.com/BeastAnniee/blackjack-console',
      tech: ['Python'],
    },
    {
      id: 'root-finding',
      name: 'Root Finding',
      href: 'https://github.com/BeastAnniee/equation-root-finding',
      tech: ['Python', 'NumPy', 'Sympy'],
    },
    {
      id: 'python-physics',
      name: 'Python & Physics',
      href: 'https://github.com/BeastAnniee/python-basics-and-physics',
      tech: ['Python', 'Matplotlib'],
    },
    {
      id: 'fortran-physics',
      name: 'Fortran & Physics',
      href: 'https://github.com/BeastAnniee/fortran-basics-and-physics',
      tech: ['Fortran'],
    },
  ],
}

/** Datos factuales sin idioma: se declaran una sola vez (REQ-7). */
export const facts = {
  profile: {
    name: 'Jostin Aldair Nava',
    email: 'jostinaval@gmail.com',
    github: 'https://github.com/BeastAnniee',
    linkedin: 'https://www.linkedin.com/in/aldair-nava-dev',
  },
  // Ambos idiomas apuntan al mismo archivo hasta que lleguen los CV corregidos (REQ-23).
  cv: { en: '/resume.pdf', es: '/resume.pdf' },
  now: {
    updatedAt: '2026-10-27',
    cards: [
      { id: 'mes' },
      { id: 'archive', href: 'https://github.com/BeastAnniee/archive' },
    ],
  },
  projects,
  achievements: [
    { id: 'frc', year: '2021 – 2023' },
    { id: 'chairmans', year: '2022' },
    { id: 'deans', year: '2022' },
    { id: 'hackmty2025', year: '2025' },
    { id: 'hackmty2026', year: '2026' },
    { id: 'fll', year: null },
  ],
  experience: [
    {
      id: 'softbank',
      company: 'SoftBank',
      period: '2026',
      metrics: [{ value: '17' }, { value: '3' }],
      tech: ['Express', 'NestJS', 'TypeScript', 'JWT', 'PM2', 'React', 'Vite', 'Capacitor'],
    },
    {
      id: 'playout',
      company: 'PlayOut Kids',
      period: '2025 – 2026',
      metrics: [{ value: '40→100 %' }, { value: '6' }],
      tech: ['ETL'],
    },
    {
      id: 'gh2',
      company: 'GH2 Systems',
      period: '2025',
      metrics: [],
      tech: ['React', 'TypeScript', 'Next.js', 'React Router v7', 'Material UI', 'Vite', 'REST'],
    },
  ],
  education: [
    { id: 'ucnl', institution: 'Universidad Ciudadana de Nuevo León (UCNL)', period: null },
    { id: 'uanl', institution: 'Universidad Autónoma de Nuevo León (UANL)', period: '2023 – 2025' },
    { id: 'eiao', institution: 'EIAO – UANL', period: '2020 – 2023' },
  ],
  languages: [
    { id: 'es', cefr: null },
    { id: 'en', cefr: 'B1' },
  ],
  stack: {
    development: [
      'TypeScript', 'NestJS', 'Node.js', 'Express', 'React', 'Next.js', 'Vite',
      'Capacitor', 'Zustand', 'REST APIs', 'JWT', 'FastAPI',
    ],
    dataAutomation: [
      'SQL', 'PostgreSQL', 'Fortran', 'Power BI', 'Python (pandas, numpy)', 'ETL',
      'Advanced Excel', 'monday.com', 'dashboards', 'automated testing',
    ],
    tools: ['Git', 'GitHub Actions (CI/CD)', 'PM2', 'Railway', 'Scrum', 'Jupyter'],
  },
} as const
