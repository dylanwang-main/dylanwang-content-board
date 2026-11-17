import { Eye, Heart, ImageOff, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDissectOutlier } from "@/hooks/useOutliers";
import { formatNumber } from "@/lib/content";

export const PLATFORM_STYLES = {
  instagram: { label: "Instagram", color: "text-purple-400" },
  tiktok: { label: "TikTok", color: "text-cyan-400" },
  youtube: { label: "YouTube", color: "text-red-500" },
};

const STATUS_STYLES = {
  detected: "bg-chart-2/15 text-chart-2",
  dissecting: "bg-primary/15 text-primary",
  dissected: "bg-primary/15 text-primary",
  failed: "bg-destructive/15 text-destructive",
};

function StatusPill({ status }) {
  const label =
    status === "dissecting"
      ? "Breaking down…"
      : status === "dissected"
        ? "Broken down"
        : status === "failed"
          ? "Failed"
          : "Ready to break down";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
        STATUS_STYLES[status] || STATUS_STYLES.detected
      }`}
    >
      {status === "dissecting" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
      {label}
    </span>
  );
}

export default function OutlierCard({ outlier, onOpen }) {
  const dissect = useDissectOutlier();
  const platform = PLATFORM_STYLES[outlier.platform] || {
    label: outlier.platform || "Post",
    color: "text-muted-foreground",
  };
  const metrics = outlier.metrics || {};
  const status = outlier.status || "detected";

  return (
    <article
      onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-lg border border-border/70 bg-card transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-square">
        {outlier.thumbnail_url ? (
          <img
            src={outlier.thumbnail_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
            <ImageOff className="h-6 w-6" strokeWidth={1.5} />
          </div>
        )}

        <span
          className={`absolute left-2 top-2 inline-flex items-center rounded-full bg-card/80 px-2 py-0.5 text-[11px] font-medium backdrop-blur ${platform.color}`}
        >
          {platform.label}
        </span>
      </div>

      <div className="space-y-2.5 p-4">
        <p className="line-clamp-2 text-sm font-medium">{outlier.title || "Untitled post"}</p>

        <p className="font-heading text-xl text-primary">
          {Number(outlier.engagement_score || 0).toFixed(1)}x{" "}
          <span className="font-body text-xs text-muted-foreground">your average</span>
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {outlier.platform !== "instagram" && (
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(metrics.views)}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {formatNumber(metrics.likes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {formatNumber(metrics.comments)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <StatusPill status={status} />

          {(status === "detected" || status === "failed") && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={dissect.isPending}
              onClick={(event) => {
                event.stopPropagation();
                dissect.mutate(outlier.id);
              }}
            >
              Break it down
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}