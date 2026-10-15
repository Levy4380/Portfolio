type TechListProps = {
  items: readonly string[];
  /** Accessible name when the list has no visible heading. */
  label?: string;
};

export function TechList({ items, label }: TechListProps) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item}>
          <span className="inline-block rounded-chip border border-line bg-sunken px-2 py-0.5 font-mono text-meta text-fg-muted">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
