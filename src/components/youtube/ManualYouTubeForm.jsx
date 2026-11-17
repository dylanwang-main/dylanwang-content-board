import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Field from "@/components/kit/Field";
import FieldSelect from "@/components/kit/FieldSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveContent } from "@/hooks/useCreatorData";

const EMPTY = {
  title: "",
  format: "Video",
  competitor: "",
  hook: "",
  points: "",
  cta: "",
  thumbnail: "",
  titles: "",
  notes: "",
};

export default function ManualYouTubeForm({ onOpenPipeline }) {
  const save = useSaveContent();
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    const points = form.points
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const titles = form.titles
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const body = [
      form.hook.trim() ? `HOOK\n${form.hook.trim()}` : "",
      points.length ? `MAIN POINTS\n${points.map((point) => `- ${point}`).join("\n")}` : "",
      form.cta.trim() ? `CTA\n${form.cta.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    await save.mutateAsync({
      data: {
        title,
        platform: "YouTube",
        format: form.format,
        status: "draft",
        body,
        notes: form.notes.trim(),
        youtube_plan: {
          topic: title,
          opening: { problem: form.hook.trim() },
          plan: points.length ? [{ step: "Main points", points }] : [],
          payoff: form.cta.trim(),
          title_options: [title, ...titles.filter((option) => option !== title)],
          thumbnails: [
            {
              concept: form.thumbnail.trim(),
              text_overlay: "",
              visual_direction: "",
            },
          ],
          competitors: form.competitor.trim() ? [{ title: form.competitor.trim() }] : [],
          source: "manual",
        },
      },
    });

    setForm(EMPTY);
    setSaved(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-border/70 bg-card p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title">
          <Input
            className="rounded-xl"
            value={form.title}
            onChange={(event) => set("title", event.target.value)}
            required
          />
        </Field>

        <FieldSelect
          label="Format"
          value={form.format}
          onChange={(value) => set("format", value)}
          options={[
            { value: "Video", label: "Video" },
            { value: "Short", label: "Short" },
          ]}
        />
      </div>

      <Field label="Competitor channel (optional)">
        <Input
          className="rounded-xl"
          placeholder="e.g. @creatorname"
          value={form.competitor}
          onChange={(event) => set("competitor", event.target.value)}
        />
      </Field>

      <Field label="Hook">
        <Textarea
          className="rounded-xl"
          rows={2}
          value={form.hook}
          onChange={(event) => set("hook", event.target.value)}
        />
      </Field>

      <Field label="Main points" hint="One point per line.">
        <Textarea
          className="rounded-xl"
          rows={5}
          value={form.points}
          onChange={(event) => set("points", event.target.value)}
        />
      </Field>

      <Field label="CTA">
        <Textarea
          className="rounded-xl"
          rows={2}
          value={form.cta}
          onChange={(event) => set("cta", event.target.value)}
        />
      </Field>

      <Field label="Thumbnail concept">
        <Input
          className="rounded-xl"
          value={form.thumbnail}
          onChange={(event) => set("thumbnail", event.target.value)}
        />
      </Field>

      <Field label="Title options" hint="One per line, 3 to 5.">
        <Textarea
          className="rounded-xl"
          rows={4}
          value={form.titles}
          onChange={(event) => set("titles", event.target.value)}
        />
      </Field>

      <Field label="Notes">
        <Textarea
          className="rounded-xl"
          rows={3}
          value={form.notes}
          onChange={(event) => set("notes", event.target.value)}
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
        {saved ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onOpenPipeline}
            className="rounded-full text-primary hover:text-primary"
          >
            Saved. Open in Pipeline
            <ArrowRight />
          </Button>
        ) : (
          <span />
        )}

        <Button type="submit" disabled={save.isPending} className="rounded-full">
          {save.isPending && <Loader2 className="animate-spin" />}
          Save video
        </Button>
      </div>
    </form>
  );
}