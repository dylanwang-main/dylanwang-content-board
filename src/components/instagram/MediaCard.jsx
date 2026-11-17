import { useState } from "react";
import {
  Eye,
  Heart,
  Send,
  ImageOff,
  Bookmark,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import MediaDetailDialog from "@/components/instagram/MediaDetailDialog";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/content";
import { useAnalyzeInstagramMedia } from "@/hooks/useInstagram";
import { isReel } from "@/lib/mediaFilters";
import { MultipleBadge } from "@/pages/Analysis";

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

export default function MediaCard({ item, score }) {
  const analyze = useAnalyzeInstagramMedia();
  const [open, setOpen] = useState(false);

  const date = item.timestamp ? parseISO(item.timestamp) : null;
  const dateLabel = date && !Number.isNaN(date.getTime()) ? format(date, "MMM d") : null;
  const status = item.status || "synced";

  return (
    <>
      <article
        onClick={() => setOpen(true)}
        className="group relative cursor-pointer overflow-hidden rounded-lg border border-border/70 bg-card transition-colors hover:border-primary/40"
      >
        <div className="relative aspect-square">
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
              <ImageOff className="h-6 w-6" strokeWidth={1.5} />
            </div>
          )}

          <MultipleBadge post={score} className="absolute bottom-2 left-2 bg-black/70 backdrop-blur" />
          <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
            {isReel(item) ? "REEL" : item.media_type === "CAROUSEL_ALBUM" ? "CAROUSEL" : "POST"}
          </span>

        </div>

        <div className="space-y-2 p-3">
          <p className="line-clamp-2 text-sm">{item.caption || "No caption"}</p>

          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            {item.view_count != null && (
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatNumber(item.view_count)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatNumber(item.like_count)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {formatNumber(item.comments_count)}
            </span>
            {item.shares_count != null && (
              <span className="inline-flex items-center gap-1">
                <Send className="h-3 w-3" />
                {formatNumber(item.shares_count)}
              </span>
            )}
            {item.saved_count != null && (
              <span className="inline-flex items-center gap-1">
                <Bookmark className="h-3 w-3" />
                {formatNumber(item.saved_count)}
              </span>
            )}
            {dateLabel && <span className="ml-auto">{dateLabel}</span>}
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
              onClick={(event) => {
                event.stopPropagation();
                analyze.mutate(item.id);
              }}
            >
              {status === "analyzed" ? "Re-analyze" : "Analyze"}
            </Button>
          </div>
        </div>
      </article>

      {open && <MediaDetailDialog item={item} score={score} onClose={() => setOpen(false)} />}
    </>
  );
}