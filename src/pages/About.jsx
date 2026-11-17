import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/kit/PageHeader";
import Panel from "@/components/kit/Panel";

const REPO = "https://github.com/dylanwang-main/dylanwang-content-board";

const DECISIONS = [
  {
    title: "Score posts against your own median, not your average",
    body: "One viral reel can make an average useless: a 1M-view post drags the mean so high that every normal post looks like a failure. The median of the last 30 posts of the same kind (reels vs reels, Shorts vs Shorts) is what \"normal\" actually means, so every post gets a multiple: 3x+ is an outlier, under 0.5x is a flop.",
    to: "/analysis",
    cta: "See it on Analysis",
  },
  {
    title: "Trial reels were hiding in the data",
    body: "My Instagram profile said 51 posts, but the API returned 186. The gap was 136 trial reels and grid-hidden reels: the same video posted several times a minute apart to test hooks on non-followers. They're now detected (is_shared_to_feed = false), hidden by default, and scored only against each other, so they don't distort the real median or make consistency look better than it is.",
    to: "/instagram",
    cta: "See the trial filter",
  },
  {
    title: "Only call a pattern when it's real",
    body: "\"Your Tuesday posts do better\" is easy to fake with three data points. Findings only show when each group has at least 3 posts and the best group beats the worst by 1.5x or more, and every one shows its sample size. With ~40 posts these are things to test, not rules.",
    to: "/analysis",
    cta: "See the findings",
  },
  {
    title: "Consistency from what actually got posted",
    body: "The habits calendar is built from synced posts, not a manual log, so it can't be gamed by forgetting to check a box. Trial reels don't count toward the weekly goal.",
    to: "/performance",
    cta: "See posting habits",
  },
  {
    title: "Cutting the scheduler",
    body: "I wanted to schedule posts at my best times straight from here. TikTok and YouTube force uploads from unaudited apps to private, and a personal tool won't pass their audits. Buffer is already audited, so it keeps doing the posting and this app stays focused on analysis.",
  },
  {
    title: "A thin backend on purpose",
    body: "Most logic runs in the browser against Supabase, with row-level security as the boundary. The only server code is where a secret can't be avoided: TikTok's OAuth exchange and token refresh run in one edge function, and those tokens sit in a table no browser role can read.",
  },
];

const STACK = ["React + Vite", "Tailwind + shadcn/ui", "Supabase (Postgres, RLS, auth, edge function, pg_cron)", "Vercel", "Instagram Graph API", "TikTok Display API", "YouTube Data API", "Claude API (optional, bring your own key)"];

export default function About() {
  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        eyebrow="About"
        title="Why I built this"
        description="I post short-form video on Instagram, TikTok and YouTube. Every platform shows me raw numbers. None of them tell me whether a post was good for me, what my winners have in common, or whether I'm actually posting consistently. This answers those three questions in one place."
      />

      <div className="flex flex-wrap gap-2 text-sm">
        <a href={REPO} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:border-primary/50">
          Source on GitHub <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <Link to="/analysis" className="rounded-full bg-primary/15 px-3 py-1.5 text-primary hover:bg-primary/25">
          Open Analysis
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold">Decisions worth explaining</h2>
        <ol className="space-y-3">
          {DECISIONS.map((d, i) => (
            <li key={d.title} className="rounded-lg border border-border bg-card p-4">
              <p className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 text-sm font-semibold">{d.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
              {d.to && (
                <Link to={d.to} className="mt-2 inline-block text-xs text-primary hover:underline">
                  {d.cta} →
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>

      <Panel title="Stack">
        <ul className="flex flex-wrap gap-2">
          {STACK.map((s) => (
            <li key={s} className="rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground">
              {s}
            </li>
          ))}
        </ul>
      </Panel>

      <p className="text-xs text-muted-foreground">
        Started from a course template on Base44, then rebuilt on Supabase + Vercel. The analysis, channel sync, trial-reel
        handling, posting habits, design and demo are mine. The demo workspace uses fictional data; my real accounts
        stay private.
      </p>
    </div>
  );
}
