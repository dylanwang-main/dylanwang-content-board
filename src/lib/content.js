export const STATUSES = [
  { value: "idea", label: "Idea" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

export const STATUS_STYLES = {
  idea: "bg-muted text-muted-foreground",
  draft: "bg-secondary text-foreground/80",
  scheduled: "bg-chart-3/15 text-chart-3",
  published: "bg-primary/15 text-primary",
};

export const STATUS_BARS = {
  idea: "bg-muted-foreground/40",
  draft: "bg-chart-2",
  scheduled: "bg-chart-3",
  published: "bg-primary",
};

export const FORMATS = [
  "Post",
  "Carousel",
  "Reel",
  "Short",
  "Video",
  "Story",
  "Thread",
  "Article",
  "Newsletter",
  "Podcast",
  "Other",
];

export const DEFAULT_PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "LinkedIn",
  "X",
  "Threads",
  "Newsletter",
  "Blog",
  "Podcast",
];

export const METRICS = ["views", "likes", "comments", "shares", "saves"];

export function interactions(item) {
  return (item.likes || 0) + (item.comments || 0) + (item.shares || 0) + (item.saves || 0);
}

export function summarize(items) {
  const published = (items || []).filter((item) => item.status === "published");
  const views = published.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalInteractions = published.reduce((sum, item) => sum + interactions(item), 0);

  return {
    published: published.length,
    views,
    interactions: totalInteractions,
    rate: views ? (totalInteractions / views) * 100 : null,
  };
}

export function formatNumber(n) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
}

export function platformOptions(me) {
  const platforms = me?.platforms;
  return Array.isArray(platforms) && platforms.length > 0 ? platforms : DEFAULT_PLATFORMS;
}