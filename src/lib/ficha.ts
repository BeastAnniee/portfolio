import { SECTION_IDS } from '../content/sections.ts'
import type { SectionId } from '../content/types.ts'

/** Microtexto de ficha: etiqueta + número de orden a 2 dígitos entre corchetes («[EXP. 01]»). `index` es base 0. */
export function formatFicha(label: string, index: number): string {
  if (!Number.isInteger(index) || index < 0) throw new Error(`ficha: índice inválido ${index}`)
  return `[${label} ${String(index + 1).padStart(2, '0')}]`
}

/** Ficha de sección: su posición real en SECTION_IDS («[03]»). */
export function formatSectionFicha(id: SectionId): string {
  const index = SECTION_IDS.indexOf(id)
  if (index < 0) throw new Error(`ficha: sección desconocida ${id}`)
  return `[${String(index + 1).padStart(2, '0')}]`
}
