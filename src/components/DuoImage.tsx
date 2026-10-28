import Image from 'next/image';

interface DuoImageProps {
  src: string;
  alt: string;
  sizes: string;
  /** Debe fijar la proporción (p. ej. `aspect-[3/2]`) para que la imagen no desplace el diseño. */
  className: string;
  priority?: boolean;
  objectPosition?: string;
}

/**
 * Foto en duotono (carbón + acento) con grano estático. Las capas se desvanecen con opacity
 * al recibir cursor o foco (ver `.duo-*` en globals.css); el `alt` y el marco no cambian.
 */
const DuoImage = ({ src, alt, sizes, className, priority = false, objectPosition }: DuoImageProps) => (
  <div className={`duo duo-trigger ${className}`}>
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
      style={objectPosition ? { objectPosition } : undefined}
    />
    <div className="duo-layer duo-sat" aria-hidden="true" />
    <div className="duo-layer duo-mul" aria-hidden="true" />
    <div className="duo-layer duo-lift" aria-hidden="true" />
    <div className="grain" aria-hidden="true" />
  </div>
);

export default DuoImage;
