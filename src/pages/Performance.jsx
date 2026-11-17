import { TrendingUp } from "lucide-react";
import EmptyState from "@/components/kit/EmptyState";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import GroupPanel from "@/components/performance/GroupPanel";
import PostingHabits from "@/components/performance/PostingHabits";
import ChannelsSection from "@/components/performance/channels/ChannelsSection";
import PerformanceStats from "@/components/performance/PerformanceStats";
import TopPiecesPanel from "@/components/performance/TopPiecesPanel";
import ViewsTrendPanel from "@/components/performance/ViewsTrendPanel";
import { useContent } from "@/hooks/useCreatorData";
import { summarize } from "@/lib/content";
import { groupStats, monthlyTrend } from "@/lib/performance";

export default function Performance() {
  const { data: items = [], isLoading } = useContent();

  const published = items.filter((item) => item.status === "published");
  const summary = summarize(items);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Performance"
        title="What's resonating"
        description="Calculated from the results you log on published pieces."
      />

      <PostingHabits />

      {isLoading ? (
        <PageLoader />
      ) : published.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No published pieces yet"
          text="Mark a piece as published in your library and log its views and interactions. Your analytics will appear here."
          actionLabel="Open library"
          actionTo="/library"
        />
      ) : (
        <div className="space-y-6">
          <PerformanceStats summary={summary} />
          <ViewsTrendPanel data={monthlyTrend(published)} />

          <div className="grid gap-6 lg:grid-cols-2">
            <GroupPanel title="By platform" groups={groupStats(published, "platform")} />
            <GroupPanel title="By pillar" groups={groupStats(published, "pillar")} />
          </div>

          <TopPiecesPanel items={published} />
        </div>
      )}

      <ChannelsSection />
    </div>
  );
}