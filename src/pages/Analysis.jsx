import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight, ExternalLink, LineChart as LineIcon } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import EmptyState from "@/components/kit/EmptyState";
import PageHeader from "@/components/kit/PageHeader";
import PageLoader from "@/components/kit/PageLoader";
import Panel from "@/components/kit/Panel";
import { useInstagramMedia } from "@/hooks/useInstagram";
import { useTikTokMedia } from "@/hooks/useTikTok";
import { useYouTubeVideos } from "@/hooks/useYouTube";
import {
  breakdown,
  findings,
  fromInstagram,
  fromTikTok,
  fromYouTube,
  rollingMedian,
  scorePosts,
  summary,
  TIER_LABELS,
} from "@/lib/analysis";
import { compact } from "@/lib/insights";

// Pools you can analyze. Each compares posts only to their own kind.
const POOLS = [
  { key: "instagram:reel", label: "IG Reels", platform: "instagram", kind: "reel" },
  { key: "instagram:post", label: "IG Posts", platform: "instagram", kind: "post" },
  { key: "tiktok:video", label: "TikTok", platform: "tiktok", kind: "video" },
  { key: "youtube:short", label: "YT Shorts", platform: "youtube", kind: "short" },
  { key: "youtube:long", label: "YT Long", platform: "youtube", kind: "long" },
];

const TIER_STYLES = {
  outlier: "bg-primary/15 text-primary",
  above: "bg-chart-2/15 text-chart-2",
  normal: "bg-muted text-muted-foreground",
  flop: "bg-muted text-muted-foreground/60",
};

const fmtX = (m) => (m == null ? "—" : `${m >= 10 ? Math.round(m) : m.toFixed(1)}x`);

