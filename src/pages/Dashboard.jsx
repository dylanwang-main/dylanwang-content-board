import { useState } from "react";
import { Link } from "react-router-dom";
import { PenLine, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import { useBrand, useContent, useMe } from "@/hooks/useCreatorData";
import { useBrainFiles } from "@/hooks/useBrain";
import { useResearchList } from "@/hooks/useResearch";
import { platformOptions } from "@/lib/content";
import { useYouTubeVideos } from "@/hooks/useYouTube";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { toPosts } from "@/lib/insights";
import HomeHero from "@/components/dashboard/HomeHero";
import TopCuts from "@/components/dashboard/TopCuts";
import ContentDialog from "@/components/library/ContentDialog";
import ContentPipeline from "@/components/dashboard/ContentPipeline";
import Milestones from "@/components/dashboard/Milestones";
import Roadmap from "@/components/dashboard/Roadmap";

export default function Dashboard() {
  const { data: items = [], isLoading } = useContent();
  const { data: brand } = useBrand();
  const { data: me } = useMe();
  const { data: brainFiles = [] } = useBrainFiles();
  const { data: research = [] } = useResearchList();
  const { data: videos = [] } = useYouTubeVideos();
  const { data: accounts = [] } = useSocialAccounts();
  const [selected, setSelected] = useState(null);

  if (isLoading) return <PageLoader />;

  const published = items.filter((item) => item.status === "published");
  const monthKey = format(new Date(), "yyyy-MM");
  const publishedThisMonth = published.filter(
    (item) => typeof item.published_date === "string" && item.published_date.startsWith(monthKey)
  ).length;

  const posts = toPosts({ videos, items });
  const followers = accounts.reduce((sum, a) => sum + (Number(a.follower_count) || 0), 0);

  const platforms = platformOptions(me);
  const pillars = brand?.pillars || [];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Home"
        description={format(new Date(), "EEEE, MMMM d")}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/create?status=idea">
                <Plus />
                New idea
              </Link>
            </Button>
            <Button asChild>
              <Link to="/create">
                <PenLine />
                Create
              </Link>
            </Button>
          </div>
        }
      />

      <HomeHero posts={posts} followers={followers} />

      <TopCuts posts={posts} />

      <ContentPipeline items={items} onOpenItem={(item) => setSelected(item)} />

      <Milestones
        items={items}
        brainFiles={brainFiles}
        research={research}
        publishedThisMonth={publishedThisMonth}
        goal={me?.monthly_goal}
      />

      <Roadmap />

      {selected && (
        <ContentDialog
          item={selected}
          onClose={() => setSelected(null)}
          platforms={platforms}
          pillars={pillars}
        />
      )}
    </div>
  );
}