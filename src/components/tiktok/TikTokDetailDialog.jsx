import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function TikTokDetailDialog({ item, onClose }) {
  const analyzed = item.status === "analyzed";

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-lg">
        <DialogTitle className="sr-only">TikTok video</DialogTitle>

        {item.cover_image_url && (
          <img
            src={item.cover_image_url}
            alt=""
            className="mx-auto max-h-80 rounded-lg object-cover"
          />
        )}

        {item.share_url && (
          <a
            href={item.share_url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Open on TikTok
          </a>
        )}

        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
          {item.video_description || "No description"}
        </p>

        {analyzed ? (
          <div className="mt-6 space-y-5">
            {item.hook && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  Hook
                </p>
                <p className="mt-1.5 text-sm italic text-primary">{item.hook}</p>
              </div>
            )}

            {item.summary && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  Summary
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{item.summary}</p>
              </div>
            )}

            {Array.isArray(item.why_it_works) && item.why_it_works.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground">
                  Why it works
                </p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/90">
                  {item.why_it_works.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Press Analyze to break this video down.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}