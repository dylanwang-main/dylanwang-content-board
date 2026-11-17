// Search, type and sort for synced Instagram media. Pure so it's testable.

export const MEDIA_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "reels", label: "Reels" },
  { value: "posts", label: "Posts" },
];

export const MEDIA_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "views", label: "Most views" },
  { value: "likes", label: "Most likes" },
  { value: "comments", label: "Most comments" },
  { value: "shares", label: "Most shares" },
  { value: "saves", label: "Most saves" },
  { value: "engagement", label: "Best engagement" },
];

const num = (v) => Number(v) || 0;
const time = (v) => {
  const t = Date.parse(v || "");
  return Number.isNaN(t) ? 0 : t;
};

// media_product_type is the real answer; VIDEO is the fallback for older syncs.
export function isReel(item) {
  if (item.media_product_type) return item.media_product_type === "REELS";
  return item.media_type === "VIDEO";
}

// Trial reels go to non-followers only and stay off the profile grid, so
// Instagram reports them as not shared to feed.
export function isTrialReel(item) {
  return isReel(item) && item.is_shared_to_feed === false;
}

// (likes + comments + shares + saves) / views, or null without views.
export function mediaEngagementRate(item) {
  const views = num(item.view_count);
  if (!views) return null;
  return (num(item.like_count) + num(item.comments_count) + num(item.shares_count) + num(item.saved_count)) / views;
}

const SORTERS = {
  newest: (a, b) => time(b.timestamp) - time(a.timestamp),
  oldest: (a, b) => time(a.timestamp) - time(b.timestamp),
  views: (a, b) => num(b.view_count) - num(a.view_count),
  likes: (a, b) => num(b.like_count) - num(a.like_count),
  comments: (a, b) => num(b.comments_count) - num(a.comments_count),
  shares: (a, b) => num(b.shares_count) - num(a.shares_count),
  saves: (a, b) => num(b.saved_count) - num(a.saved_count),
  engagement: (a, b) => (mediaEngagementRate(b) ?? -1) - (mediaEngagementRate(a) ?? -1),
};

export function filterAndSortMedia(media, { query = "", type = "all", sort = "newest", hideTrials = true } = {}) {
  const q = query.trim().toLowerCase();
  const sorter = SORTERS[sort] || SORTERS.newest;
  return media
    .filter((m) => !hideTrials || !isTrialReel(m))
    .filter((m) => type === "all" || (type === "reels" ? isReel(m) : !isReel(m)))
    .filter((m) => !q || (m.caption || "").toLowerCase().includes(q))
    .slice()
    .sort(sorter);
}
