import { DragDropContext } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Panel from "@/components/kit/Panel";
import PipelineColumn from "@/components/dashboard/PipelineColumn";
import { useSaveContent } from "@/hooks/useCreatorData";
import { STATUSES } from "@/lib/content";

export default function ContentPipeline({ items = [] }) {
  const queryClient = useQueryClient();
  const saveContent = useSaveContent();

  const handleDragEnd = (result) => {
    const { draggableId, source, destination } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const item = items.find((row) => row.id === draggableId);
    if (!item) return;

    const data = { status: destination.droppableId };
    if (data.status === "published" && !item.published_date) {
      data.published_date = format(new Date(), "yyyy-MM-dd");
    }

    queryClient.setQueryData(["content"], (current) =>
      (current || []).map((row) => (row.id === draggableId ? { ...row, ...data } : row))
    );

    saveContent.mutate({ id: draggableId, data });
  };

  return (
    <Panel
      title="Content pipeline"
      action={<p className="text-xs text-muted-foreground">Drag cards between stages</p>}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {STATUSES.map(({ value, label }) => (
            <PipelineColumn
              key={value}
              status={value}
              label={label}
              items={items.filter((item) => item.status === value)}
            />
          ))}
        </div>
      </DragDropContext>
    </Panel>
  );
}