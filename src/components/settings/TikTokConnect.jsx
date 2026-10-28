import { Music2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import ChannelCard from "@/components/settings/ChannelCard";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useSyncTikTok } from "@/hooks/useTikTok";
import { formatNumber } from "@/lib/content";

function syncedLabel(value) {
  if (!value) return "Never";
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? "Never" : format(date, "MMM d, h:mm a");
}

export default function TikTokConnect() {
  const { data: accounts = [] } = useSocialAccounts();
  const sync = useSyncTikTok();

  const account = accounts.find((row) => (row.platform || "").toLowerCase() === "tiktok");

  return (
    <ChannelCard
      title="TikTok"
      icon={Music2}
      tint="text-cyan-400"
      account={account}
      syncing={sync.isPending}
      onSync={() => sync.mutate()}
      error={sync.isError ? sync.error.message : null}
      stats={[
        { label: "Followers", value: formatNumber(account?.follower_count) },
        { label: "Videos", value: formatNumber(account?.media_count) },
        { label: "Last synced", value: syncedLabel(account?.last_synced) },
      ]}
    />
  );
}