export const COPIED_MS = 2500
// Si falla, el correo debe seguir a la vista el tiempo suficiente para copiarlo a mano (WCAG 2.2.1).
export const FAILED_MS = 10_000

/** Cuánto tiempo permanece el aviso de copiar correo según el resultado. */
export const copyFeedbackMs = (copyOk: boolean): number => (copyOk ? COPIED_MS : FAILED_MS)