export function MultipleBadge({ post, className = "" }) {
  if (post?.multiple == null) return null;
  return (
    <span
      title={`${compact(post[post.metric])} ${post.metric} vs a median of ${compact(post.median)}`}
      className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] ${TIER_STYLES[post.tier]} ${className}`}
    >
      {fmtX(post.multiple)} · {TIER_LABELS[post.tier]}
    </span>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function Analysis() {
  const ig = useInstagramMedia();
  const tt = useTikTokMedia();
  const yt = useYouTubeVideos();
  const [poolKey, setPoolKey] = useState("instagram:reel");
  const [includeTrials, setIncludeTrials] = useState(false);

  const all = useMemo(
    () => [
      ...(ig.data || []).map(fromInstagram),
      ...(tt.data || []).map(fromTikTok),
      ...(yt.data || []).map(fromYouTube),
    ],
    [ig.data, tt.data, yt.data],
  );

  const pool = POOLS.find((p) => p.key === poolKey);
  const available = POOLS.filter((p) => all.some((x) => x.platform === p.platform && x.kind === p.kind));
  const scored = useMemo(() => {
    const inPool = all.filter(
      (p) => p.platform === pool.platform && p.kind === pool.kind && (includeTrials || !p.trial),
    );
    // Trials and live posts stay in separate pools even when shown together.
    return scorePosts(inPool);
  }, [all, pool, includeTrials]);

  const live = scored.filter((p) => !p.trial);
  const stats = summary(live.length ? live : scored);
  const facts = findings(scored);
  const dims = breakdown(scored);
  const trend = rollingMedian(live.length ? live : scored).map((d) => ({ ...d, label: format(d.at, "MMM d") }));
  const ranked = [...scored].filter((p) => p.multiple != null).sort((a, b) => b.multiple - a.multiple);
  const hasTrials = all.some((p) => p.platform === pool.platform && p.kind === pool.kind && p.trial);
  const loading = ig.isLoading || tt.isLoading || yt.isLoading;
  const m = stats.momentum;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Analysis"
        title="What's actually working"
        description="Every post scored against your median, so one viral video doesn't hide what's normal."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex flex-wrap rounded-full border border-border bg-muted/40 p-1">
          {(available.length ? available : POOLS).map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPoolKey(p.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                poolKey === p.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {hasTrials && (
          <button
            type="button"
            onClick={() => setIncludeTrials((v) => !v)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              includeTrials ? "border-primary/40 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {includeTrials ? "Trials included" : "Trials excluded"}
          </button>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : scored.length < 5 ? (
        <EmptyState
          icon={LineIcon}
          title="Not enough posts here yet"
          text="Sync a channel in Settings. Analysis needs at least 5 posts of the same kind."
          actionLabel="Open Settings"
          actionTo="/settings"
        />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
            <Stat label={`Median ${stats.metric}`} value={compact(stats.median)} hint="last 30 posts" />
            <Stat
              label="Hit rate"
              value={`${Math.round(stats.hitRate * 100)}%`}
              hint="of last 30 beat 1.5x median"
            />
            <Stat label="Outliers" value={stats.outliers} hint="3x median or more" />
            <Stat
              label="Momentum"
              value={
                m ? (
                  <span className={`inline-flex items-center gap-1 ${m.change >= 0 ? "text-chart-2" : "text-primary"}`}>
                    {m.change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {Math.round(Math.abs(m.change) * 100)}%
                  </span>
                ) : (
                  "—"
                )
              }
              hint={m ? `median of last 10 vs 10 before (${compact(m.before)} → ${compact(m.now)})` : "needs 20 posts"}
            />
          </section>

          <Panel title="What your winners have in common">
            {facts.length ? (
              <ul className="space-y-3">
                {facts.map((f) => (
                  <li key={f.text} className="flex items-start justify-between gap-4 text-sm">
                    <span>{f.text}</span>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{f.n}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No clear patterns yet. Nothing separates your winners from the rest by enough to call it. More posts will sharpen this.
              </p>
            )}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Your typical post over time (rolling median of 10)">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} minTickGap={32} />
                    <YAxis axisLine={false} tickLine={false} width={44} tickFormatter={compact} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [compact(v), `median ${stats.metric}`]}
                    />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Breakdown (median multiple per group, 3+ posts)">
              {dims.length ? (
                <div className="space-y-4">
                  {dims.map((d) => (
                    <div key={d.key}>
                      <p className="mb-1.5 text-[11px] text-muted-foreground">{d.label}</p>
                      <div className="space-y-1">
                        {d.rows.map((r) => (
                          <div key={r.bucket} className="flex items-center gap-3 text-xs">
                            <span className="w-28 shrink-0 truncate capitalize">{r.bucket}</span>
                            <div className="h-1.5 flex-1 rounded-full bg-muted">
                              <div
                                className={`h-1.5 rounded-full ${r.multiple >= 1 ? "bg-primary" : "bg-muted-foreground/40"}`}
                                style={{ width: `${Math.min(100, (r.multiple / Math.max(...d.rows.map((x) => x.multiple))) * 100)}%` }}
                              />
                            </div>
                            <span className="w-10 shrink-0 text-right font-mono">{fmtX(r.multiple)}</span>
                            <span className="w-8 shrink-0 text-right font-mono text-muted-foreground">{r.n}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not enough posts per group yet.</p>
              )}
            </Panel>
          </div>

          <Panel
            title="Ranked by multiple"
            action={
              pool.platform === "instagram" ? (
                <Link to="/instagram" className="text-xs text-primary hover:underline">
                  Analyze a post's hook →
                </Link>
              ) : null
            }
          >
            <ol className="divide-y divide-border">
              {ranked.slice(0, 15).map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">{i + 1}</span>
                  {p.thumb ? (
                    <img src={p.thumb} alt="" className="h-10 w-10 shrink-0 rounded object-cover" loading="lazy" />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{p.text.split("\n")[0] || "No caption"}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {compact(p[p.metric])} {p.metric} · {p.at ? format(p.at, "MMM d, yyyy") : ""}
                      {p.trial ? " · trial/hidden" : ""}
                    </p>
                  </div>
                  <MultipleBadge post={p} />
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" aria-label="Open post">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </Panel>
        </>
      )}
    </div>
  );
}
