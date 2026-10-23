import { Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import Panel from "@/components/kit/Panel";
import ScanStat from "@/components/research/ScanStat";

const STATS = [
  { key: "views", label: "Views", icon: Eye },
  { key: "likes", label: "Likes", icon: Heart },
  { key: "comments", label: "Comments", icon: MessageCircle },
  { key: "shares", label: "Shares", icon: Share2 },
];

export default function AnalyticsCard({ scan }) {
  const analytics = scan.analytics || {};

  return (
    <Panel title="Public analytics">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((stat) => (
          <ScanStat
            key={stat.key}
            label={stat.label}
            icon={stat.icon}
            value={analytics[stat.key]}
          />
        ))}
      </div>

      {(analytics.published_date || analytics.engagement_note) && (
        <p className="mt-4 text-sm text-muted-foreground">
          {analytics.published_date && `Published ${analytics.published_date}. `}
          {analytics.engagement_note || ""}
        </p>
      )}
    </Panel>
  );
}