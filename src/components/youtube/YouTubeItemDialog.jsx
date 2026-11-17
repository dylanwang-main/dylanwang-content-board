import { useState } from "react";
import { format } from "date-fns";
import { ExternalLink, Loader2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Field from "@/components/kit/Field";
import FieldSelect from "@/components/kit/FieldSelect";
import PlanSections from "@/components/youtube/PlanSections";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDeleteContent, useSaveContent } from "@/hooks/useCreatorData";
import { STATUSES } from "@/lib/content";

export default function YouTubeItemDialog({ item, onClose }) {
  const save = useSaveContent();
  const remove = useDeleteContent();
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState({
    title: item.title || "",
    status: item.status || "idea",
    scheduled_date: item.scheduled_date || "",
    published_date: item.published_date || "",
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    const data = { title: form.title.trim(), status: form.status };

    if (form.status === "scheduled") data.scheduled_date = form.scheduled_date || "";
    if (form.status === "published") {
      data.published_date = form.published_date || format(new Date(), "yyyy-MM-dd");
    }

    await save.mutateAsync({ id: item.id, data });
  };

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    await remove.mutateAsync(item.id);
    onClose();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-4xl overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-[11px] font-medium text-primary">
            YouTube plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 rounded-lg border border-border/70 p-4">
          <Field label="Title">
            <Input
              className="rounded-lg"
              value={form.title}
              onChange={(event) => set("title", event.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <FieldSelect
              label="Status"
              value={form.status}
              onChange={(value) => set("status", value)}
              options={STATUSES}
            />

            {form.status === "scheduled" && (
              <Field label="Scheduled for">
                <Input
                  type="date"
                  className="rounded-lg"
                  value={form.scheduled_date}
                  onChange={(event) => set("scheduled_date", event.target.value)}
                />
              </Field>
            )}

            {form.status === "published" && (
              <Field label="Published on">
                <Input
                  type="date"
                  className="rounded-lg"
                  value={form.published_date}
                  onChange={(event) => set("published_date", event.target.value)}
                />
              </Field>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSave}
              disabled={save.isPending || !form.title.trim()}
              className="rounded-full"
            >
              {save.isPending && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>

        <PlanSections plan={item.youtube_plan} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={remove.isPending}
            className="rounded-full text-destructive hover:text-destructive"
          >
            <Trash2 />
            {confirming ? "Click again to delete" : "Delete"}
          </Button>

          <Button asChild variant="outline" className="rounded-full">
            <Link to={`/library?open=${item.id}`}>
              Open in Content System
              <ExternalLink />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}