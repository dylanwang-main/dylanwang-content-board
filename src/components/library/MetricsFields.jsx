import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import Field from "@/components/kit/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFetchMetrics } from "@/hooks/useFetchMetrics";
import { METRICS } from "@/lib/content";

const LINK_PATTERN = /^https?:\/\/\S+\.\S+$/;

export default function MetricsFields({ values, onChange, itemId }) {
  const fetchMetrics = useFetchMetrics();
  const [error, setError] = useState("");

  const target = (values.url || "").trim();
  const canFetch = LINK_PATTERN.test(target);

  const runFetch = async (link) => {
    const url = (link || values.url || "").trim();
    if (!LINK_PATTERN.test(url)) return;

    setError("");

    try {
      const metrics = await fetchMetrics.mutateAsync({ url, contentId: itemId || null });

      Object.entries(metrics || {}).forEach(([key, value]) => {
        if (key === "published_date") onChange("published_date", String(value || ""));
        else if (METRICS.includes(key)) onChange(key, String(value ?? ""));
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePaste = (event) => {
    const pasted = (event.clipboardData?.getData("text") || "").trim();
    if (LINK_PATTERN.test(pasted)) runFetch(pasted);
  };

  return (
    <div className="rounded-xl border border-primary/15 bg-primary/3 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <h3 className="font-heading text-lg font-light">Results</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Paste the post link and the numbers fill in automatically. Refresh anytime for the
            latest.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => runFetch()}
          disabled={fetchMetrics.isPending || !canFetch}
        >
          {fetchMetrics.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          {fetchMetrics.isPending ? "Fetching…" : "Refresh"}
        </Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Published on">
          <Input
            type="date"
            value={values.published_date}
            onChange={(event) => onChange("published_date", event.target.value)}
          />
        </Field>

        <Field label="Link">
          <Input
            value={values.url}
            onChange={(event) => onChange("url", event.target.value)}
            onPaste={handlePaste}
            placeholder="Paste your Instagram post link"
          />
        </Field>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {METRICS.map((key) => (
          <Field key={key} label={key}>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={values[key]}
              disabled={fetchMetrics.isPending}
              onChange={(event) => onChange(key, event.target.value)}
            />
          </Field>
        ))}
      </div>
    </div>
  );
}