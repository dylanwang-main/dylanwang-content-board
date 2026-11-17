import { ExternalLink, Loader2 } from "lucide-react";
import { useMediaInsights } from "@/hooks/useInstagram";
import { formatNumber } from "@/lib/content";

const STAT_LABELS = [
  ["views", "Views"],
  ["reach", "Accounts reached"],
  ["likes", "Likes"],
  ["comments", "Comments"],
  ["shares", "Shares"],
  ["saved", "Saves"],
  ["follows", "Follows"],
  ["profile_visits", "Profile visits"],
  ["ig_reels_avg_watch_time", "Avg watch time"],
  ["ig_reels_video_view_total_time", "Total watch time"],
];

// Watch times come back in milliseconds.
function duration(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function Stats({ item }) {
  const { data, isLoading, error } = useMediaInsights(item);
  if (isLoading)
    return (
      <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading stats…
      </p>
    );
  if (error) return <p className="mt-4 text-xs text-destructive">{error.message}</p>;
  const rows = STAT_LABELS.filter(([key]) => data?.[key] != null);
  if (!rows.length) return <p className="mt-4 text-xs text-muted-foreground">Instagram has no stats for this post.</p>;
  return (
    <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {rows.map(([key, label]) => (
        <div key={key} className="bg-card px-3 py-2.5">
          <dt className="text-[11px] text-muted-foreground">{label}</dt>
          <dd className="mt-0.5 font-mono text-sm">
            {key.includes("time") ? duration(data[key]) : formatNumber(data[key])}
          </dd>
        </div>
      ))}
    </dl>
  );
}
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function MediaDetailDialog({ item, score, onClose }) {
  const analyzed = item.status === "analyzed";

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-lg">
        <DialogTitle className="sr-only">Instagram post</DialogTitle>

        {item.thumbnail_url && (
          <img
            src={item.thumbnail_url}
            alt=""
            className="max-h-72 w-full rounded-lg object-cover"
          />
        )}

        {item.permalink && (
          <a
            href={item.permalink}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Open on Instagram
          </a>
        )}

        {score?.multiple != null && (
          <p className="mt-4 text-sm">
            <span className="font-mono text-primary">{score.multiple >= 10 ? Math.round(score.multiple) : score.multiple.toFixed(1)}x</span>{" "}
            your median {score.metric} ({formatNumber(score[score.metric])} vs {formatNumber(score.median)} for your last 30{" "}
            {score.trial ? "trial/hidden reels" : score.kind === "reel" ? "reels" : "posts"}).
          </p>
        )}
        <Stats item={item} />

        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
          {item.caption || "No caption"}
        </p>

        {analyzed ? (
          <div className="mt-6 space-y-5">
            {item.hook && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  Hook
                </p>
                <p className="mt-1.5 text-sm italic text-primary">{item.hook}</p>
              </div>
            )}

            {item.summary && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  Summary
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{item.summary}</p>
              </div>
            )}

            {Array.isArray(item.why_it_works) && item.why_it_works.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  Why it works
                </p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
                  {item.why_it_works.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {item.transcript && (
              <details className="rounded-lg border border-border/70 bg-background/40 p-3">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                  Transcript
                </summary>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
                  {item.transcript}
                </p>
              </details>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Press Analyze to break this post down.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}