import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Minus, Plus } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Panel from "@/components/kit/Panel";
import { useInstagramMedia } from "@/hooks/useInstagram";
import { useTikTokMedia } from "@/hooks/useTikTok";
import { useYouTubeVideos } from "@/hooks/useYouTube";
import { fromInstagram, fromTikTok, fromYouTube } from "@/lib/analysis";
import { calendar, habits } from "@/lib/habits";

const GOAL_KEY = "cc.postingGoal";
const PLATFORMS = [
  { key: "instagram", label: "Instagram", color: "hsl(var(--primary))" },
  { key: "tiktok", label: "TikTok", color: "hsl(var(--chart-2))" },
  { key: "youtube", label: "YouTube", color: "hsl(var(--chart-3))" },
];

function loadGoal() {
  try {
    return Math.max(1, Number(localStorage.getItem(GOAL_KEY)) || 3);
  } catch {
    return 3;
  }
}

function Stat({ label, value, hint, warn }) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono text-lg ${warn ? "text-primary" : ""}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// Consistency, from what your connected channels actually posted.
// Trial and grid-hidden reels don't count: they're re-posts, not new posts.
export default function PostingHabits() {
  const ig = useInstagramMedia();
  const tt = useTikTokMedia();
  const yt = useYouTubeVideos();
  const [goal, setGoal] = useState(loadGoal);
  const [platform, setPlatform] = useState("all");
  const [hover, setHover] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(GOAL_KEY, String(goal));
    } catch {
      // not remembered
    }
  }, [goal]);

  const all = useMemo(
    () =>
      [
        ...(ig.data || []).map(fromInstagram),
        ...(tt.data || []).map(fromTikTok),
        ...(yt.data || []).map(fromYouTube),
      ].filter((p) => !p.trial && p.at),
    [ig.data, tt.data, yt.data],
  );
  const connected = PLATFORMS.filter((p) => all.some((x) => x.platform === p.key));
  const posts = platform === "all" ? all : all.filter((p) => p.platform === platform);
  const h = habits(posts, { goal });
  const grid = calendar(posts);
  const shown = platform === "all" ? connected : connected.filter((p) => p.key === platform);
  const weekData = h.weeks.map((w) => ({
    label: format(w.week, "MMM d"),
    ...Object.fromEntries(shown.map((p) => [p.key, w.byPlatform[p.key] || 0])),
  }));

  if (!all.length) return null;

  const shade = (n) =>
    n === 0 ? "bg-muted" : n === 1 ? "bg-primary/40" : n === 2 ? "bg-primary/70" : "bg-primary";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">Posting habits</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            From your synced channels. Trial and grid-hidden reels don't count.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-border bg-muted/40 p-1">
            {[{ key: "all", label: "All" }, ...connected].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPlatform(p.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  platform === p.key ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-border px-1 py-0.5 text-xs">
            <button type="button" aria-label="Lower goal" onClick={() => setGoal((g) => Math.max(1, g - 1))} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
              <Minus className="h-3 w-3" />
            </button>
            <span className="font-mono">Goal {goal}/wk</span>
            <button type="button" aria-label="Raise goal" onClick={() => setGoal((g) => Math.min(21, g + 1))} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-5">
        <Stat label="This week" value={`${h.thisWeek}/${goal}`} hint={h.thisWeek >= goal ? "goal hit" : `${goal - h.thisWeek} to go`} />
        <Stat label="Streak" value={`${h.streak} wk`} hint={`weeks in a row at ${goal}+`} />
        <Stat label="Avg per week" value={h.avgPerWeek.toFixed(1)} hint="last 11 full weeks" />
        <Stat label="Weeks on goal" value={`${Math.round(h.goalHitRate * 100)}%`} hint="last 11 full weeks" />
        <Stat
          label="Since last post"
          value={h.daysSinceLast == null ? "—" : `${h.daysSinceLast}d`}
          hint={`longest gap (90d): ${h.longestGap}d`}
          warn={h.daysSinceLast != null && h.daysSinceLast >= 7}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Panel title="Last 6 months">
          <div className="relative" onMouseLeave={() => setHover(null)}>
            <div className="flex gap-[3px] overflow-x-auto">
              {grid.map((week, i) => (
                <div key={i} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.at}
                      onMouseEnter={(e) =>
                        !day.future &&
                        setHover({ day, x: e.currentTarget.offsetLeft + 6, y: e.currentTarget.offsetTop })
                      }
                      className={`h-3 w-3 rounded-[2px] ${day.future ? "bg-transparent" : shade(day.count)} ${
                        hover?.day.at === day.at ? "ring-1 ring-foreground" : ""
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
            {hover && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-lg"
                style={{ left: hover.x, top: hover.y - 6 }}
              >
                <p className="font-medium">
                  {hover.day.count} post{hover.day.count === 1 ? "" : "s"}
                  <span className="font-normal text-muted-foreground"> · {format(hover.day.at, "EEE, MMM d")}</span>
                </p>
                {hover.day.count > 0 && platform === "all" && (
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {PLATFORMS.filter((p) => hover.day.byPlatform[p.key])
                      .map((p) => `${p.label} ${hover.day.byPlatform[p.key]}`)
                      .join(" · ")}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            Less
            {[0, 1, 2, 3].map((n) => (
              <span key={n} className={`h-2.5 w-2.5 rounded-[2px] ${shade(n)}`} />
            ))}
            More
          </div>
        </Panel>

        <Panel title="Posts per week (last 12)">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={24} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={24} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                {shown.map((p, i) => (
                  <Bar key={p.key} dataKey={p.key} name={p.label} stackId="a" fill={p.color} radius={i === shown.length - 1 ? [2, 2, 0, 0] : 0} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </section>
  );
}
