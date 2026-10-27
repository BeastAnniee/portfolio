import type { Dictionary } from './types.ts'

export const es: Dictionary = {
  meta: {
    title: 'Jostin Aldair Nava — Software Engineer | Datos y Automatización',
    description:
      'Ingeniero de software con enfoque en datos y automatización: WMS integrados con ERP, pipelines de datos y BI. Full stack con TypeScript, NestJS, React y Python.',
    keywords: ['Software Engineer', 'Full Stack', 'Automatización', 'Datos', 'TypeScript', 'NestJS', 'React', 'Python'],
    ogLocale: 'es_MX',
    imageAlt: 'Retrato de Jostin Aldair Nava',
  },
  nav: {
    brand: 'Jostin Aldair Nava',
    menuLabel: 'Navegación principal',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    cv: 'CV',
    sections: {
      hero: 'Inicio',
      now: 'Ahora',
      experience: 'Experiencia',
      projects: 'Proyectos',
      stack: 'Stack',
      achievements: 'Logros',
      education: 'Educación',
      lab: 'Laboratorio',
      contact: 'Contacto',
    },
    language: { label: 'Idioma', en: 'English', es: 'Español', current: 'idioma actual' },
  },
  hero: {
    greeting: 'Hola, soy',
    title: 'Software Engineer',
    qualifier: 'con enfoque en datos y automatización.',
    summary:
      'Desarrollador Full Stack y de automatización con experiencia en sistemas de almacén (WMS) integrados con ERP, pipelines de datos y herramientas de inteligencia de negocios. Formación en Física e Ingeniería de Software que aporta un enfoque riguroso y sistemático.',
    cta: 'Ver mi trabajo',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    photoAlt: 'Retrato de Jostin Aldair Nava',
    badge: 'DISPONIBLE PARA TRABAJAR • DISPONIBLE PARA TRABAJAR • ',
  },
  footer: { builtBy: 'Diseñado y construido por Jostin Aldair Nava' },
  common: { copyEmail: 'Copiar correo electrónico', emailCopied: '¡Correo copiado al portapapeles!' },
  notFound: {
    title: 'Página no encontrada',
    body: 'La página que buscas no existe.',
    home: 'Volver al inicio',
  },
  now: {
    title: 'Ahora',
    updated: 'Actualizado',
    lastUpdated: 'Última actualización',
    dateUnavailable: 'fecha no disponible',
    cards: {
      mes: {
        title: 'MES industrial',
        body: 'Construyendo un sistema de ejecución de manufactura: registro de líneas de producción, control de almacén y conexión con POPs y PDA.',
      },
      archive: {
        title: 'Archive',
        body: 'Un repositorio común de trabajos científicos de estudiantes.',
        link: 'Ver repositorio',
      },
    },
    openTo: { label: 'Abierto a', text: 'Software Engineer con enfoque en datos y automatización' },
  },
  contact: {
    badge: 'Contacto',
    title: 'Trabajemos juntos',
    intro: 'Siempre estoy abierto a hablar de nuevas oportunidades, colaboraciones o simplemente charlar sobre datos y automatización. ¡Escríbeme!',
    labels: { name: 'Nombre', email: 'Correo', subject: 'Asunto', message: 'Mensaje' },
    placeholders: {
      name: 'Tu nombre',
      email: 'tu.correo@ejemplo.com',
      subject: '¿De qué se trata?',
      message: 'Cuéntame sobre tu proyecto, tu idea, o simplemente saluda.',
    },
    submit: 'Enviar mensaje',
    sending: 'Enviando...',
    success: '¡Tu mensaje se envió correctamente! Te responderé pronto.',
    errors: { required: 'Este campo es obligatorio.', invalidEmail: 'Escribe un correo electrónico válido.' },
    failure: 'No se pudo enviar tu mensaje. Lo que escribiste sigue aquí. También puedes escribirme directamente a',
  },
  achievements: {
    title: 'Logros',
    items: {
      frc: {
        event: 'FIRST Robotics — FRC TIGRES 6652',
        result: 'Coordinador administrativo y miembro del equipo; llegada a los Mundiales; competencias en Monterrey, Torreón, Houston y Alabama.',
      },
      chairmans: {
        event: "Chairman's Award — FIRST Championship Houston",
        result: 'Premio a nivel división.',
      },
      deans: {
        event: "Dean's List Semi-finalist",
        result: 'Semifinalista con FRC TIGRES 6652.',
      },
      hackmty2025: {
        event: 'Hack MTY — Open Innovation de Banorte',
        result: '3.er lugar con el equipo Ghekkin.',
      },
      hackmty2026: {
        event: 'Hack MTY — Open Innovation de Banorte',
        result: '3.er lugar con Maya.',
      },
      fll: {
        event: 'FIRST LEGO League',
        result: 'Premio a mejor programación y nominación al Global Innovation Award; CDMX, Monterrey y LEGOLAND California.',
      },
    },
  },
  projects: {
    title: 'Proyectos',
    result: 'Resultado',
    openProject: 'Abrir proyecto',
    items: {
      maya: {
        description: 'Asistente financiero con IA.',
        result: '3.er lugar, Open Innovation de Banorte, Hack MTY 2026',
      },
      caustix: {
        description: 'Librería de física en Python (NumPy), con un verificador independiente RK4 en Fortran que vive solo en GitHub (no en el paquete publicado).',
        result: 'v1.0.0 + verificador independiente RK4',
      },
    },
  },
  lab: {
    title: 'Laboratorio',
    intro: 'Proyectos académicos y experimentos.',
    show: 'Mostrar proyectos académicos',
    hide: 'Ocultar proyectos académicos',
    openProject: 'Abrir proyecto',
    items: {
      portfolio: {
        description: 'Un portafolio personal que muestra proyectos e ideas seleccionados, construido con Next.js, Tailwind CSS y TypeScript. Enfocado en diseño con propósito y código limpio.',
      },
      cma: {
        description: 'Herramienta de programación científica de punta a punta para el análisis del mercado de criptomonedas. Usa NumPy/Pandas para el modelado numérico y Matplotlib para visualizar resultados.',
      },
      'curve-fitting': {
        description: 'Scripts que demuestran técnicas de ajuste de curvas e interpolación con Python.',
      },
      'numerical-methods': {
        description: 'Práctica y aplicación de métodos numéricos en distintos temas matemáticos.',
      },
      blackjack: { description: 'Un juego de Blackjack en consola hecho con Python.' },
      'root-finding': {
        description: 'Implementación de varios métodos numéricos para resolver ecuaciones no lineales.',
      },
      'python-physics': {
        description: 'Colección de scripts de Python para simulaciones y cálculos de física.',
      },
      'fortran-physics': {
        description: 'Un conjunto de programas de Fortran de nivel básico e intermedio para física.',
      },
    },
  },
  experience: {
    title: 'Experiencia',
    empty: 'Aún no hay experiencia que mostrar.',
    items: {
      softbank: {
        role: 'Desarrollador Full Stack — Sistema WMS / PDA para almacén (integración con ERP)',
        bullets: [
          'Realicé la migración del backend de un WMS de almacén de Express a NestJS (TypeScript estricto), logrando paridad funcional verificada con el sistema original mediante una suite de pruebas de contrato que compara ambas APIs.',
          'Integré el WMS con el ERP en entradas, conteo cíclico, inventario, transferencias y scrap, manteniendo la operación del almacén sincronizada con validación de respuestas y manejo tipificado de fallos.',
          'Dejé la plataforma lista para producción: autenticación por PIN (JWT) con acceso por rol, cierre de rutas de sistema expuestas y controles de fiabilidad (límite de 30 s por consulta, keepalive de BD, PM2), validados con pruebas de integración, e2e y de equivalencia.',
          'Entregué una app PDA para Android (React/Vite + Capacitor) con 17 pantallas operativas, escaneo de códigos y soporte en 3 idiomas (ES/EN/KO), con una interfaz rediseñada, accesible (AA) y con modo claro/oscuro para la operación en piso.',
        ],
        metrics: ['pantallas PDA', 'idiomas'],
      },
      playout: {
        role: 'Analista de Datos y Desarrollador de Automatización',
        bullets: [
          'Lideré la recuperación del histórico de ventas, mejorando la concordancia de datos de 40% a 100% y habilitando análisis de tendencias multianuales.',
          'Diseñé bases de control maestras (envíos, arribos, inventario, ventas y finanzas) orientadas a modelos de pronóstico de demanda.',
          'Construí dashboards operativos adoptados en 6 departamentos y flujos automatizados (alertas, asignación automática, disparadores de estatus) que redujeron la coordinación manual.',
          'Desplegué pipelines ETL automatizados y rutinas de QA/pruebas para el sitio de e-commerce, mejorando la confianza en cada lanzamiento.',
        ],
        metrics: ['concordancia de datos', 'departamentos'],
      },
      gh2: {
        role: 'Desarrollador Frontend',
        bullets: [
          'Desarrollé aplicaciones con React, TypeScript, Next.js y React Router v7 (SSR), con lógica de precios en tiempo real y flujos de e-commerce integrados con APIs REST; componentes modulares con Material UI y Vite.',
        ],
        metrics: [],
      },
    },
  },
  education: {
    title: 'Educación',
    inProgress: 'En curso',
    items: {
      ucnl: 'Licenciatura en Ingeniería de Software',
      uanl: 'Licenciatura en Física (incompleta)',
      eiao: 'Técnico Superior Universitario en Mecatrónica Industrial',
    },
    languages: {
      title: 'Idiomas',
      items: {
        es: { name: 'Español', level: 'nativo' },
        en: { name: 'Inglés', level: 'intermedio' },
      },
    },
  },
  stack: {
    title: 'Stack',
    groups: { development: 'Desarrollo', dataAutomation: 'Datos y Automatización', tools: 'Herramientas' },
  },
  techLabels: {
    'Advanced Excel': 'Excel avanzado',
    'automated testing': 'pruebas automatizadas',
    'MCP server': 'servidor MCP',
  },
}
