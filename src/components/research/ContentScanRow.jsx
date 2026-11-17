import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import RunStatusLabel from "@/components/research/RunStatusLabel";

export default function ContentScanRow({
  scan,
  isSelected,
  isDeleting,
  onSelect,
  onDelete,
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border p-3 ${
        isSelected ? "border-primary/60 bg-primary/5" : "border-border/60"
      }`}
    >
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm">{scan.title || scan.url}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {scan.platform} · <RunStatusLabel status={scan.status} runningLabel="Scanning…" />
        </p>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isDeleting}
        onClick={onDelete}
        aria-label={`Delete scan ${scan.title || scan.url}`}
      >
        <Trash2 />
      </Button>
    </div>
  );
}