// Insights v1: score every post against your median and find what the
// winners have in common. Pure functions over one normalized post shape.

const num = (v) => Number(v) || 0;
const ms = (v) => {
  const t = Date.parse(v || "");
  return Number.isNaN(t) ? 0 : t;
};

export function median(values) {
  const s = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!s.length) return 0;
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// ---- normalize -------------------------------------------------------------

export function fromInstagram(m) {
  const reel = m.media_product_type ? m.media_product_type === "REELS" : m.media_type === "VIDEO";
  return {
    id: m.id,
    platform: "instagram",
    kind: reel ? "reel" : "post",
    trial: reel && m.is_shared_to_feed === false,
    format: reel ? "Reel" : m.media_type === "CAROUSEL_ALBUM" ? "Carousel" : "Photo",
    at: ms(m.timestamp),
    views: m.view_count == null ? null : num(m.view_count),
    likes: num(m.like_count),
    comments: num(m.comments_count),
    shares: m.shares_count == null ? null : num(m.shares_count),
    saves: m.saved_count == null ? null : num(m.saved_count),
    seconds: null,
    text: m.caption || "",
    thumb: m.thumbnail_url || "",
    url: m.permalink || "",
    raw: m,
  };
}

export function fromTikTok(v) {
  return {
    id: v.id,
    platform: "tiktok",
    kind: "video",
    trial: false,
    format: "Video",
    at: ms(v.create_time),
    views: num(v.view_count),
    likes: num(v.like_count),
    comments: num(v.comment_count),
    shares: num(v.share_count),
    saves: null,
    seconds: v.duration ? num(v.duration) : null,
    text: v.video_description || "",
    thumb: v.cover_image_url || "",
    url: v.share_url || "",
    raw: v,
  };
}

export function fromYouTube(v) {
  const short = (v.format || "short_form") === "short_form";
  return {
    id: v.id,
    platform: "youtube",
    kind: short ? "short" : "long",
    trial: false,
    format: short ? "Short" : "Long form",
    at: ms(v.published_at),
    views: num(v.view_count),
    likes: num(v.like_count),
    comments: num(v.comment_count),
    shares: null,
    saves: null,
    seconds: v.duration_seconds ? num(v.duration_seconds) : null,
    text: v.title || "",
    thumb: v.thumbnail_url || "",
    url: v.url || "",
    raw: v,
  };
}

// ---- scoring ---------------------------------------------------------------

export const POOL_SIZE = 30;

// Posts are compared to the median of the most recent POOL_SIZE posts of the
// same platform, kind and trial status. Views if we have them, likes if not.
export function poolKey(p) {
  return `${p.platform}:${p.kind}:${p.trial ? "trial" : "live"}`;
}

export function metricFor(posts) {
  return posts.some((p) => p.views) ? "views" : "likes";
}

export function tier(multiple) {
  if (multiple == null) return null;
  if (multiple >= 3) return "outlier";
  if (multiple >= 1.5) return "above";
  if (multiple < 0.5) return "flop";
  return "normal";
}

export const TIER_LABELS = { outlier: "Outlier", above: "Above", normal: "Normal", flop: "Flop" };

export function scorePosts(posts, poolSize = POOL_SIZE) {
  const groups = new Map();
  posts.forEach((p) => {
    const k = poolKey(p);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  });
  const out = [];
  groups.forEach((group) => {
    const metric = metricFor(group);
    const recent = [...group].sort((a, b) => b.at - a.at).slice(0, poolSize);
    const med = median(recent.map((p) => p[metric]).filter((v) => v != null));
    group.forEach((p) => {
      const value = p[metric];
      const multiple = med > 0 && value != null ? value / med : null;
      out.push({ ...p, metric, median: med, multiple, tier: tier(multiple) });
    });
  });
  return out;
}

// ---- trend -----------------------------------------------------------------

// Rolling median of the metric over the last `size` posts, oldest → newest.
export function rollingMedian(scored, size = 10) {
  const sorted = [...scored].filter((p) => p.at).sort((a, b) => a.at - b.at);
  return sorted.map((p, i) => ({
    at: p.at,
    value: median(sorted.slice(Math.max(0, i - size + 1), i + 1).map((q) => q[q.metric] ?? 0)),
  }));
}

// Median of the last `size` posts vs the `size` before that.
export function momentum(scored, size = 10) {
  const sorted = [...scored].sort((a, b) => b.at - a.at);
  const metric = sorted[0]?.metric || "views";
  const now = median(sorted.slice(0, size).map((p) => p[metric] ?? 0));
  const before = median(sorted.slice(size, size * 2).map((p) => p[metric] ?? 0));
  if (sorted.length < size * 2 || !before) return null;
  return { now, before, change: now / before - 1 };
}

