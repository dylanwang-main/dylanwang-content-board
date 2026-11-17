export default function TrainingProgress({ trained = 0, total = 7, learnedCount = 0 }) {
  const percent = total > 0 ? (trained / total) * 100 : 0;

  return (
    <section className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Training
        </p>
        <p className="text-xs text-muted-foreground">
          {learnedCount} {learnedCount === 1 ? "file" : "files"} learned
        </p>
      </div>

      <p className="mt-2 font-heading text-3xl font-light">
        {trained} <span className="text-lg text-muted-foreground">of {total} sections</span>
      </p>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}