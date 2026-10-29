import type { CSSProperties, ReactNode } from 'react';

/**
 * Ornamentos geométricos decorativos (contrato 003 §5): SVG inline de un solo color (`currentColor`),
 * sin texto ni ids, ocultos a lectores y sin eventos de puntero. El color lo pone el contenedor.
 */
interface OrnamentProps {
  size: number;
  className?: string;
}

const cls = (extra?: string) => (extra ? `ornament ${extra}` : 'ornament');

export const Star4 = ({ size, className }: OrnamentProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    className={cls(className)}
  >
    <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" fill="currentColor" />
  </svg>
);

/** Damero de 2 filas × 6 casillas de 12 px (72 × 24). Escala con `size` (ancho). */
export const Checker = ({ size, className }: OrnamentProps) => (
  <svg
    viewBox="0 0 72 24"
    width={size}
    height={(size * 24) / 72}
    aria-hidden="true"
    focusable="false"
    className={cls(className)}
  >
    {[0, 1].flatMap((row) =>
      [0, 1, 2, 3, 4, 5]
        .filter((col) => (row + col) % 2 === 0)
        .map((col) => <rect key={`${row}-${col}`} x={col * 12} y={row * 12} width="12" height="12" fill="currentColor" />),
    )}
  </svg>
);

const MARKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const r = (n: number) => (50 + n * Math.cos(a)).toFixed(2);
  const s = (n: number) => (50 + n * Math.sin(a)).toFixed(2);
  return { x1: r(44), y1: s(44), x2: r(49), y2: s(49) };
});

export const RingMarks = ({ size, className }: OrnamentProps) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    className={cls(className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="50" cy="50" r="44" />
    {MARKS.map((m, i) => (
      <line key={i} {...m} />
    ))}
  </svg>
);

/**
 * Envoltorio del parallax decorativo: este `div` lleva el único `transform` animado (CSS scroll-driven,
 * `--d-full` = amplitud en px); el SVG hijo, como mucho, una rotación estática.
 */
export const Parallax = ({ d, className = '', children }: { d: number; className?: string; children: ReactNode }) => (
  <div
    className={`parallax pointer-events-none ${className}`.trim()}
    style={{ '--d-full': `${d}px` } as CSSProperties}
    aria-hidden="true"
  >
    {children}
  </div>
);
