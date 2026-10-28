import { ArrowUpRight } from 'lucide-react';
import { badgeBox, badgeGlyphs, badgeRadius } from '@/lib/badge-geometry.ts';

/**
 * Sello decorativo: un `<text>` por glifo sobre un anillo con paso de arco fijo (9 px).
 * No usa `textPath` ni `textLength`, así que el texto cabe sin depender del navegador.
 */
const SignatureBadge = ({ text }: { text: string }) => {
  const n = Array.from(text).length;
  const r = badgeRadius(n);
  const box = badgeBox(n);
  const c = box / 2;
  const glyphs = badgeGlyphs(text);

  return (
    <div data-badge className="relative shrink-0" style={{ width: box, height: box }} aria-hidden="true">
      <svg viewBox={`0 0 ${box} ${box}`} width={box} height={box} className="absolute inset-0">
        <circle cx={c} cy={c} r={c - 0.5} className="fill-carbon stroke-line" strokeWidth={1} />
        <g className="badge-spin">
          {glyphs.map((glyph, i) => (
            <text
              key={i}
              x={c}
              y={c - r}
              textAnchor="middle"
              transform={`rotate(${glyph.angle} ${c} ${c})`}
              className="fill-accent font-mono text-xs"
            >
              {glyph.char}
            </text>
          ))}
        </g>
      </svg>
      <div
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent"
        style={{ width: 2 * r - 28, height: 2 * r - 28 }}
      >
        <ArrowUpRight className="h-5 w-5 text-carbon" />
      </div>
    </div>
  );
};

export default SignatureBadge;
