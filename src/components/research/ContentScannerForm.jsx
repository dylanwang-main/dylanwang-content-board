import { useState } from "react";
import { Loader2, ScanSearch } from "lucide-react";
import Field from "@/components/kit/Field";
import FieldSelect from "@/components/kit/FieldSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRunContentScan } from "@/hooks/useContentScans";

const PLATFORMS = ["YouTube", "TikTok", "Instagram", "LinkedIn", "X", "Facebook"];

export default function ContentScannerForm({ onStarted }) {
  const run = useRunContentScan();
  const [platform, setPlatform] = useState("YouTube");
  const [url, setUrl] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    const record = await run.mutateAsync({ platform, url: url.trim() });
    setUrl("");
    onStarted(record.id);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-light tracking-tight">Content scanner</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comments, public analytics and the transcript of any post or video
          </p>
        </div>

        <Button type="submit" disabled={run.isPending || !url.trim()}>
          {run.isPending ? <Loader2 className="animate-spin" /> : <ScanSearch />}
          Scan content
        </Button>
      </div>

      <div className="mt-6 grid max-w-2xl gap-4 sm:grid-cols-[180px_1fr]">
        <FieldSelect label="Platform" value={platform} onChange={setPlatform} options={PLATFORMS} />

        <Field label="Post or video link">
          <Input
            className="rounded-xl"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="e.g. youtube.com/watch?v=..."
          />
        </Field>
      </div>
    </form>
  );
}