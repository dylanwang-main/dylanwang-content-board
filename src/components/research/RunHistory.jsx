import { useDeleteResearch } from "@/hooks/useResearch";
import RunHistoryRow from "@/components/research/RunHistoryRow";

export default function RunHistory({ runs, selectedId, onSelect }) {
  const remove = useDeleteResearch();
  const inUseId = runs.find((run) => run.status === "complete")?.id;

  return (
    <div>
      <h3 className="text-xs text-muted-foreground">Research runs</h3>

      <div className="mt-3 space-y-2">
        {runs.map((run) => (
          <RunHistoryRow
            key={run.id}
            run={run}
            isSelected={run.id === selectedId}
            isInUse={run.id === inUseId}
            isDeleting={remove.isPending && remove.variables === run.id}
            onSelect={() => onSelect(run.id)}
            onDelete={() => remove.mutate(run.id)}
          />
        ))}
      </div>
    </div>
  );
}