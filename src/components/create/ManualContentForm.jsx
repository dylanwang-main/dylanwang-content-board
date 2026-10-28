import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Field from "@/components/kit/Field";
import FieldSelect from "@/components/kit/FieldSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FORMATS, platformOptions } from "@/lib/content";
import { useSaveContent } from "@/hooks/useCreatorData";

export default function ManualContentForm({ me, brand, initialStatus = "draft" }) {
  const save = useSaveContent();
  const [savedId, setSavedId] = useState(null);
  const [form, setForm] = useState({
    platform: "",
    format: "",
    pillar: "",
    status: initialStatus,
    title: "",
    hook: "",
    script: "",
    caption: "",
    notes: "",
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const pillars = brand?.pillars || [];

  const buildBody = () => {
    const parts = [];
    if (form.hook.trim()) parts.push(`HOOK\n${form.hook.trim()}`);
    parts.push(form.script.trim());
    if (form.caption.trim()) parts.push(`CAPTION\n${form.caption.trim()}`);
    return parts.join("\n\n");
  };

  const canSave = Boolean(form.title.trim() && form.platform && form.format) && !save.isPending;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSave) return;

    const created = await save.mutateAsync({
      data: {
        title: form.title.trim(),
        platform: form.platform,
        format: form.format,
        pillar: form.pillar,
        status: form.status,
        notes: form.notes.trim(),
        body: buildBody(),
      },
    });

    setSavedId(created?.id || null);
    setForm({
      platform: "",
      format: "",
      pillar: "",
      status: initialStatus,
      title: "",
      hook: "",
      script: "",
      caption: "",
      notes: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/60 bg-card/70 p-6 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <FieldSelect
          label="Platform"
          value={form.platform}
          onChange={(value) => set("platform", value)}
          options={platformOptions(me)}
        />
        <FieldSelect
          label="Format"
          value={form.format}
          onChange={(value) => set("format", value)}
          options={FORMATS}
        />
        {pillars.length > 0 && (
          <FieldSelect
            label="Pillar (optional)"
            value={form.pillar}
            onChange={(value) => set("pillar", value)}
            options={pillars}
            placeholder="No pillar"
          />
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FieldSelect
          label="Status"
          value={form.status}
          onChange={(value) => set("status", value)}
          options={[
            { value: "idea", label: "Idea" },
            { value: "draft", label: "Draft" },
          ]}
        />

        <Field label="Title">
          <Input
            className="rounded-xl"
            value={form.title}
            onChange={(event) => set("title", event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Hook" hint="The opening line that grabs attention">
          <Input
            className="rounded-xl"
            value={form.hook}
            onChange={(event) => set("hook", event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Script">
          <Textarea
            className="rounded-xl"
            style={{ minHeight: 220 }}
            placeholder="Write your script, caption or outline…"
            value={form.script}
            onChange={(event) => set("script", event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Caption (optional)">
          <Textarea
            className="rounded-xl"
            value={form.caption}
            onChange={(event) => set("caption", event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Notes (optional)">
          <Textarea
            className="rounded-xl"
            value={form.notes}
            onChange={(event) => set("notes", event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        {savedId ? (
          <p className="text-sm text-muted-foreground">
            Saved.{" "}
            <Link to={`/library?open=${savedId}`} className="text-primary hover:underline">
              Open in Content System
            </Link>
          </p>
        ) : (
          <span />
        )}

        <Button type="submit" disabled={!canSave} className="rounded-full">
          {save.isPending && <Loader2 className="animate-spin" />}
          Save to Content System
        </Button>
      </div>
    </form>
  );
}