import { Link } from "react-router-dom";
import { format } from "date-fns";
import { compact } from "@/lib/insights";

// Opens on how your latest post did against your own median, not a greeting.
export default function HomeHero({ headline, posts, habits, goal, followers }) {
  const dates = posts.map((p) => p.at).filter(Boolean).sort((a, b) => a - b);
  const range = dates.length
    ? `${format(dates[0], "MMM d").toUpperCase()} → ${format(dates[dates.length - 1], "MMM d").toUpperCase()}`
    : "NO FOOTAGE YET";

  const stats = [
    { label: "this week", value: `${habits.thisWeek}/${goal}`, to: "/performance" },
    { label: "week streak", value: habits.streak, to: "/performance" },
    { label: "since last post", value: habits.daysSinceLast == null ? "—" : `${habits.daysSinceLast}d`, to: "/performance" },
    ...(followers ? [{ label: "followers", value: compact(followers) }] : []),
  ];

  return (
    <section aria-label="Overview">
      <p className="font-mono text-xs text-primary">● REC&nbsp;&nbsp;{range}</p>
      <h2 className="mt-3 max-w-3xl font-heading text-[28px] leading-tight text-foreground sm:text-[32px]">{headline.title}</h2>
      <p className="mt-2 max-w-3xl text-[15px] text-muted-foreground">
        {headline.detail}{" "}
        {headline.post && (
          <Link to="/analysis" className="text-primary hover:underline">
            See analysis →
          </Link>
        )}
      </p>
      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[13px] text-muted-foreground">
        {stats.map((s) => {
          const body = (
            <>
              <dd className="text-xl text-foreground">{s.value}</dd>
              <dt>{s.label}</dt>
            </>
          );
          return s.to ? (
            <Link key={s.label} to={s.to} className="flex items-baseline gap-2 hover:text-foreground">
              {body}
            </Link>
          ) : (
            <div key={s.label} className="flex items-baseline gap-2">
              {body}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
