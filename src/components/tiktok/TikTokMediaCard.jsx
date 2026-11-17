import { useState } from "react";
import {
  Check,
  Eye,
  Heart,
  ImageOff,
  Loader2,
  MessageCircle,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import TikTokDetailDialog from "@/components/tiktok/TikTokDetailDialog";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/content";
import { useAnalyzeTikTokMedia, useDeleteTikTokMedia } from "@/hooks/useTikTok";

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

export default function TikTokMediaCard({ item }) {
  const analyze = useAnalyzeTikTokMedia();
  const remove = useDeleteTikTokMedia();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const date = item.create_time ? parseISO(item.create_time) : null;
  const dateLabel = date && !Number.isNaN(date.getTime()) ? format(date, "MMM d") : null;
  const status = item.status || "synced";

  return (
    <>
      <article
        onClick={() => setOpen(true)}
        className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-card transition-colors hover:border-primary/40"
      >
        <div className="relative aspect-[9/16]">
          {item.cover_image_url ? (
            <img
              src={item.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
              <ImageOff className="h-6 w-6" strokeWidth={1.5} />
            </div>
          )}

          <div
            className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-card/80 p-1 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            onClick={(event) => event.stopPropagation()}
          >
            {remove.isPending ? (
              <span className="flex h-6 w-6 items-center justify-center">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </span>
            ) : confirming ? (
              <>
                <button
                  type="button"
                  aria-label="Confirm delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    remove.mutate(item.id);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-emerald-400 hover:bg-emerald-400/10"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Cancel delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    setConfirming(false);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                aria-label="Delete video"
                onClick={(event) => {
                  event.stopPropagation();
                  setConfirming(true);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 p-3">
          <p className="line-clamp-2 text-sm">{item.video_description || "No description"}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatNumber(item.view_count)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatNumber(item.like_count)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {formatNumber(item.comment_count)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Share2 className="h-3 w-3" />
              {formatNumber(item.share_count)}
            </span>
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

      {open && <TikTokDetailDialog item={item} onClose={() => setOpen(false)} />}
    </>
  );
}