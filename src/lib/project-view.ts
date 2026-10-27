export interface ProjectMediaInput {
  image?: string | null
  href?: string | null
}

const usable = (value: string | null | undefined, blocked: string[]): string | null => {
  const v = value?.trim()
  return v && !blocked.includes(v) ? v : null
}

/** Decide qué recursos de un proyecto se pueden pintar: nunca imagen rota ni enlace muerto. */
export function resolveProjectMedia(p: ProjectMediaInput): { image: string | null; href: string | null } {
  return {
    image: usable(p.image, ['/404.png']),
    href: usable(p.href, ['#']),
  }
}
