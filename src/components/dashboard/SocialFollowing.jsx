import { Instagram, Music2, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import Panel from "@/components/kit/Panel";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { formatNumber } from "@/lib/content";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: Instagram, tint: "text-purple-400" },
  { key: "tiktok", label: "TikTok", icon: Music2, tint: "text-cyan-400" },
  { key: "youtube", label: "YouTube", icon: Youtube, tint: "text-red-500" },
];

function ChannelCard({ label, icon: Icon, tint, account }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/40 p-4">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${tint}`} strokeWidth={1.75} />
        <span className="text-sm font-medium">{label}</span>
      </div>

      {account ? (
        <>
          {account.handle && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{account.handle}</p>
          )}
          <div className="mt-3 flex items-baseline gap-4">
            <div>
              <p className="font-heading text-lg font-light">{formatNumber(account.follower_count)}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">followers</p>
            </div>
            <div>
              <p className="font-heading text-lg font-light">{formatNumber(account.following_count)}</p>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">following</p>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground">Not connected</p>
          <Link to="/settings" className="text-xs text-primary hover:underline">
            Connect in Settings
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SocialFollowing() {
  const { data: accounts = [], isLoading } = useSocialAccounts();

  const total = accounts.reduce((sum, account) => sum + (account.follower_count || 0), 0);

  return (
    <Panel>
      <h2 className="font-heading text-2xl font-light tracking-tight">{formatNumber(total)} followers</h2>
      <p className="mt-1 text-sm text-muted-foreground">Across your connected channels</p>

      {isLoading ? (
        <p className="mt-5 text-sm text-muted-foreground">Loading your channels…</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PLATFORMS.map((platform) => (
            <ChannelCard
              key={platform.key}
              label={platform.label}
              icon={platform.icon}
              tint={platform.tint}
              account={accounts.find(
                (account) => (account.platform || "").toLowerCase() === platform.key
              )}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}