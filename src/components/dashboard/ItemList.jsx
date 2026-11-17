import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import Panel from "@/components/kit/Panel";
import StatusBadge from "@/components/kit/StatusBadge";

export default function ItemList({ title, items, emptyMessage, dateField }) {
  const rows = items || [];

  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((item) => {
            const value = dateField ? item[dateField] : null;
            const date = typeof value === "string" && value ? parseISO(value) : null;
            const hasDate = Boolean(date) && !Number.isNaN(date.getTime());

            return (
              <li key={item.id}>
                <Link
                  to={`/library?open=${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 truncate text-sm">{item.title}</span>
                  {hasDate ? (
                    <span className="shrink-0 text-xs text-primary">
                      {format(date, "EEE, MMM d")}
                    </span>
                  ) : (
                    <StatusBadge status={item.status} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}