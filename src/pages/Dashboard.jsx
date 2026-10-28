import { useState } from "react";
import { Link } from "react-router-dom";
import { Feather, Lightbulb } from "lucide-react";
import { format, parseISO, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import StatCard from "@/components/kit/StatCard";
import { useBrand, useContent, useMe } from "@/hooks/useCreatorData";
import { useBrainFiles } from "@/hooks/useBrain";
import { useResearchList } from "@/hooks/useResearch";
import { formatNumber, platformOptions } from "@/lib/content";
import ContentDialog from "@/components/library/ContentDialog";
import ContentPipeline from "@/components/dashboard/ContentPipeline";
import SocialFollowing from "@/components/dashboard/SocialFollowing";
import Milestones from "@/components/dashboard/Milestones";
import Roadmap from "@/components/dashboard/Roadmap";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { data: items = [], isLoading } = useContent();
  const { data: brand } = useBrand();
  const { data: me } = useMe();
  const { data: brainFiles = [] } = useBrainFiles();
  const { data: research = [] } = useResearchList();
  const [selected, setSelected] = useState(null);

  if (isLoading) return <PageLoader />;

  const published = items.filter((item) => item.status === "published");
  const monthKey = format(new Date(), "yyyy-MM");
  const publishedThisMonth = published.filter(
    (item) => typeof item.published_date === "string" && item.published_date.startsWith(monthKey)
  ).length;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const postsThisWeek = published.filter((item) => {
    const value = item.published_date;
    const date = typeof value === "string" && value ? parseISO(value) : null;
    return Boolean(date) && !Number.isNaN(date.getTime()) && date >= weekStart;
  });
  const topPost = published.reduce(
    (best, item) => ((item.views || 0) > (best?.views || 0) ? item : best),
    null
  );

  const platforms = platformOptions(me);
  const pillars = brand?.pillars || [];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow={format(new Date(), "EEEE, MMMM d")}
        title={`${greeting()}${brand?.name ? `, ${brand.name}` : ""}.`}
        description="Here is where your creative work stands today."
        action={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button variant="outline" asChild>
              <Link to="/create?status=idea">
                <Lightbulb />
                Add idea
              </Link>
            </Button>
            <Button asChild>
              <Link to="/create">
                <Feather />
                Create Content
              </Link>
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total content" value={items.length} />
        <StatCard label="Ideas saved" value={items.filter((item) => item.status === "idea").length} />
        <StatCard label="Posts this week" value={postsThisWeek.length} />
        <StatCard
          label="Top post"
          value={topPost ? formatNumber(topPost.views || 0) : "—"}
          hint={
            topPost ? (
              <span className="block truncate">{topPost.title}</span>
            ) : (
              "No published posts yet"
            )
          }
        />
      </section>

      <SocialFollowing />

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