import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function MediaDetailDialog({ item, onClose }) {
  const analyzed = item.status === "analyzed";

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-xl">
        <DialogTitle className="sr-only">Instagram post</DialogTitle>

        {item.thumbnail_url && (
          <img
            src={item.thumbnail_url}
            alt=""
            className="max-h-72 w-full rounded-xl object-cover"
          />
        )}

        {item.permalink && (
          <a
            href={item.permalink}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Open on Instagram
          </a>
        )}

        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
          {item.caption || "No caption"}
        </p>

        {analyzed ? (
          <div className="mt-6 space-y-5">
            {item.hook && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Hook
                </p>
                <p className="mt-1.5 text-sm italic text-primary">{item.hook}</p>
              </div>
            )}

            {item.summary && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Summary
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{item.summary}</p>
              </div>
            )}

            {Array.isArray(item.why_it_works) && item.why_it_works.length > 0 && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Why it works
                </p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
                  {item.why_it_works.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {item.transcript && (
              <details className="rounded-xl border border-border/70 bg-background/40 p-3">
                <summary className="cursor-pointer text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Transcript
                </summary>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80">
                  {item.transcript}
                </p>
              </details>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Press Analyze to break this post down.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}