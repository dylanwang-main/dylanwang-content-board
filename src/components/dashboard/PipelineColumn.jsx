import { Droppable } from "@hello-pangea/dnd";
import PipelineCard from "@/components/dashboard/PipelineCard";
import { STATUS_BARS } from "@/lib/content";

export default function PipelineColumn({ status, label, items, onOpen }) {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div className="flex w-64 shrink-0 flex-col rounded-lg bg-card p-2.5 lg:w-auto">
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className={`h-2 w-2 rounded-full ${STATUS_BARS[status] || ""}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">{items.length}</span>
          </div>

          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`max-h-[420px] min-h-[96px] flex-1 overflow-y-auto rounded-lg p-0.5 transition-colors ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            }`}
          >
            {items.length === 0 && !snapshot.isDraggingOver && (
              <p className="flex h-[96px] items-center justify-center text-center text-xs text-muted-foreground/50">
                Empty
              </p>
            )}

            {items.map((item, index) => (
              <PipelineCard key={item.id} item={item} index={index} onOpen={onOpen} />
            ))}

            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}