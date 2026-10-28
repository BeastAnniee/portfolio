interface TechChipsProps {
  items: readonly string[];
  labels: Record<string, string>;
  /** Sobre fondo bone (bloque invertido): borde y texto en carbon. */
  inverted?: boolean;
}

const TechChips = ({ items, labels, inverted = false }: TechChipsProps) => (
  <ul className="flex flex-wrap gap-2">
    {items.map((item) => (
      <li
        key={item}
        className={`rounded-lg border px-2.5 py-1 font-mono text-xs uppercase tracking-[0.12em] ${
          inverted ? 'border-carbon text-carbon' : 'border-line text-bone'
        }`}
      >
        {labels[item] ?? item}
      </li>
    ))}
  </ul>
);

export default TechChips;
