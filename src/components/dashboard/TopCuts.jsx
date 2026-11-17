import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { compact, timecode, topPosts } from "@/lib/insights";

function shortDate(value) {
  const d = value ? parseISO(value) : null;
  return d && !Number.isNaN(d.getTime()) ? format(d, "MMM d") : "";
}

// The five best-performing videos as numbered frames, film-strip style.
export default function TopCuts({ posts }) {
  const top = topPosts(posts, 5);
  if (!top.length) return null;
  const allLink = top[0].source === "youtube" ? "/youtube" : "/library";

  return (
    <section aria-label="Top cuts">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[13px] font-semibold text-muted-foreground">Top cuts</h2>
        <Link to={allLink} className="text-[13px] text-muted-foreground hover:text-foreground">
          All videos →
        </Link>
      </div>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {top.map((p, i) => (
          <li key={p.id}>
            <a href={p.url || undefined} target="_blank" rel="noreferrer" className="group block">
              <div className="relative aspect-[9/14] overflow-hidden rounded-md border border-border bg-secondary">
                {p.thumbnail && (
                  <img src={p.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                )}
                <span className="absolute left-2 top-2 rounded-sm bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {p.seconds > 0 && (
                  <span className="absolute bottom-2 right-2 rounded-sm bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                    {timecode(p.seconds)}
                  </span>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-foreground group-hover:text-primary">{p.title}</p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {compact(p.views)}
                {p.date ? ` · ${shortDate(p.date)}` : ""}
              </p>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
