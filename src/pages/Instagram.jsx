import { useState } from "react";
import { Camera, RefreshCw, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/kit/EmptyState";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import StatCard from "@/components/kit/StatCard";
import MediaCard from "@/components/instagram/MediaCard";
import DateRangeFilter from "@/components/shared/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { useInstagramMedia, useSyncInstagram } from "@/hooks/useInstagram";
import { useDetectOutliers } from "@/hooks/useOutliers";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { formatNumber } from "@/lib/content";
import { inDateRange } from "@/lib/dateRange";

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
  const filtered = media.filter((item) => inDateRange(item.timestamp, dateRange));

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
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Followers" value={formatNumber(account?.follower_count)} />
            <StatCard label="Posts" value={filtered.length} />
            <StatCard label="Likes" value={formatNumber(likes)} />
            <StatCard label="Comments" value={formatNumber(comments)} />
          </section>

          <p className="text-xs text-muted-foreground">
            {lastSynced ? `Last synced ${lastSynced}` : "Not synced yet"}
          </p>

          {media.length === 0 ? (
            <EmptyState
              icon={Camera}
              title="No posts yet"
              text="Press Sync now to pull your profile and posts from the connected Instagram Business account."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Camera}
              title="No posts in this range"
              text="Pick a longer range or All content."
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