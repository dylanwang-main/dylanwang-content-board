import { useState } from "react";
import { ChevronDown, ExternalLink, FileText, Loader2, RotateCw, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useDeleteBrainFile, useRelearnBrainFile } from "@/hooks/useBrain";

const STATUS_DISPLAY = {
  learning: { label: "Learning…", className: "text-primary", spinning: true },
  learned: { label: "Learned", className: "text-chart-2" },
  failed: { label: "Couldn't read", className: "text-destructive" },
};

export default function BrainFileRow({ file }) {
  const [open, setOpen] = useState(false);
  const relearn = useRelearnBrainFile();
  const remove = useDeleteBrainFile();

  const status = STATUS_DISPLAY[file.status] || STATUS_DISPLAY.learning;
  const canExpand = Boolean(file.summary);
  const points = file.key_points || [];

  const openFile = async () => {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
      file_uri: file.file_uri,
    });
    window.open(signed_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-xl border border-border/60 p-3.5">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => canExpand && setOpen((value) => !value)}
            className="block w-full truncate text-left text-sm font-medium"
          >
            {file.file_name}
          </button>
          <p className={`mt-0.5 flex items-center gap-1.5 text-xs ${status.className}`}>
            {status.spinning && <Loader2 className="h-3 w-3 animate-spin" />}
            {status.label}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {file.status === "failed" && (
            <Button
              variant="ghost"
              size="icon"
              title="Try again"
              onClick={() => relearn.mutate(file.id)}
            >
              <RotateCw />
            </Button>
          )}

          <Button variant="ghost" size="icon" title="Open file" onClick={openFile}>
            <ExternalLink />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Remove"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => remove.mutate(file.id)}
          >
            <Trash2 />
          </Button>

          {canExpand && (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Hide details" : "Show details"}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-accent"
            >
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {open && canExpand && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <p className="text-sm text-muted-foreground">{file.summary}</p>

          {points.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {points.map((point) => (
                <li key={point} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}