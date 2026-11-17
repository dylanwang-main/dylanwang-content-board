import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PenLine, Plus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import { useBrand, useContent, useMe } from "@/hooks/useCreatorData";
import { useAllPosts } from "@/hooks/useAllPosts";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { platformOptions } from "@/lib/content";
import { latestHeadline, scorePosts } from "@/lib/analysis";
import { habits as computeHabits } from "@/lib/habits";
import { loadPostingGoal } from "@/components/performance/PostingHabits";
import HomeHero from "@/components/dashboard/HomeHero";
import BestRecent from "@/components/dashboard/BestRecent";
import ContentDialog from "@/components/library/ContentDialog";
import ContentPipeline from "@/components/dashboard/ContentPipeline";

export default function Dashboard() {
  const { data: items = [], isLoading } = useContent();
  const { data: brand } = useBrand();
  const { data: me } = useMe();
  const { posts, isLoading: postsLoading } = useAllPosts();
  const { data: accounts = [] } = useSocialAccounts();
  const [selected, setSelected] = useState(null);

  const scored = useMemo(() => scorePosts(posts), [posts]);
  const goal = loadPostingGoal();
  const live = posts.filter((p) => !p.trial && p.at);

  if (isLoading || postsLoading) return <PageLoader />;

  const followers = accounts.reduce((sum, a) => sum + (Number(a.follower_count) || 0), 0);

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

      <HomeHero
        headline={latestHeadline(scored)}
        posts={live}
        habits={computeHabits(live, { goal })}
        goal={goal}
        followers={followers}
      />

      <BestRecent scored={scored} />

      <ContentPipeline items={items} onOpenItem={(item) => setSelected(item)} />

      {selected && (
        <ContentDialog
          item={selected}
          onClose={() => setSelected(null)}
          platforms={platformOptions(me)}
          pillars={brand?.pillars || []}
        />
      )}
    </div>
  );
}
