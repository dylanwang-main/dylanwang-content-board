import Panel from "@/components/kit/Panel";
import { formatNumber } from "@/lib/content";

export default function ChannelBreakdown({ channels }) {
  const top = channels.reduce((max, channel) => Math.max(max, channel.views), 0);

  return (
    <Panel title="By channel">
      <div className="space-y-4">
        {channels.map((channel) => (
          <div key={channel.platform}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="truncate text-sm font-medium">{channel.platform}</p>
              <p className="shrink-0 text-xs text-muted-foreground">
                {formatNumber(channel.views)} views ·{" "}
                {channel.rate === null ? "—" : `${channel.rate.toFixed(1)}%`}
              </p>
            </div>

            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary/80"
                style={{ width: `${top ? (channel.views / top) * 100 : 0}%` }}
              />
            </div>

            <p className="mt-1.5 text-xs text-muted-foreground">
              {channel.posts} posts · {formatNumber(channel.likes)} likes ·{" "}
              {formatNumber(channel.comments)} comments
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}