import Panel from "@/components/kit/Panel";
import { formatNumber } from "@/lib/content";

export default function ChannelTopPosts({ posts }) {
  return (
    <Panel title="Top synced posts">
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No synced posts in this range.</p>
      ) : (
        <div className="divide-y divide-border/70">
          {posts.map((post, index) => (
            <a
              key={`${post.platform}-${post.id}`}
              href={post.url || undefined}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 py-3 transition-colors first:pt-0 last:pb-0"
            >
              <span className="font-heading text-3xl font-light italic text-primary/70">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                  {post.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{post.platform}</p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-medium">{formatNumber(post.likes)} likes</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(post.comments)} comments
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </Panel>
  );
}