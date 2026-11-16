import { useState } from "react";
import { Youtube } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import ChannelCard from "@/components/settings/ChannelCard";
import Field from "@/components/kit/Field";
import { Input } from "@/components/ui/input";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { useSaveMe, useMe } from "@/hooks/useCreatorData";
import { useSyncYouTube } from "@/hooks/useYouTube";
import { formatNumber } from "@/lib/content";

function syncedLabel(value) {
  if (!value) return "Never";
  const date = parseISO(value);
  return Number.isNaN(date.getTime()) ? "Never" : format(date, "MMM d, h:mm a");
}

export default function YouTubeConnect() {
  const { data: accounts = [] } = useSocialAccounts();
  const { data: me } = useMe();
  const saveMe = useSaveMe();
  const queryClient = useQueryClient();
  const sync = useSyncYouTube();
  const [handle, setHandle] = useState(me?.youtube_handle || "");

  const account = accounts.find((row) => (row.platform || "").toLowerCase() === "youtube");
  const trimmed = handle.trim();

  const handleSync = async () => {
    await saveMe.mutateAsync({ youtube_handle: trimmed });
    queryClient.invalidateQueries({ queryKey: ["me"] });
    sync.mutate({ handle: trimmed });
  };

  return (
    <ChannelCard
      title="YouTube"
      icon={Youtube}
      tint="text-red-500"
      account={account}
      syncing={sync.isPending || saveMe.isPending}
      onSync={handleSync}
      syncDisabled={!trimmed}
      error={sync.isError ? sync.error.message : null}
      stats={[
        { label: "Subscribers", value: formatNumber(account?.follower_count) },
        { label: "Videos", value: formatNumber(account?.media_count) },
        { label: "Last synced", value: syncedLabel(account?.last_synced) },
      ]}
    >
      <div className="mt-4">
        <Field label="Channel handle">
          <Input
            className="rounded-xl"
            placeholder="@yourchannel"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
          />
        </Field>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Needs a YouTube Data API v3 key, added under "AI and API keys" above.
      </p>
    </ChannelCard>
  );
}