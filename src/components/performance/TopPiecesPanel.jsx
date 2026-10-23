import { Link } from "react-router-dom";
import Panel from "@/components/kit/Panel";
import { formatNumber, interactions } from "@/lib/content";

function pieceMeta(item) {
  const parts = [item.platform, item.format].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export default function TopPiecesPanel({ items }) {
  const top = [...items].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  return (
    <Panel title="Top performing">
      <div className="divide-y divide-border/70">
        {top.map((item, index) => (
          <Link
            key={item.id}
            to={`/library?open=${item.id}`}
            className="group flex items-center gap-4 py-3 transition-colors first:pt-0 last:pb-0"
          >
            <span className="font-heading text-3xl font-light italic text-primary/70">
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                {item.title}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{pieceMeta(item)}</p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-medium">{formatNumber(item.views || 0)}</p>
              <p className="text-xs text-muted-foreground">
                {item.views ? `${((interactions(item) / item.views) * 100).toFixed(1)}% eng.` : "—"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}