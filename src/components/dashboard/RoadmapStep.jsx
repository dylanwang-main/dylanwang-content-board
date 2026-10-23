export default function RoadmapStep({ step, index }) {
  const actions = step.actions || [];

  return (
    <li className="rounded-2xl border border-border/60 p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary text-[11px] font-medium text-primary">
          {index + 1}
        </span>
        <p className="font-medium">{step.title}</p>
        {step.timeframe && (
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
            {step.timeframe}
          </span>
        )}
      </div>

      {actions.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      )}

      {step.target && <p className="mt-3 text-xs text-muted-foreground">Target: {step.target}</p>}
    </li>
  );
}