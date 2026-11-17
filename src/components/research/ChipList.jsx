export default function ChipList({ title, items }) {
  const list = items || [];

  if (list.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs text-muted-foreground">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {list.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}