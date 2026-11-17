import { Link } from "react-router-dom";
import { format } from "date-fns";
import Panel from "@/components/kit/Panel";
import { MultipleBadge } from "@/pages/Analysis";
import { compact } from "@/lib/insights";

const PLATFORM = { instagram: "IG", tiktok: "TT", youtube: "YT" };

// Your top posts from the last 30 days, ranked by multiple, not raw views.
export default function BestRecent({ scored }) {
  const since = Date.now() - 30 * 86400000;
  const best = scored
    .filter((p) => !p.trial && p.multiple != null && p.at >= since)
    .sort((a, b) => b.multiple - a.multiple)
    .slice(0, 5);
  if (!best.length) return null;

  return (
    <Panel
      title="Best of the last 30 days"
      action={
        <Link to="/analysis" className="text-xs text-primary hover:underline">
          Full analysis →
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {best.map((p) => (
          <figure key={p.id} className="min-w-0">
            <div className="relative aspect-[9/16] overflow-hidden rounded-md bg-muted">
              {p.thumb && <img src={p.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />}
              <MultipleBadge post={p} className="absolute bottom-2 left-2 bg-black/70 backdrop-blur" />
              <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
                {PLATFORM[p.platform]}
              </span>
            </div>
            <figcaption className="mt-2 space-y-0.5">
              <p className="truncate text-xs">{p.text.split("\n")[0] || "No caption"}</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {compact(p[p.metric])} {p.metric} · {format(p.at, "MMM d")}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </Panel>
  );
}
