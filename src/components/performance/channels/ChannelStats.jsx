import StatCard from "@/components/kit/StatCard";
import { formatNumber } from "@/lib/content";

export default function ChannelStats({ metrics }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Posts" value={metrics.posts.length} hint="Synced in this range" />

      <StatCard
        label="Views"
        value={formatNumber(metrics.views)}
        hint="Instagram doesn't share views"
      />

      <StatCard
        label="Likes"
        value={formatNumber(metrics.likes)}
        hint="Across all three channels"
      />

      <StatCard
        label="Engagement rate"
        value={metrics.rate === null ? "—" : `${metrics.rate.toFixed(1)}%`}
        hint="Likes, comments and shares ÷ views"
      />
    </div>
  );
}