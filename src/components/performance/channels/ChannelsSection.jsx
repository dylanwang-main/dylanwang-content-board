import { useState } from "react";
import PageLoader from "@/components/kit/PageLoader";
import ChannelBreakdown from "@/components/performance/channels/ChannelBreakdown";
import ChannelConnections from "@/components/performance/channels/ChannelConnections";
import ChannelStats from "@/components/performance/channels/ChannelStats";
import ChannelTopPosts from "@/components/performance/channels/ChannelTopPosts";
import ChannelViewsChart from "@/components/performance/channels/ChannelViewsChart";
import InstagramStats from "@/components/performance/channels/InstagramStats";
import OutliersSection from "@/components/performance/channels/OutliersSection";
import DateRangeFilter from "@/components/shared/DateRangeFilter";
import { useChannelMetrics } from "@/hooks/useChannelMetrics";

export default function ChannelsSection() {
  const [days, setDays] = useState(30);
  const metrics = useChannelMetrics(days);

  return (
    <section className="space-y-6 border-t border-border/70 pt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-light">Your channels</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Numbers synced from Instagram, TikTok and YouTube.
          </p>
        </div>

        <DateRangeFilter value={days} onChange={setDays} />
      </div>

      {metrics.loading ? (
        <PageLoader />
      ) : (
        <div className="space-y-6">
          <ChannelConnections accounts={metrics.accounts} />
          <ChannelStats metrics={metrics} />
          <ChannelViewsChart series={metrics.series} days={days} />
          <ChannelBreakdown channels={metrics.byChannel} />
          <ChannelTopPosts posts={metrics.topPosts} />
          <OutliersSection outliers={metrics.outliers} />
          <InstagramStats instagram={metrics.instagram} />
        </div>
      )}
    </section>
  );
}