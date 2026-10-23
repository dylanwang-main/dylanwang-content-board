import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoadmapStep from "@/components/dashboard/RoadmapStep";
import { useMe } from "@/hooks/useCreatorData";
import { useBuildRoadmap } from "@/hooks/useRoadmap";

export default function Roadmap() {
  const { data: me } = useMe();
  const roadmap = me?.roadmap;
  const build = useBuildRoadmap();

  return (
    <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold">First $1,000 roadmap</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Step by step to your first grand, in your niche
          </p>
          {build.isError && (
            <p className="mt-2 text-sm text-destructive">
              {build.error?.message || "Could not build your roadmap. Please try again."}
            </p>
          )}
        </div>

        <Button onClick={() => build.mutate()} disabled={build.isPending}>
          {build.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {build.isPending ? "Building…" : roadmap ? "Rebuild roadmap" : "Build my roadmap"}
        </Button>
      </div>

      {roadmap && (
        <div className="mt-6 border-t border-border/60 pt-6">
          {roadmap.summary && <p className="text-sm text-muted-foreground">{roadmap.summary}</p>}

          {roadmap.steps?.length > 0 && (
            <ol className="mt-5 space-y-3">
              {roadmap.steps.map((step, index) => (
                <RoadmapStep key={`${step.title}-${index}`} step={step} index={index} />
              ))}
            </ol>
          )}

          {roadmap.revenue_math && (
            <div className="mt-5 rounded-2xl bg-primary/5 p-4 text-sm">{roadmap.revenue_math}</div>
          )}
        </div>
      )}
    </section>
  );
}