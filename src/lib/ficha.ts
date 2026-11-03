import { PAGES, PAGE_SECTIONS } from '../content/pages.ts'
import type { PageId } from '../content/pages.ts'

/** Microtexto de ficha: etiqueta + número de orden a 2 dígitos entre corchetes («[EXP. 01]»). `index` es base 0. */
export function formatFicha(label: string, index: number): string {
  if (!Number.isInteger(index) || index < 0) throw new Error(`ficha: índice inválido ${index}`)
  return `[${label} ${String(index + 1).padStart(2, '0')}]`
}

const two = (n: number) => String(n).padStart(2, '0')

/** Índice de página en el recorrido («[02/03]»), derivado de PAGES. */
export function formatPageIndex(page: PageId): string {
  return `[${two(PAGES.indexOf(page) + 1)}/${two(PAGES.length)}]`
}

/** Ficha de sección por posición dentro de su página («[06]»). */
export function formatPageSectionFicha(page: PageId, id: string): string {
  const index = (PAGE_SECTIONS[page] as readonly string[]).indexOf(id)
  if (index < 0) throw new Error(`ficha: la sección ${id} no pertenece a ${page}`)
  return `[${two(index + 1)}]`
}
