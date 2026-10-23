export default function CommonalityRow({ item }) {
  const percentage = Math.min(Math.max(Math.round(item.percentage || 0), 0), 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm">{item.theme}</p>
        <p className="font-heading text-sm text-primary">{percentage}%</p>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
      </div>
      {item.detail && <p className="mt-2 text-xs text-muted-foreground">{item.detail}</p>}
    </div>
  );
}