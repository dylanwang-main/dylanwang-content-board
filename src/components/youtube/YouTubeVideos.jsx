import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Loader2, RefreshCw, Youtube } from "lucide-react";
import EmptyState from "@/components/kit/EmptyState";
import PageLoader from "@/components/kit/PageLoader";
import StatCard from "@/components/kit/StatCard";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useCreatorData";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useSyncYouTube, useYouTubeStats, useYouTubeVideos } from "@/hooks/useYouTube";
import { formatNumber } from "@/lib/content";

function syncedLabel(value) {
  if (!value) return null;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "MMM d, h:mm a");
}

function dateLabel(value) {
  if (!value) return null;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "MMM d, yyyy");
}

export default function YouTubeVideos() {
  const { data: videos = [], isLoading } = useYouTubeVideos();
  const { data: accounts = [] } = useSocialAccounts();
  const { data: me } = useMe();
  const sync = useSyncYouTube();

  const stats = useYouTubeStats(videos);
  const account = accounts.find((row) => (row.platform || "").toLowerCase() === "youtube");
  const handle = (me?.youtube_handle || "").trim().replace(/^@+/, "");
  const lastSynced = syncedLabel(account?.last_synced);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Videos" value={formatNumber(stats.videos)} />
        <StatCard label="Views" value={formatNumber(stats.views)} />
        <StatCard label="Likes" value={formatNumber(stats.likes)} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {handle ? `@${handle}` : "No channel handle saved"}
          {lastSynced ? ` · Last synced ${lastSynced}` : ""}
        </p>

        {handle ? (
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => sync.mutate({ handle })}
            disabled={sync.isPending}
          >
            {sync.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            {sync.isPending ? "Syncing…" : "Sync channel"}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Add your channel handle in{" "}
            <Link to="/settings" className="text-primary hover:underline">
              Settings
            </Link>{" "}
            first.
          </p>
        )}
      </div>

      {sync.isError && <p className="text-sm text-destructive">{sync.error.message}</p>}

      {isLoading ? (
        <PageLoader />
      ) : videos.length === 0 ? (
        <EmptyState
          icon={Youtube}
          title="No videos synced yet"
          text="Save your channel handle in Settings, then press Sync channel."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noreferrer"
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors hover:border-primary/40"
            >
              <div className="aspect-video bg-secondary">
                {video.thumbnail_url && (
                  <img
                    src={video.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="space-y-2 p-3">
                <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                  {video.title}
                </p>

                <p className="text-xs text-muted-foreground">
                  {formatNumber(video.view_count)} views · {formatNumber(video.like_count)} likes ·{" "}
                  {formatNumber(video.comment_count)} comments
                </p>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {dateLabel(video.published_at)}
                  </span>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
                    {video.format === "long_form" ? "Long form" : "Short"}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}