import { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import FieldSelect from "@/components/kit/FieldSelect";
import Panel from "@/components/kit/Panel";
import PipelineColumn from "@/components/dashboard/PipelineColumn";
import { useSaveContent } from "@/hooks/useCreatorData";
import { STATUSES } from "@/lib/content";

export default function ContentPipeline({ items = [], onOpenItem }) {
  const queryClient = useQueryClient();
  const saveContent = useSaveContent();
  const [platform, setPlatform] = useState("all");

  const platforms = [];
  items.forEach((item) => {
    const name = item.platform;
    if (!name) return;
    if (!platforms.some((known) => known.toLowerCase() === name.toLowerCase())) {
      platforms.push(name);
    }
  });
  platforms.sort((a, b) => a.localeCompare(b));

  const visibleItems =
    platform === "all"
      ? items
      : items.filter((item) => (item.platform || "").toLowerCase() === platform.toLowerCase());

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
      <div className="mb-5 max-w-xs">
        <FieldSelect
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={[
            { value: "all", label: "All platforms" },
            ...platforms.map((name) => ({ value: name, label: name })),
          ]}
        />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {STATUSES.map(({ value, label }) => (
            <PipelineColumn
              key={value}
              status={value}
              label={label}
              items={visibleItems.filter((item) => item.status === value)}
              onOpen={onOpenItem}
            />
          ))}
        </div>
      </DragDropContext>
    </Panel>
  );
}