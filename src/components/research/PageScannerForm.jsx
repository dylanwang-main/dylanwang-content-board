import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import Field from "@/components/kit/Field";
import FieldSelect from "@/components/kit/FieldSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRunResearch } from "@/hooks/useResearch";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "LinkedIn", "X", "Facebook"];

const SOURCE_TYPES = [
  { value: "own", label: "My page" },
  { value: "competitor", label: "Competitor" },
];

export default function PageScannerForm({ onStarted }) {
  const run = useRunResearch();
  const [sourceType, setSourceType] = useState("own");
  const [platform, setPlatform] = useState("Instagram");
  const [source, setSource] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    const record = await run.mutateAsync({
      source_type: sourceType,
      platform,
      source: source.trim(),
    });
    setSource("");
    onStarted(record.id);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-xl shadow-black/5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-light tracking-tight">Social page scanner</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer research, avatars and ranked angles from any page
          </p>
        </div>

        <Button type="submit" disabled={run.isPending || !source.trim()}>
          {run.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Run research
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {SOURCE_TYPES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSourceType(option.value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              sourceType === option.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid max-w-2xl gap-4 sm:grid-cols-[180px_1fr]">
        <FieldSelect label="Platform" value={platform} onChange={setPlatform} options={PLATFORMS} />

        <Field label="Page link or handle">
          <Input
            className="rounded-xl"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="e.g. instagram.com/yourhandle"
          />
        </Field>
      </div>
    </form>
  );
}