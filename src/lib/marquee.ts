import type { Dictionary } from '../content/types.ts'
import type { facts as Facts } from '../content/facts.ts'

/** Cadenas de la cinta de créditos: solo texto que ya existe en los datos factuales o en el diccionario. */
export function buildMarqueeItems(dict: Dictionary, facts: typeof Facts): string[] {
  const companies = facts.experience.map((e) => e.company)
  const technologies = ['TypeScript', 'NestJS', 'React', 'Next.js', 'Python', 'PostgreSQL']
  const milestones = [dict.achievements.items.frc.event, dict.achievements.items.hackmty2026.event]
  return [...companies, ...technologies, ...milestones]
}
