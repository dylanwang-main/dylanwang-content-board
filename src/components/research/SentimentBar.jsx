export default function SentimentBar({ label, fill, value }) {
  const percentage = Math.min(Math.max(value || 0, 0), 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm">{label}</p>
        <p className="text-sm text-muted-foreground">{value || 0}%</p>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}