// ---- what's working --------------------------------------------------------

const DAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

function timeOfDay(h) {
  if (h >= 5 && h < 11) return "mornings";
  if (h >= 11 && h < 15) return "midday";
  if (h >= 15 && h < 19) return "afternoons";
  if (h >= 19 && h < 23) return "evenings";
  return "late night";
}

function lengthBucket(s) {
  if (s == null) return null;
  if (s < 15) return "under 15s";
  if (s < 30) return "15–30s";
  if (s < 60) return "30–60s";
  if (s < 180) return "1–3 min";
  return "3 min+";
}

function captionBucket(text) {
  const n = (text || "").trim().length;
  if (!n) return "no caption";
  if (n < 60) return "short captions";
  return "long captions";
}

export const DIMENSIONS = [
  { key: "day", label: "Day posted", of: (p) => (p.at ? DAYS[new Date(p.at).getDay()] : null) },
  { key: "time", label: "Time posted", of: (p) => (p.at ? timeOfDay(new Date(p.at).getHours()) : null) },
  { key: "length", label: "Length", of: (p) => lengthBucket(p.seconds) },
  { key: "caption", label: "Caption", of: (p) => captionBucket(p.text) },
  { key: "format", label: "Format", of: (p) => p.format },
];

export const MIN_GROUP = 3;

// For each dimension, the median multiple of each bucket with enough posts.
export function breakdown(scored) {
  const rated = scored.filter((p) => p.multiple != null);
  return DIMENSIONS.map((dim) => {
    const buckets = new Map();
    rated.forEach((p) => {
      const b = dim.of(p);
      if (b == null) return;
      if (!buckets.has(b)) buckets.set(b, []);
      buckets.get(b).push(p.multiple);
    });
    const rows = [...buckets.entries()]
      .map(([bucket, ms]) => ({ bucket, n: ms.length, multiple: median(ms) }))
      .filter((r) => r.n >= MIN_GROUP)
      .sort((a, b) => b.multiple - a.multiple);
    return { ...dim, rows };
  }).filter((d) => d.rows.length >= 2);
}

const fmtX = (m) => `${m >= 10 ? Math.round(m) : m.toFixed(1)}x`;

// Plain sentences, strongest first. Only real gaps make the list.
export function findings(scored) {
  const out = [];
  breakdown(scored).forEach((d) => {
    const best = d.rows[0];
    const worst = d.rows[d.rows.length - 1];
    if (best.multiple >= 1.2 && best.multiple / Math.max(worst.multiple, 0.05) >= 1.5) {
      out.push({
        strength: best.multiple / Math.max(worst.multiple, 0.05),
        text: `${cap(best.bucket)} run ${fmtX(best.multiple)} your median. ${cap(worst.bucket)}: ${fmtX(worst.multiple)}.`,
        n: `${best.n} vs ${worst.n} posts`,
      });
    }
  });

  // Share rate: shares per 1K views, winners vs the rest.
  const withShares = scored.filter((p) => p.shares != null && p.views);
  const winners = withShares.filter((p) => p.multiple >= 1.5);
  const rest = withShares.filter((p) => p.multiple != null && p.multiple < 1.5);
  if (winners.length >= MIN_GROUP && rest.length >= MIN_GROUP) {
    const rate = (list) => median(list.map((p) => (p.shares / p.views) * 1000));
    const w = rate(winners);
    const r = rate(rest);
    if (w > 0 && r >= 0) {
      out.push({
        strength: r ? w / r : 3,
        text: `Your winners get ${w.toFixed(1)} shares per 1K views. The rest: ${r.toFixed(1)}. Shares are what push a post past your followers.`,
        n: `${winners.length} vs ${rest.length} posts`,
      });
    }
  }
  return out.sort((a, b) => b.strength - a.strength).slice(0, 5);
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function summary(scored) {
  const rated = scored.filter((p) => p.multiple != null);
  const recent = [...scored].sort((a, b) => b.at - a.at).slice(0, POOL_SIZE);
  return {
    count: scored.length,
    median: scored[0]?.median ?? 0,
    metric: scored[0]?.metric ?? "views",
    hitRate: recent.length ? recent.filter((p) => p.multiple >= 1.5).length / recent.length : 0,
    outliers: rated.filter((p) => p.tier === "outlier").length,
    momentum: momentum(scored),
  };
}
