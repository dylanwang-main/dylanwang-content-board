import StatusBadge from "@/components/kit/StatusBadge";
import { formatNumber } from "@/lib/content";
import { itemDate, itemMeta } from "@/lib/library";

export default function LibraryRow({ item, onSelect }) {
  const date = itemDate(item);
  const isPublished = item.status === "published";

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="group flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent/50"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium transition-colors group-hover:text-primary">
          {item.title}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{itemMeta(item)}</p>
      </div>

      {isPublished && (
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {formatNumber(item.views || 0)} views
        </span>
      )}

      {date && <span className="hidden text-xs text-muted-foreground md:inline">{date}</span>}

      <StatusBadge status={item.status} />
    </button>
  );
}