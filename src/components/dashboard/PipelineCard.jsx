import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { CalendarDays, Check, Loader2, Trash2, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useDeleteContent } from "@/hooks/useCreatorData";

export default function PipelineCard({ item, index, onOpen }) {
  const remove = useDeleteContent();
  const [confirming, setConfirming] = useState(false);

  const meta = [item.platform, item.format].filter(Boolean).join(" · ");
  const raw =
    item.status === "scheduled"
      ? item.scheduled_date
      : item.status === "published"
        ? item.published_date
        : "";
  const date = typeof raw === "string" && raw ? parseISO(raw) : null;
  const dateLabel = date && !Number.isNaN(date.getTime()) ? format(date, "MMM d") : null;

  const confirmDelete = () => {
    remove.mutate(item.id);
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => {
            if (snapshot.isDragging) return;
            onOpen?.(item);
          }}
          className={`group relative mb-2 cursor-pointer rounded-lg border bg-card p-3 transition-colors ${
            snapshot.isDragging
              ? "border-primary"
              : "border-border/70 hover:border-primary/40"
          }`}
        >
          <div
            className="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-100"
            onClick={(event) => event.stopPropagation()}
          >
            {remove.isPending ? (
              <span className="flex h-5 w-5 items-center justify-center">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </span>
            ) : confirming ? (
              <>
                <button
                  type="button"
                  aria-label="Confirm delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    confirmDelete();
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-md text-emerald-400 hover:bg-emerald-400/10"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Cancel delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    setConfirming(false);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                aria-label="Delete piece"
                onClick={(event) => {
                  event.stopPropagation();
                  setConfirming(true);
                }}
                className="flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <p className="line-clamp-2 pr-7 text-sm font-medium">{item.title}</p>

          {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}

          {(item.pillar || dateLabel) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {item.pillar && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
                  {item.pillar}
                </span>
              )}
              {dateLabel && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  {dateLabel}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}