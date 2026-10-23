import StatCard from "@/components/kit/StatCard";
import { formatNumber } from "@/lib/content";

export default function PerformanceStats({ summary }) {
  const average = summary.views / summary.published;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Published" value={summary.published} />

      <StatCard
        label="Total views"
        value={formatNumber(summary.views)}
        hint={`${formatNumber(average)} avg per piece`}
      />

      <StatCard
        label="Interactions"
        value={formatNumber(summary.interactions)}
        hint="Likes, comments, shares, saves"
      />

      <StatCard
        label="Engagement rate"
        value={summary.rate === null ? "—" : `${summary.rate.toFixed(1)}%`}
        hint="Interactions ÷ views"
      />
    </div>
  );
}