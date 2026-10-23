import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function RunStatus({ status }) {
  if (status === "researching") {
    return (
      <span className="inline-flex items-center gap-1.5 text-primary">
        <Loader2 className="h-3 w-3 animate-spin" />
        Researching…
      </span>
    );
  }

  if (status === "complete") return <span className="text-chart-2">Complete</span>;

  return <span className="text-destructive">Failed</span>;
}

export default function RunHistoryRow({
  run,
  isSelected,
  isInUse,
  isDeleting,
  onSelect,
  onDelete,
}) {
  const sourceType = run.source_type === "competitor" ? "Competitor" : "My page";

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border p-3 ${
        isSelected ? "border-primary/60 bg-primary/5" : "border-border/60"
      }`}
    >
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm">{run.source}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {run.platform} · {sourceType} · <RunStatus status={run.status} />
        </p>
        {isInUse && <p className="mt-1 text-xs text-primary">In use by your brain</p>}
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isDeleting}
        onClick={onDelete}
        aria-label={`Delete run ${run.source}`}
      >
        <Trash2 />
      </Button>
    </div>
  );
}