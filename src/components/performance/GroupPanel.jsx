import Panel from "@/components/kit/Panel";
import { formatNumber } from "@/lib/content";

export default function GroupPanel({ title, groups }) {
  const top = groups.reduce((max, group) => Math.max(max, group.views), 0);

  return (
    <Panel title={title}>
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="truncate text-sm font-medium">{group.label}</p>
              <p className="shrink-0 text-xs text-muted-foreground">
                {formatNumber(group.views)} views ·{" "}
                {group.rate === null ? "—" : `${group.rate.toFixed(1)}%`}
              </p>
            </div>

            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary/80"
                style={{ width: `${top ? (group.views / top) * 100 : 0}%` }}
              />
            </div>

            <p className="mt-1.5 text-xs text-muted-foreground">
              {group.pieces} {group.pieces === 1 ? "piece" : "pieces"}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}