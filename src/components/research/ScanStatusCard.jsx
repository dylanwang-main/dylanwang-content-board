import { Loader2 } from "lucide-react";

export default function ScanStatusCard({ scan }) {
  if (scan.status === "scanning") {
    return (
      <div className="rounded-xl border border-border/60 bg-card/80 p-10 text-center shadow-sm">
        <Loader2 className="mx-auto animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">
          {`Scanning this ${scan.platform} content. This can take a minute or two.`}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-destructive/40 bg-card/80 p-6 shadow-sm">
      <p className="text-sm text-destructive">
        {`${scan.error || "Scan failed."} Try again.`}
      </p>
    </div>
  );
}