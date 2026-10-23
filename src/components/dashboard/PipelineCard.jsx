import { Draggable } from "@hello-pangea/dnd";
import { CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function PipelineCard({ item, index }) {
  const meta = [item.platform, item.format].filter(Boolean).join(" · ");
  const raw =
    item.status === "scheduled"
      ? item.scheduled_date
      : item.status === "published"
        ? item.published_date
        : "";
  const date = typeof raw === "string" && raw ? parseISO(raw) : null;
  const dateLabel = date && !Number.isNaN(date.getTime()) ? format(date, "MMM d") : null;

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 cursor-grab rounded-xl border bg-card p-3 transition-colors active:cursor-grabbing ${
            snapshot.isDragging
              ? "border-primary shadow-lg shadow-primary/20"
              : "border-border/70 hover:border-primary/40"
          }`}
        >
          <p className="line-clamp-2 text-sm font-medium">{item.title}</p>

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