/** Microtexto de ficha: etiqueta + número de orden a 2 dígitos («EXP. 01»). `index` es base 0. */
export function formatFicha(label: string, index: number): string {
  return `${label} ${String(index + 1).padStart(2, '0')}`
}
