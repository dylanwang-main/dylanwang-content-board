import { Droppable } from "@hello-pangea/dnd";
import PipelineCard from "@/components/dashboard/PipelineCard";
import { STATUS_BARS } from "@/lib/content";

export default function PipelineColumn({ status, label, items }) {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div className="flex w-64 shrink-0 flex-col rounded-2xl border border-border/70 bg-card/40 p-3 lg:w-auto">
          <div className="mb-3 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${STATUS_BARS[status] || ""}`} />
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </span>
            <span className="ml-auto font-heading text-sm font-light">{items.length}</span>
          </div>

          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`max-h-[420px] min-h-[140px] flex-1 overflow-y-auto rounded-xl p-0.5 transition-colors ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            }`}
          >
            {items.length === 0 && !snapshot.isDraggingOver && (
              <p className="flex h-[140px] items-center justify-center text-center text-xs text-muted-foreground/60">
                Drop content here
              </p>
            )}

            {items.map((item, index) => (
              <PipelineCard key={item.id} item={item} index={index} />
            ))}

            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}