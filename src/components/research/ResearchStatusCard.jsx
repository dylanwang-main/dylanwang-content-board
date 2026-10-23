import { Loader2 } from "lucide-react";

export default function ResearchStatusCard({ record }) {
  if (record.status === "researching") {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/80 p-10 text-center shadow-xl shadow-black/5">
        <Loader2 className="mx-auto animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">
          {`Researching ${record.source} on ${record.platform}. This can take a minute or two.`}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-destructive/40 bg-card/80 p-6 shadow-xl shadow-black/5">
      <p className="text-sm text-destructive">
        {`${record.error || "Research failed."} Try running it again.`}
      </p>
    </div>
  );
}