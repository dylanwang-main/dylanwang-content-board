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
    <section aria-label="First $1,000 roadmap" className="rounded-lg border border-border bg-card px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-foreground">First $1,000 roadmap</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">A step-by-step plan from your Brain and numbers.</p>
          {build.isError && (
            <p className="mt-2 text-sm text-destructive">
              {build.error?.message || "Could not build your roadmap. Please try again."}
            </p>
          )}
        </div>

        <Button size="sm" variant={roadmap ? "outline" : "default"} onClick={() => build.mutate()} disabled={build.isPending}>
          {build.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {build.isPending ? "Building…" : roadmap ? "Rebuild roadmap" : "Build my roadmap"}
        </Button>
      </div>

      {roadmap && (
        <div className="mt-4 border-t border-border pt-4">
          {roadmap.summary && <p className="text-sm text-muted-foreground">{roadmap.summary}</p>}

          {roadmap.steps?.length > 0 && (
            <ol className="mt-5 space-y-3">
              {roadmap.steps.map((step, index) => (
                <RoadmapStep key={`${step.title}-${index}`} step={step} index={index} />
              ))}
            </ol>
          )}

          {roadmap.revenue_math && (
            <div className="mt-5 rounded-lg bg-primary/5 p-4 text-sm">{roadmap.revenue_math}</div>
          )}
        </div>
      )}
    </section>
  );
}