import { format, parseISO, startOfDay, startOfWeek, subDays, subWeeks } from "date-fns";

export function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : parseISO(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function inRange(date, days) {
  const parsed = toDate(date);
  if (!parsed) return false;

  const cutoff = startOfDay(subDays(new Date(), days));
  return parsed >= cutoff;
}

export function dayKey(date) {
  const parsed = toDate(date);
  return parsed ? format(parsed, "yyyy-MM-dd") : "";
}

export function weekKey(date) {
  const parsed = toDate(date);
  return parsed ? format(startOfWeek(parsed, { weekStartsOn: 1 }), "yyyy-MM-dd") : "";
}

export function buildSeries(posts, days) {
  const grain = days >= 90 ? "week" : "day";
  const buckets = new Map();
  const keys = [];
  const today = startOfDay(new Date());

  if (grain === "day") {
    for (let index = days - 1; index >= 0; index -= 1) {
      const date = subDays(today, index);
      const key = format(date, "yyyy-MM-dd");
      buckets.set(key, { key, label: format(date, "MMM d"), views: 0 });
      keys.push(key);
    }
  } else {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const weeks = Math.ceil(days / 7);

    for (let index = weeks - 1; index >= 0; index -= 1) {
      const date = subWeeks(start, index);
      const key = format(date, "yyyy-MM-dd");
      buckets.set(key, { key, label: format(date, "MMM d"), views: 0 });
      keys.push(key);
    }
  }

  (posts || []).forEach((post) => {
    if (post.views === null || post.views === undefined) return;

    const key = grain === "day" ? dayKey(post.date) : weekKey(post.date);
    const bucket = buckets.get(key);
    if (bucket) bucket.views += post.views;
  });

  return keys.map((key) => buckets.get(key));
}

export function channelRate(likes, comments, shares, views) {
  if (!views) return null;
  return (((likes || 0) + (comments || 0) + (shares || 0)) / views) * 100;
}

export function normalizePosts(instagram = [], tiktok = [], youtube = []) {
  const fromInstagram = (instagram || []).map((post) => ({
    platform: "Instagram",
    id: post.ig_id,
    title: post.caption || "Instagram post",
    url: post.permalink || "",
    thumbnail: post.thumbnail_url || post.media_url || "",
    date: post.timestamp || "",
    views: null,
    likes: post.like_count || 0,
    comments: post.comments_count || 0,
    shares: 0,
  }));

  const fromTikTok = (tiktok || []).map((post) => ({
    platform: "TikTok",
    id: post.tt_id,
    title: post.video_description || "TikTok video",
    url: post.share_url || "",
    thumbnail: post.cover_image_url || "",
    date: post.create_time || "",
    views: post.view_count || 0,
    likes: post.like_count || 0,
    comments: post.comment_count || 0,
    shares: post.share_count || 0,
  }));

  const fromYouTube = (youtube || []).map((post) => ({
    platform: "YouTube",
    id: post.video_id,
    title: post.title || "YouTube video",
    url: post.url || "",
    thumbnail: post.thumbnail_url || "",
    date: post.published_at || "",
    views: post.view_count || 0,
    likes: post.like_count || 0,
    comments: post.comment_count || 0,
    shares: 0,
  }));

  return [...fromInstagram, ...fromTikTok, ...fromYouTube].sort((a, b) => {
    const left = toDate(a.date);
    const right = toDate(b.date);
    return (right ? right.getTime() : 0) - (left ? left.getTime() : 0);
  });
}