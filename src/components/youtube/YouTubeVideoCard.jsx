import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { useAnalyzeYouTubeVideo } from "@/hooks/useYouTube";
import { formatNumber } from "@/lib/content";
import { engagementRate } from "@/lib/videoFilters";

const STATUS_PILLS = {
  synced: "bg-muted text-muted-foreground",
  analyzing: "bg-primary/15 text-primary",
  analyzed: "bg-chart-2/15 text-chart-2",
  failed: "bg-destructive/15 text-destructive",
};

const STATUS_LABELS = {
  synced: "Synced",
  analyzing: "Analyzing…",
  analyzed: "Analyzed",
  failed: "Failed",
};

function dateLabel(value) {
  if (!value) return null;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "MMM d, yyyy");
}

function durationLabel(seconds) {
  const total = Math.round(seconds || 0);
  if (!total) return null;

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export default function YouTubeVideoCard({ video }) {
  const analyze = useAnalyzeYouTubeVideo();
  const [open, setOpen] = useState(false);

  const status = video.status || "synced";
  const duration = durationLabel(video.duration_seconds);
  const whyItWorks = Array.isArray(video.why_it_works) ? video.why_it_works : [];

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors hover:border-primary/40">
      <a href={video.url} target="_blank" rel="noreferrer" className="group block">
        <div className="relative aspect-video bg-secondary">
          {video.thumbnail_url && (
            <img
              src={video.thumbnail_url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}

          {duration && (
            <span className="absolute bottom-2 right-2 rounded-full bg-card/85 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
              {duration}
            </span>
          )}
        </div>
      </a>

      <div className="space-y-2 p-3">
        <a
          href={video.url}
          target="_blank"
          rel="noreferrer"
          className="group block"
        >
          <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">
            {video.title}
          </p>
        </a>

        <p className="text-xs text-muted-foreground">
          {formatNumber(video.view_count)} views · {formatNumber(video.like_count)} likes ·{" "}
          {formatNumber(video.comment_count)} comments
          {engagementRate(video) !== null && ` · ${(engagementRate(video) * 100).toFixed(1)}% eng.`}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">
            {dateLabel(video.published_at)}
          </span>
          <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
            {video.format === "long_form" ? "Long form" : "Short"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
              STATUS_PILLS[status] || STATUS_PILLS.synced
            }`}
          >
            {status === "analyzing" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
            {STATUS_LABELS[status] || "Synced"}
          </span>

          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={status === "analyzing"}
            onClick={() => analyze.mutate(video.id)}
          >
            <Sparkles />
            {status === "analyzed" ? "Re-analyze" : "Analyze"}
          </Button>
        </div>

        {status === "analyzed" && (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Details
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}

        {status === "analyzed" && open && (
          <div className="space-y-3 rounded-xl border border-border/70 bg-secondary/40 p-3">
            {video.hook && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Hook
                </p>
                <p className="mt-1 text-sm italic text-primary">{video.hook}</p>
              </div>
            )}

            {video.summary && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Summary
                </p>
                <p className="mt-1 text-sm leading-relaxed">{video.summary}</p>
              </div>
            )}

            {whyItWorks.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Why it works
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm leading-relaxed">
                  {whyItWorks.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {status === "failed" && video.error && (
          <p className="text-xs text-destructive">{video.error}</p>
        )}
      </div>
    </article>
  );
}