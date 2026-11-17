import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChannelCard({
  title,
  icon: Icon,
  tint,
  account,
  stats = [],
  syncing,
  onSync,
  syncDisabled,
  error,
  children,
}) {
  return (
    <section className="rounded-lg border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${tint}`} strokeWidth={1.75} />
          <h3 className="font-heading text-[16px] font-semibold">{title}</h3>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onSync}
          disabled={syncing || syncDisabled}
          className="rounded-full"
        >
          <RefreshCw className={syncing ? "animate-spin" : undefined} />
          {syncing ? "Syncing…" : "Sync now"}
        </Button>
      </div>

      <p className="mt-3 truncate text-sm text-muted-foreground">
        {account?.handle || "Not synced yet"}
      </p>

      {children}

      <div className="mt-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border/60 bg-background/30 p-3">
            <p className="font-heading text-lg font-light">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  );
}