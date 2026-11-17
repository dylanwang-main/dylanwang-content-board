import Panel from "@/components/kit/Panel";

export default function AnglesReport({ record }) {
  const angles = record.angles || [];

  if (angles.length === 0) return <Panel title="Top angles" />;

  return (
    <Panel title="Top angles">
      <div className="space-y-3">
        {angles.map((angle, index) => (
          <div
            key={`${angle.title}-${index}`}
            className="flex gap-4 rounded-lg bg-background/40 p-4"
          >
            <p className="font-heading text-2xl leading-none text-primary">
              {angle.rank || index + 1}
            </p>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">{angle.title}</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                  Strength {Math.round(angle.strength || 0)}
                </span>
              </div>

              <p className="mt-2 text-sm italic text-muted-foreground">{`"${angle.hook_idea}"`}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                For {angle.avatar} · {angle.evidence}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}