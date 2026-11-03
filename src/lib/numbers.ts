export interface NumberEntry {
  value: string
  jobId: string
  /** Posición de la métrica dentro de su empleo (para tomar la etiqueta del diccionario). */
  metricIndex: number
}

/** Cifras de Home: las `metrics` de cada empleo en el orden de `facts`, sin conteos derivados. */
export function numbersFromFacts(
  experience: readonly { id: string; metrics: readonly { value: string }[] }[],
): NumberEntry[] {
  return experience.flatMap((job) =>
    job.metrics.map((metric, metricIndex) => ({ value: metric.value, jobId: job.id, metricIndex })),
  )
}
