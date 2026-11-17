import { useDeleteContentScan } from "@/hooks/useContentScans";
import ContentScanRow from "@/components/research/ContentScanRow";

export default function ContentScanList({ scans, selectedId, onSelect }) {
  const remove = useDeleteContentScan();

  return (
    <div>
      <h3 className="text-xs text-muted-foreground">Scans</h3>

      <div className="mt-3 space-y-2">
        {scans.map((scan) => (
          <ContentScanRow
            key={scan.id}
            scan={scan}
            isSelected={scan.id === selectedId}
            isDeleting={remove.isPending && remove.variables === scan.id}
            onSelect={() => onSelect(scan.id)}
            onDelete={() => remove.mutate(scan.id)}
          />
        ))}
      </div>
    </div>
  );
}