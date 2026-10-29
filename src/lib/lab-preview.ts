type Geometry = { listTop: number; listHeight: number; previewHeight: number }

const clamp = ({ listHeight, previewHeight }: Geometry, y: number) =>
  Math.min(Math.max(0, listHeight - previewHeight), Math.max(0, y))

/** Desplazamiento vertical de la miniatura: centrada en el puntero y dentro de la lista. */
export function previewOffset(g: Geometry & { pointerY: number }): number {
  return clamp(g, g.pointerY - g.listTop - g.previewHeight / 2)
}

/** Desplazamiento vertical anclado al borde superior de una fila (foco por teclado). */
export function anchorOffset(g: Geometry & { rowTop: number }): number {
  return clamp(g, g.rowTop - g.listTop)
}

/** La vista previa solo existe con cursor real y sin reduced-motion. */
export function shouldPreview({ hover, reducedMotion }: { hover: boolean; reducedMotion: boolean }): boolean {
  return hover && !reducedMotion
}
