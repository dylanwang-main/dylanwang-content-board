import { useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import ContentMeta from "@/components/library/ContentMeta";
import MetricsFields from "@/components/library/MetricsFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { METRICS } from "@/lib/content";

const TEXT_FIELDS = [
  "title",
  "body",
  "platform",
  "format",
  "pillar",
  "scheduled_date",
  "published_date",
  "url",
  "notes",
];

function initialState(item) {
  const source = item || {};
  const state = { status: source.status || "draft" };

  TEXT_FIELDS.forEach((key) => {
    state[key] = typeof source[key] === "string" ? source[key] : "";
  });
  METRICS.forEach((key) => {
    state[key] = source[key] ? String(source[key]) : "";
  });

  return state;
}

function toNumber(value) {
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ContentForm({
  initial,
  platforms,
  pillars,
  onSubmit,
  submitting,
  submitLabel,
  footer,
}) {
  const [values, setValues] = useState(() => initialState(initial));

  const set = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const trimmedBody = values.body.trim();
  const words = trimmedBody ? trimmedBody.split(/\s+/).length : 0;

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = values.title.trim();
    if (!title) return;

    const metrics = {};
    METRICS.forEach((key) => {
      metrics[key] = toNumber(values[key]);
    });

    onSubmit({
      ...values,
      title,
      ...metrics,
      published_date:
        values.status === "published" && !values.published_date
          ? format(new Date(), "yyyy-MM-dd")
          : values.published_date,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-4 sm:p-6">
          <Input
            value={values.title}
            onChange={(event) => set("title", event.target.value)}
            placeholder="Untitled piece"
            required
            className="h-auto border-0 bg-transparent px-0 font-heading text-3xl font-light shadow-none focus-visible:ring-0"
          />

          <Textarea
            value={values.body}
            onChange={(event) => set("body", event.target.value)}
            placeholder="Write your script, caption or outline…"
            className="min-h-[280px] resize-y border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0"
          />

          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <span>{words} words</span>
            <span>{values.body.length} characters</span>
          </div>

          <Textarea
            value={values.notes}
            onChange={(event) => set("notes", event.target.value)}
            placeholder="Private notes, hooks, references…"
            className="min-h-[80px] resize-y bg-secondary/40 text-sm"
          />
        </div>

        <ContentMeta values={values} onChange={set} platforms={platforms} pillars={pillars} />
      </div>

      {values.status === "published" && (
        <MetricsFields values={values} onChange={set} itemId={initial?.id} />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>{footer}</div>
        <Button type="submit" disabled={submitting || !values.title.trim()} className="rounded-full">
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}