interface SectionHeadingProps {
  id: string;
  children: React.ReactNode;
  /** Microtexto de ficha sobre el titular (p. ej. «EXP. 01»). */
  ficha?: string;
  /** Dentro del bloque invertido (fondo bone): todo en carbon. */
  inverted?: boolean;
}

// `cqi` se resuelve contra el contenedor más cercano: cada <section> lleva `@container`.
const SectionHeading = ({ id, children, ficha, inverted = false }: SectionHeadingProps) => (
  <div className="mb-8">
    {ficha && (
      <p
        className={`mb-2 font-mono text-xs uppercase tracking-[0.12em] ${inverted ? 'text-carbon' : 'text-bone-2'}`}
      >
        {ficha}
      </p>
    )}
    <h2
      id={id}
      className={`font-display text-[clamp(2.5rem,8cqi,4.5rem)] uppercase leading-[0.95] ${
        inverted ? 'text-carbon' : 'text-accent'
      }`}
    >
      {children}
    </h2>
  </div>
);

export default SectionHeading;
