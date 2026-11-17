import { format, parseISO } from "date-fns";
import { Instagram, Music2, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/useCreatorData";
import { useSyncInstagram } from "@/hooks/useInstagram";
import { useSyncTikTok } from "@/hooks/useTikTok";
import { useSyncYouTube } from "@/hooks/useYouTube";
import { formatNumber } from "@/lib/content";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: Instagram, color: "text-purple-400" },
  { key: "tiktok", label: "TikTok", icon: Music2, color: "text-cyan-400" },
  { key: "youtube", label: "YouTube", icon: Youtube, color: "text-red-500" },
];

function syncedLabel(value) {
  if (!value) return null;
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? null : format(date, "MMM d");
}

export default function ChannelConnections({ accounts = [] }) {
  const { data: me } = useMe();
  const syncInstagram = useSyncInstagram();
  const syncTikTok = useSyncTikTok();
  const syncYouTube = useSyncYouTube();

  const youtubeHandle = (me?.youtube_handle || "").trim().replace(/^@+/, "");

  const accountFor = (key) =>
    accounts.find((row) => (row.platform || "").toLowerCase() === key) || null;

  const mutations = { instagram: syncInstagram, tiktok: syncTikTok, youtube: syncYouTube };

  return (
    <div className="rounded-lg border border-border/70 bg-card/70 px-4 py-2 sm:px-5">
      {PLATFORMS.map(({ key, label, icon: Icon, color }) => {
        const account = accountFor(key);
        const sync = mutations[key];
        const handle =
          key === "youtube"
            ? youtubeHandle
              ? `@${youtubeHandle}`
              : ""
            : account?.handle || "";
        const synced = syncedLabel(account?.last_synced);
        const needsSetup = key === "youtube" && !youtubeHandle;

        return (
          <div
            key={key}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 py-3 last:border-0"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Icon className={`h-4 w-4 shrink-0 ${color}`} />
              <span className="text-sm font-medium">{label}</span>
              {handle && <span className="truncate text-xs text-muted-foreground">{handle}</span>}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {formatNumber(account?.follower_count)} followers
              </span>
              <span className="text-xs text-muted-foreground">
                {synced ? `Last synced ${synced}` : "Not synced"}
              </span>

              {needsSetup ? (
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to="/settings">Set up</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={sync.isPending}
                  onClick={() =>
                    key === "youtube" ? sync.mutate({ handle: youtubeHandle }) : sync.mutate()
                  }
                >
                  Sync
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}