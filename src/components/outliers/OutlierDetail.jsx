import { useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PLATFORM_STYLES } from "@/components/outliers/OutlierCard";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useDeleteOutlier,
  useDissectOutlier,
  useGenerateVariations,
} from "@/hooks/useOutliers";
import { formatNumber } from "@/lib/content";

function Block({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-medium text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function OutlierDetail({ outlier, onClose }) {
  const dissect = useDissectOutlier();
  const variations = useGenerateVariations();
  const remove = useDeleteOutlier();
  const [confirming, setConfirming] = useState(false);

  const metrics = outlier.metrics || {};
  const platform = PLATFORM_STYLES[outlier.platform] || { label: outlier.platform, color: "text-muted-foreground" };
  const status = outlier.status || "detected";
  const dissected = status === "dissected";

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    await remove.mutateAsync(outlier.id);
    onClose();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-3xl overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-[11px] font-medium text-primary">
            Outlier
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
            {outlier.thumbnail_url && (
              <img src={outlier.thumbnail_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>

          <div className="min-w-0 space-y-2">
            <p className="text-base font-medium leading-snug">{outlier.title || "Untitled post"}</p>

            <p className={`text-xs font-medium ${platform.color}`}>{platform.label}</p>

            <p className="text-xs text-muted-foreground">
              {outlier.platform !== "instagram" && `${formatNumber(metrics.views)} views · `}
              {formatNumber(metrics.likes)} likes · {formatNumber(metrics.comments)} comments
            </p>

            {outlier.source_url && (
              <a
                href={outlier.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Open original
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {status === "dissecting" && (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Breaking this post down…
          </p>
        )}

        {status === "failed" && outlier.error && (
          <p className="text-sm text-destructive">{outlier.error}</p>
        )}

        {dissected && (
          <div className="space-y-5">
            {outlier.hook && (
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-[11px] font-medium text-primary">
                  Hook
                </p>
                <p className="mt-2 text-sm italic leading-relaxed">{outlier.hook}</p>
              </div>
            )}

            {outlier.body_analysis && (
              <Block title="What the body does">
                <p className="text-sm leading-relaxed text-foreground/90">{outlier.body_analysis}</p>
              </Block>
            )}

            {(outlier.drop_off_points || []).length > 0 && (
              <Block title="Where viewers drop off">
                <ul className="space-y-2">
                  {outlier.drop_off_points.map((point, index) => (
                    <li key={index} className="flex gap-2 text-sm leading-relaxed">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-chart-3" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {(outlier.retention_points || []).length > 0 && (
              <Block title="What keeps them watching">
                <ul className="space-y-2">
                  {outlier.retention_points.map((point, index) => (
                    <li key={index} className="flex gap-2 text-sm leading-relaxed">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {(outlier.why_it_worked || []).length > 0 && (
              <Block title="Why it worked">
                <ol className="space-y-2">
                  {outlier.why_it_worked.map((reason, index) => (
                    <li key={index} className="flex gap-3 text-sm leading-relaxed">
                      <span className="font-heading text-base italic text-primary/70">
                        {index + 1}
                      </span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            {outlier.full_transcript && (
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/70 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
                  Transcript
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {outlier.full_transcript}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={remove.isPending}
            className="rounded-full text-destructive hover:text-destructive"
          >
            <Trash2 />
            {confirming ? "Click again to remove" : "Remove"}
          </Button>

          {dissected ? (
            outlier.variations_generated ? (
              <p className="text-sm text-muted-foreground">
                Ideas added to your{" "}
                <Link to="/library" className="text-primary hover:underline">
                  Content System
                </Link>
              </p>
            ) : (
              <Button
                onClick={() => variations.mutate(outlier.id)}
                disabled={variations.isPending}
                className="rounded-full"
              >
                {variations.isPending && <Loader2 className="animate-spin" />}
                {variations.isPending
                  ? "Writing your ideas…"
                  : "Create 3 to 5 new ideas from this"}
              </Button>
            )
          ) : (
            status !== "dissecting" && (
              <Button
                onClick={() => dissect.mutate(outlier.id)}
                disabled={dissect.isPending}
                className="rounded-full"
              >
                {dissect.isPending && <Loader2 className="animate-spin" />}
                Break it down
              </Button>
            )
          )}
        </div>

        {variations.isError && (
          <p className="text-sm text-destructive">{variations.error.message}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}