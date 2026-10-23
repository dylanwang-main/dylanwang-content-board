import { Library } from "lucide-react";
import { Link } from "react-router-dom";
import Panel from "@/components/kit/Panel";
import { Button } from "@/components/ui/button";
import ScriptScene from "@/components/create/ScriptScene";

export default function GeneratedResult({ result, className = "" }) {
  const script = result.script || [];
  const hashtags = (result.hashtags || []).map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

  return (
    <div className={`space-y-5 ${className}`}>
      <Panel>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Topic</p>
        {result.title && (
          <h3 className="mt-3 font-heading text-3xl font-light tracking-tight">{result.title}</h3>
        )}
        {result.topic && <p className="mt-3 text-sm text-muted-foreground">{result.topic}</p>}
        {result.idea && <p className="mt-4 text-sm leading-relaxed">{result.idea}</p>}
      </Panel>

      {result.hook && (
        <Panel title="Hook">
          <p className="font-heading text-xl italic text-primary">{`“${result.hook}”`}</p>
        </Panel>
      )}

      <Panel title="Full script">
        {script.length > 0 && (
          <div className="space-y-3">
            {script.map((scene, index) => (
              <ScriptScene key={`${scene?.section}-${index}`} scene={scene} number={index + 1} />
            ))}
          </div>
        )}

        {result.cta && (
          <div className="mt-3 rounded-xl border border-primary/25 bg-accent/40 p-4 text-sm">
            <span className="font-semibold text-primary">CTA · </span>
            {result.cta}
          </div>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Caption">
          {result.caption && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.caption}</p>
          )}
          {hashtags.length > 0 && <p className="mt-4 text-sm text-primary">{hashtags.join(" ")}</p>}
        </Panel>

        <Panel title="Production notes">
          {result.production_notes && (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {result.production_notes}
            </p>
          )}
        </Panel>
      </div>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link to="/library">
            <Library />
            Saved to library — open
          </Link>
        </Button>
      </div>
    </div>
  );
}