import { Loader2 } from "lucide-react";

export default function RunStatusLabel({ status, runningLabel }) {
  if (status === "scanning" || status === "researching") {
    return (
      <span className="inline-flex items-center gap-1.5 text-primary">
        <Loader2 className="h-3 w-3 animate-spin" />
        {runningLabel}
      </span>
    );
  }

  if (status === "complete") return <span className="text-chart-2">Complete</span>;

  return <span className="text-destructive">Failed</span>;
}