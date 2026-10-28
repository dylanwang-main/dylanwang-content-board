import { useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import EmptyState from "@/components/kit/EmptyState";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import OutlierCard from "@/components/outliers/OutlierCard";
import OutlierDetail from "@/components/outliers/OutlierDetail";
import OutlierFilters from "@/components/outliers/OutlierFilters";
import { Button } from "@/components/ui/button";
import { useDetectOutliers, useOutliers } from "@/hooks/useOutliers";

export default function Outliers() {
  const { data: outliers = [], isLoading } = useOutliers();
  const detect = useDetectOutliers();
  const [filter, setFilter] = useState("all");
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);

  const counts = {
    all: outliers.length,
    instagram: outliers.filter((item) => item.platform === "instagram").length,
    tiktok: outliers.filter((item) => item.platform === "tiktok").length,
    youtube: outliers.filter((item) => item.platform === "youtube").length,
  };

  const visible = filter === "all" ? outliers : outliers.filter((item) => item.platform === filter);

  const run = async () => {
    setResult(null);
    const data = await detect.mutateAsync().catch(() => null);
    if (data) setResult(data);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Outliers"
        title="Your best posts, broken down"
        description="Find the posts that beat your average and turn them into new ideas."
        action={
          <Button onClick={run} disabled={detect.isPending} className="rounded-full">
            {detect.isPending ? <Loader2 className="animate-spin" /> : <TrendingUp />}
            {detect.isPending ? "Searching…" : "Find outliers"}
          </Button>
        }
      />

      {detect.isError && <p className="text-sm text-destructive">{detect.error.message}</p>}

      {result && (
        <p className="text-sm text-muted-foreground">
          Found {result.found} outliers.
          {Array.isArray(result.skipped) && result.skipped.length > 0
            ? ` Sync at least 5 posts on ${result.skipped.join(", ")} to include them.`
            : ""}
        </p>
      )}

      <OutlierFilters value={filter} onChange={setFilter} counts={counts} />

      {isLoading ? (
        <PageLoader />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No outliers yet"
          text="Sync your channels, then press Find outliers."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((outlier) => (
            <OutlierCard key={outlier.id} outlier={outlier} onOpen={() => setSelected(outlier)} />
          ))}
        </div>
      )}

      {selected && <OutlierDetail outlier={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}