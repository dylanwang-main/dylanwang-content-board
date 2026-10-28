import { useState } from "react";
import { Loader2, PenLine, Sparkles } from "lucide-react";
import Field from "@/components/kit/Field";
import ManualYouTubeForm from "@/components/youtube/ManualYouTubeForm";
import PlanView from "@/components/youtube/PlanView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenerateYouTube, useResearchYouTubeTitle } from "@/hooks/useYouTubePlan";

export default function YouTubeCreate({ onOpenPipeline }) {
  const [mode, setMode] = useState("ai");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState(null);
  const generate = useGenerateYouTube();
  const research = useResearchYouTubeTitle();

  const trimmed = topic.trim();

  const handleGenerate = async () => {
    if (!trimmed) return;
    const data = await generate.mutateAsync({ topic: trimmed });
    setResult(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "ai" ? "default" : "outline"}
          onClick={() => setMode("ai")}
          className="rounded-full"
        >
          <Sparkles />
          Generate with AI
        </Button>
        <Button
          type="button"
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => setMode("manual")}
          className="rounded-full"
        >
          <PenLine />
          Create manually
        </Button>
      </div>

      {mode === "ai" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
            <Field label="Video topic">
              <Input
                className="rounded-xl"
                placeholder="e.g. how to get your first coaching client"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              />
            </Field>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={!trimmed || generate.isPending}
                className="rounded-full"
              >
                {generate.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {generate.isPending ? "Building your plan…" : "Generate plan"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => research.mutate({ topic: trimmed })}
                disabled={!trimmed || research.isPending}
                className="rounded-full"
              >
                {research.isPending ? <Loader2 className="animate-spin" /> : null}
                Test title ideas
              </Button>
            </div>

            {generate.isPending && (
              <p className="mt-4 text-xs text-muted-foreground">
                Researching competitors and writing your plan. This can take up to a minute.
              </p>
            )}

            {generate.isError && (
              <p className="mt-4 text-sm text-destructive">{generate.error.message}</p>
            )}
            {research.isError && (
              <p className="mt-4 text-sm text-destructive">{research.error.message}</p>
            )}

            {Array.isArray(research.data) && research.data.length > 0 && (
              <div className="mt-5 space-y-2 border-t border-border/70 pt-4">
                {research.data.map((title, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {Math.round(title.predicted_ctr || 0)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-relaxed">{title.title}</p>
                      {title.reason && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{title.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {result && result.plan && (
            <PlanView plan={result.plan} onOpenPipeline={() => onOpenPipeline(result.item?.id)} />
          )}
        </div>
      ) : (
        <ManualYouTubeForm onOpenPipeline={() => onOpenPipeline()} />
      )}
    </div>
  );
}