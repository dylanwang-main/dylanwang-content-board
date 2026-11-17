import { format, parseISO } from "date-fns";
import { compact, headline } from "@/lib/insights";

function shortDate(value) {
  const d = value ? parseISO(value) : null;
  return d && !Number.isNaN(d.getTime()) ? format(d, "MMM d").toUpperCase() : "";
}

// The page opens on one real insight from the numbers, not a greeting.
export default function HomeHero({ posts, followers }) {
  const { title, detail } = headline(posts);
  const dates = posts.map((p) => p.date).filter(Boolean).sort();
  const range = dates.length ? `${shortDate(dates[0])} → ${shortDate(dates[dates.length - 1])}` : "NO FOOTAGE YET";
  const views = posts.reduce((s, p) => s + p.views, 0);
  const likes = posts.reduce((s, p) => s + p.likes, 0);

  const stats = [
    { label: "views", value: compact(views) },
    { label: posts.length === 1 ? "video" : "videos", value: posts.length },
    { label: "likes", value: compact(likes) },
    ...(followers ? [{ label: "followers", value: compact(followers) }] : []),
  ];

  return (
    <section aria-label="Overview">
      <p className="font-mono text-xs text-primary">● REC&nbsp;&nbsp;{range}</p>
      <h2 className="mt-3 max-w-3xl font-heading text-[28px] leading-tight text-foreground sm:text-[32px]">{title}</h2>
      <p className="mt-2 max-w-3xl text-[15px] text-muted-foreground">{detail}</p>
      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[13px] text-muted-foreground">
        {stats.map((s) => (
          <div key={s.label} className="flex items-baseline gap-2">
            <dt className="sr-only">{s.label}</dt>
            <dd className="text-xl text-foreground">{s.value}</dd>
            <span aria-hidden="true">{s.label}</span>
          </div>
        ))}
      </dl>
    </section>
  );
}
