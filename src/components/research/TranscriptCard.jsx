import Panel from "@/components/kit/Panel";

export default function TranscriptCard({ scan }) {
  const reasons = scan.why_it_works || [];

  return (
    <Panel title="Transcript">
      {scan.hook && (
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Hook</p>
          <p className="mt-1 text-sm text-primary">{scan.hook}</p>
        </div>
      )}

      {scan.transcript_available === false && (
        <p className="mt-4 text-sm text-muted-foreground">
          A full transcript wasn't publicly available — showing a content description instead.
        </p>
      )}

      <div className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl bg-background/40 p-4 text-sm leading-relaxed text-muted-foreground">
        {scan.transcript || "No transcript found."}
      </div>

      {reasons.length > 0 && (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Why it works</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {reasons.map((reason, index) => (
              <li key={`${reason}-${index}`}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}