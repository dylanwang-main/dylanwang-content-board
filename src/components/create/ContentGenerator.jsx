import { useState } from "react";
import FieldSelect from "@/components/kit/FieldSelect";
import GeneratorFooter from "@/components/create/GeneratorFooter";
import { FORMATS, platformOptions } from "@/lib/content";
import { useGenerateContent } from "@/hooks/useGenerateContent";

export default function ContentGenerator({ me, brand, learnedCount }) {
  const generate = useGenerateContent();
  const [platform, setPlatform] = useState("");
  const [format, setFormat] = useState("");
  const [pillar, setPillar] = useState("");
  const [result, setResult] = useState(null);

  const pillars = brand?.pillars || [];
  const isReady = Boolean(platform && format) && learnedCount > 0;

  const onSubmit = (event) => {
    event.preventDefault();
    generate.mutate(
      { platform, format, pillar },
      { onSuccess: (data) => setResult(data?.result || null) }
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border/60 bg-card/70 p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <FieldSelect
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={platformOptions(me)}
        />

        <FieldSelect label="Format" value={format} onChange={setFormat} options={FORMATS} />

        {pillars.length > 0 && (
          <FieldSelect
            label="Pillar (optional)"
            value={pillar}
            onChange={setPillar}
            options={pillars}
            placeholder="Let the brain choose"
          />
        )}
      </div>

      {generate.isPending && (
        <p className="mt-4 text-xs text-muted-foreground">
          {`Analysing ${platform} ${format}s, choosing a topic and writing your full video. This can take up to a minute.`}
        </p>
      )}

      {generate.isError && (
        <p className="mt-4 text-sm text-destructive">{generate.error.message}</p>
      )}

      <GeneratorFooter
        learnedCount={learnedCount}
        isPending={generate.isPending}
        disabled={!isReady}
      />
    </form>
  );
}