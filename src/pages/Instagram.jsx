import { useEffect, useState } from "react";
import { Camera, RefreshCw, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/kit/EmptyState";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import StatCard from "@/components/kit/StatCard";
import MediaCard from "@/components/instagram/MediaCard";
import MediaFilters from "@/components/instagram/MediaFilters";
import { filterAndSortMedia } from "@/lib/mediaFilters";
import DateRangeFilter from "@/components/shared/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { useInstagramMedia, useSyncInstagram } from "@/hooks/useInstagram";
import { useDetectOutliers } from "@/hooks/useOutliers";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { formatNumber } from "@/lib/content";
import { inDateRange } from "@/lib/dateRange";

const FILTERS_KEY = "cc.instagramFilters";
const DEFAULT_FILTERS = { query: "", type: "all", sort: "newest" };

// Type and sort are remembered between visits; search starts empty.
function loadFilters() {
  try {
    const saved = JSON.parse(localStorage.getItem(FILTERS_KEY) || "{}");
    return { ...DEFAULT_FILTERS, type: saved.type || "all", sort: saved.sort || "newest" };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function syncedLabel(value) {
  if (!value) return null;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "MMM d, h:mm a");
}

export default function Instagram() {
  const { data: media = [], isLoading } = useInstagramMedia();
  const { data: accounts = [] } = useSocialAccounts();
  const sync = useSyncInstagram();
  const detect = useDetectOutliers();
  const navigate = useNavigate();

  const findOutliers = async () => {
    await detect.mutateAsync().catch(() => {});
    navigate("/outliers");
  };

  const account = accounts.find((row) => (row.platform || "").toLowerCase() === "instagram");

  const [dateRange, setDateRange] = useState("all");
  const [filters, setFilters] = useState(loadFilters);
  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_KEY, JSON.stringify({ type: filters.type, sort: filters.sort }));
    } catch {
      // Storage unavailable: filters just won't be remembered.
    }
  }, [filters.type, filters.sort]);

  const inRange = media.filter((item) => inDateRange(item.timestamp, dateRange));
  const filtered = filterAndSortMedia(inRange, filters);
  const views = filtered.reduce((sum, item) => sum + (item.view_count || 0), 0);

  const likes = filtered.reduce((sum, item) => sum + (item.like_count || 0), 0);
  const comments = filtered.reduce((sum, item) => sum + (item.comments_count || 0), 0);
  const lastSynced = syncedLabel(account?.last_synced);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Instagram"
        title="Your Instagram"
        description="Sync your posts and see why your best ones work."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={findOutliers}
              disabled={detect.isPending}
              className="rounded-full"
            >
              <TrendingUp />
              {detect.isPending ? "Searching…" : "Find outliers"}
            </Button>

            <Button onClick={() => sync.mutate()} disabled={sync.isPending} className="rounded-full">
              <RefreshCw className={sync.isPending ? "animate-spin" : undefined} />
              {sync.isPending ? "Syncing…" : "Sync now"}
            </Button>
          </div>
        }
      />

      <DateRangeFilter value={dateRange} onChange={setDateRange} />

      {sync.isError && <p className="text-sm text-destructive">{sync.error.message}</p>}

      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Followers" value={formatNumber(account?.follower_count)} />
            <StatCard label="Posts" value={filtered.length} />
            <StatCard label="Views" value={views ? formatNumber(views) : "—"} />
            <StatCard label="Likes" value={formatNumber(likes)} />
            <StatCard label="Comments" value={formatNumber(comments)} />
          </section>

          <p className="text-xs text-muted-foreground">
            {lastSynced ? `Last synced ${lastSynced}` : "Not synced yet"}
          </p>

          {media.length > 0 && (
            <MediaFilters value={filters} onChange={setFilters} shown={filtered.length} total={inRange.length} />
          )}

          {media.length === 0 ? (
            <EmptyState
              icon={Camera}
              title="No posts yet"
              text="Press Sync now to pull your profile and posts from the connected Instagram Business account."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Camera}
              title="Nothing matches"
              text="Try a longer date range or clear the filters."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}