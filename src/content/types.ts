import type { SECTION_IDS } from './index.ts'
import type { facts } from './facts.ts'

export type SectionId = (typeof SECTION_IDS)[number]

export type ExperienceId = (typeof facts)['experience'][number]['id']
export type EducationId = (typeof facts)['education'][number]['id']
export type LanguageId = (typeof facts)['languages'][number]['id']

export type NowCardId = (typeof facts)['now']['cards'][number]['id']

export interface ProjectCopy {
  description: string
  result?: string
}

export type AchievementId = (typeof facts)['achievements'][number]['id']

export interface Dictionary {
  meta: {
    title: string
    description: string
    keywords: string[]
    ogLocale: string
    imageAlt: string
  }
  nav: {
    brand: string
    menuLabel: string
    menuOpen: string
    menuClose: string
    cv: string
    sections: Record<SectionId, string>
    language: { label: string; en: string; es: string; current: string }
  }
  hero: {
    greeting: string
    title: string
    qualifier: string
    summary: string
    cta: string
    github: string
    linkedin: string
    photoAlt: string
    badge: string
  }
  ficha: { exp: string; proj: string; lab: string; ach: string; edu: string }
  marquee: { label: string; pause: string; play: string }
  footer: { builtBy: string }
  common: { copyEmail: string; emailCopied: string }
  notFound: { title: string; body: string; home: string }
  now: {
    title: string
    updated: string
    lastUpdated: string
    dateUnavailable: string
    cards: Record<NowCardId, { title: string; body: string; link?: string }>
    openTo: { label: string; text: string }
  }
  contact: {
    badge: string
    title: string
    intro: string
    labels: { name: string; email: string; subject: string; message: string }
    placeholders: { name: string; email: string; subject: string; message: string }
    submit: string
    sending: string
    success: string
    errors: { required: string; invalidEmail: string }
    failure: string
  }
  achievements: {
    title: string
    items: Record<AchievementId, { event: string; result: string }>
  }
  projects: {
    title: string
    result: string
    openProject: string
    items: Record<string, ProjectCopy>
  }
  lab: {
    title: string
    intro: string
    show: string
    hide: string
    openProject: string
    items: Record<string, ProjectCopy>
  }
  experience: {
    title: string
    empty: string
    items: Record<ExperienceId, { role: string; bullets: string[]; metrics: string[] }>
  }
  education: {
    title: string
    inProgress: string
    items: Record<EducationId, string>
    languages: { title: string; items: Record<LanguageId, { name: string; level: string }> }
  }
  stack: { title: string; groups: { development: string; dataAutomation: string; tools: string } }
  techLabels: Record<string, string>
}
