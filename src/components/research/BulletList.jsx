export default function BulletList({ title, items }) {
  const list = items || [];

  if (list.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-2.5 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}