import { Instagram } from "lucide-react";
import { format, parseISO } from "date-fns";
import ChannelCard from "@/components/settings/ChannelCard";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useSyncInstagram } from "@/hooks/useInstagram";
import { formatNumber } from "@/lib/content";

function syncedLabel(value) {
  if (!value) return "Never";
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? "Never" : format(date, "MMM d, h:mm a");
}

export default function InstagramConnect() {
  const { data: accounts = [] } = useSocialAccounts();
  const sync = useSyncInstagram();

  const account = accounts.find((row) => (row.platform || "").toLowerCase() === "instagram");

  return (
    <ChannelCard
      title="Instagram"
      icon={Instagram}
      tint="text-pink-500"
      account={account}
      syncing={sync.isPending}
      onSync={() => sync.mutate()}
      error={sync.isError ? sync.error.message : null}
      stats={[
        { label: "Followers", value: formatNumber(account?.follower_count) },
        { label: "Posts", value: formatNumber(account?.media_count) },
        { label: "Last synced", value: syncedLabel(account?.last_synced) },
      ]}
    />
  );
}