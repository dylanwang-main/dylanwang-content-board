import { useEffect, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Link2, Loader2, RefreshCw, Youtube } from "lucide-react";
import EmptyState from "@/components/kit/EmptyState";
import PageLoader from "@/components/kit/PageLoader";
import StatCard from "@/components/kit/StatCard";
import DateRangeFilter from "@/components/shared/DateRangeFilter";
import YouTubeVideoCard from "@/components/youtube/YouTubeVideoCard";
import VideoFilters from "@/components/youtube/VideoFilters";
import { filterAndSortVideos } from "@/lib/videoFilters";
import { connectYouTubeAccount, disconnectYouTubeAccount, getYouTubeAccessToken } from "@/lib/googleAuth";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useCreatorData";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useSyncYouTube, useYouTubeStats, useYouTubeVideos } from "@/hooks/useYouTube";
import { formatNumber } from "@/lib/content";
import { inDateRange } from "@/lib/dateRange";

const FILTERS_KEY = "cc.youtubeFilters";
const DEFAULT_FILTERS = { query: "", format: "all", visibility: "all", sort: "newest" };

// Format and sort are remembered between visits; search starts empty.
function loadFilters() {
  try {
    const saved = JSON.parse(localStorage.getItem(FILTERS_KEY) || "{}");
    return { ...DEFAULT_FILTERS, format: saved.format || "all", visibility: saved.visibility || "all", sort: saved.sort || "newest" };
  } catch {
    return DEFAULT_FILTERS;
  }
}

const subscribeKeys = (cb) => {
  window.addEventListener("cc-keys-changed", cb);
  return () => window.removeEventListener("cc-keys-changed", cb);
};

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
  const [filters, setFilters] = useState(loadFilters);
  const connected = Boolean(useSyncExternalStore(subscribeKeys, getYouTubeAccessToken));
  const [connectError, setConnectError] = useState("");

  const connect = async () => {
    setConnectError("");
    try {
      await connectYouTubeAccount();
      sync.mutate({ handle });
    } catch (err) {
      setConnectError(err.message);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(
        FILTERS_KEY,
        JSON.stringify({ format: filters.format, visibility: filters.visibility, sort: filters.sort }),
      );
    } catch {
      // Storage unavailable: filters just won't be remembered.
    }
  }, [filters.format, filters.visibility, filters.sort]);

  const inRange = videos.filter((video) => inDateRange(video.published_at, dateRange));
  const filtered = filterAndSortVideos(inRange, filters);
  const stats = useYouTubeStats(filtered);
  const account = accounts.find((row) => (row.platform || "").toLowerCase() === "youtube");
  const handle = (me?.youtube_handle || "").trim().replace(/^@+/, "");
  const lastSynced = syncedLabel(account?.last_synced);

  return (
    <div className="space-y-6">
      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {videos.length > 0 && (
        <VideoFilters
          value={filters}
          onChange={setFilters}
          shown={filtered.length}
          total={inRange.length}
          showVisibility={videos.some((v) => v.privacy_status && v.privacy_status !== "public")}
        />
      )}

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

        <div className="flex flex-wrap items-center gap-2">
          {connected ? (
            <Button variant="ghost" className="rounded-full text-muted-foreground" onClick={disconnectYouTubeAccount}>
              Disconnect Google
            </Button>
          ) : (
            <Button variant="outline" className="rounded-full" onClick={connect} disabled={sync.isPending}>
              <Link2 />
              Connect YouTube account
            </Button>
          )}
        {handle || connected ? (
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
      </div>

      <p className="text-xs text-muted-foreground">
        {connected
          ? "Connected to your Google account: syncs include unlisted and private videos."
          : "Syncing with an API key shows public videos only. Connect your YouTube account to include unlisted and private ones."}
      </p>
      {connectError && <p className="text-sm text-destructive">{connectError}</p>}

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
          title="No videos match"
          text="Try a longer date range, a different format, or clear your search."
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