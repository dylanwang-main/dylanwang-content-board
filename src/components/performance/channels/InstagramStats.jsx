import { ImageOff } from "lucide-react";
import Panel from "@/components/kit/Panel";
import { formatNumber } from "@/lib/content";

export default function InstagramStats({ instagram }) {
  if (!instagram.posts) return null;

  const best = instagram.best;

  return (
    <Panel title="Instagram">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[11px] text-muted-foreground">Posts</p>
          <p className="mt-1 font-heading text-2xl font-light">{instagram.posts}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">
            Avg likes
          </p>
          <p className="mt-1 font-heading text-2xl font-light">
            {formatNumber(Math.round(instagram.avgLikes))}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">
            Avg comments
          </p>
          <p className="mt-1 font-heading text-2xl font-light">
            {formatNumber(Math.round(instagram.avgComments))}
          </p>
        </div>
      </div>

      {best && (
        <a
          href={best.url || undefined}
          target="_blank"
          rel="noreferrer"
          className="group mt-5 flex items-center gap-3 border-t border-border/70 pt-4"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
            {best.thumbnail ? (
              <img
                src={best.thumbnail}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageOff className="h-4 w-4" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Best post</p>
            <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
              {best.title}
            </p>
          </div>

          <p className="shrink-0 text-xs text-muted-foreground">
            {formatNumber(best.likes)} likes · {formatNumber(best.comments)} comments
          </p>
        </a>
      )}
    </Panel>
  );
}