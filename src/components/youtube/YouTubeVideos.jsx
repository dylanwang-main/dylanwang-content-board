import { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Loader2, RefreshCw, Youtube } from "lucide-react";
import EmptyState from "@/components/kit/EmptyState";
import PageLoader from "@/components/kit/PageLoader";
import StatCard from "@/components/kit/StatCard";
import DateRangeFilter from "@/components/shared/DateRangeFilter";
import YouTubeVideoCard from "@/components/youtube/YouTubeVideoCard";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useCreatorData";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useSyncYouTube, useYouTubeStats, useYouTubeVideos } from "@/hooks/useYouTube";
import { formatNumber } from "@/lib/content";
import { inDateRange } from "@/lib/dateRange";

function syncedLabel(value) {
  if (!value) return null;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "MMM d, h:mm a");
}

export default function YouTubeVideos() {
  const { data: videos = [], isLoading } = useYouTubeVideos();
  const { data: accounts = [] } = useSocialAccounts();
  const { data: me } = useMe();
  const sync = useSyncYouTube();
  const [dateRange, setDateRange] = useState("all");

  const filtered = videos.filter((video) => inDateRange(video.published_at, dateRange));
  const stats = useYouTubeStats(filtered);
  const account = accounts.find((row) => (row.platform || "").toLowerCase() === "youtube");
  const handle = (me?.youtube_handle || "").trim().replace(/^@+/, "");
  const lastSynced = syncedLabel(account?.last_synced);

  return (
    <div className="space-y-6">
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

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
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Youtube}
          title="No videos in this range"
          text="Pick a longer range or All content."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => (
            <YouTubeVideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}