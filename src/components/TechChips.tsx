interface TechChipsProps {
  items: readonly string[];
  labels: Record<string, string>;
}

const TechChips = ({ items, labels }: TechChipsProps) => (
  <ul className="flex flex-wrap gap-2">
    {items.map((item) => (
      <li key={item} className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-medium text-bento-black">
        {labels[item] ?? item}
      </li>
    ))}
  </ul>
);

export default TechChips;
