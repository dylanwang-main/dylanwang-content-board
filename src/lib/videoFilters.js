// Search, format and sort for the synced YouTube videos list. Pure functions
// so the rules are easy to test and reuse on other platform pages.

export const FORMAT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "short_form", label: "Shorts" },
  { value: "long_form", label: "Long form" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "views", label: "Most views" },
  { value: "likes", label: "Most likes" },
  { value: "comments", label: "Most comments" },
  { value: "engagement", label: "Best engagement" },
];

const num = (v) => Number(v) || 0;
const time = (v) => {
  const t = Date.parse(v || "");
  return Number.isNaN(t) ? 0 : t;
};

// (likes + comments) / views, or null when there are no views to measure.
export function engagementRate(video) {
  const views = num(video.view_count);
  if (!views) return null;
  return (num(video.like_count) + num(video.comment_count)) / views;
}

const SORTERS = {
  newest: (a, b) => time(b.published_at) - time(a.published_at),
  oldest: (a, b) => time(a.published_at) - time(b.published_at),
  views: (a, b) => num(b.view_count) - num(a.view_count),
  likes: (a, b) => num(b.like_count) - num(a.like_count),
  comments: (a, b) => num(b.comment_count) - num(a.comment_count),
  // Unmeasured videos (0 views) go last instead of counting as 0%.
  engagement: (a, b) => (engagementRate(b) ?? -1) - (engagementRate(a) ?? -1),
};

export function filterAndSortVideos(videos, { query = "", format = "all", sort = "newest" } = {}) {
  const q = query.trim().toLowerCase();
  const sorter = SORTERS[sort] || SORTERS.newest;
  return videos
    .filter((v) => format === "all" || (v.format || "short_form") === format)
    .filter((v) => !q || `${v.title || ""} ${v.description || ""}`.toLowerCase().includes(q))
    .slice()
    .sort(sorter);
}
