import { Camera, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import EmptyState from "@/components/kit/EmptyState";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import StatCard from "@/components/kit/StatCard";
import MediaCard from "@/components/instagram/MediaCard";
import { Button } from "@/components/ui/button";
import { useInstagramMedia, useSyncInstagram } from "@/hooks/useInstagram";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { formatNumber } from "@/lib/content";

function syncedLabel(value) {
  if (!value) return null;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "MMM d, h:mm a");
}

export default function Instagram() {
  const { data: media = [], isLoading } = useInstagramMedia();
  const { data: accounts = [] } = useSocialAccounts();
  const sync = useSyncInstagram();

  const account = accounts.find((row) => (row.platform || "").toLowerCase() === "instagram");

  const likes = media.reduce((sum, item) => sum + (item.like_count || 0), 0);
  const comments = media.reduce((sum, item) => sum + (item.comments_count || 0), 0);
  const lastSynced = syncedLabel(account?.last_synced);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Instagram"
        title="Your Instagram"
        description="Sync your posts and see why your best ones work."
        action={
          <Button onClick={() => sync.mutate()} disabled={sync.isPending} className="rounded-full">
            <RefreshCw className={sync.isPending ? "animate-spin" : undefined} />
            {sync.isPending ? "Syncing…" : "Sync now"}
          </Button>
        }
      />

      {sync.isError && <p className="text-sm text-destructive">{sync.error.message}</p>}

      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Followers" value={formatNumber(account?.follower_count)} />
            <StatCard label="Posts" value={media.length} />
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
              text="Connect Instagram in your Base44 Integrations tab, then press Sync now."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {media.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}