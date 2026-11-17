// Turns synced videos (or logged posts) into the Home page's headline insight
// and "top cuts". Pure functions so the math is testable.

const num = (v) => Number(v) || 0;

// Normalize YouTube videos and library posts into one shape.
export function toPosts({ videos = [], items = [] }) {
  if (videos.length) {
    return videos.map((v) => ({
      id: v.id,
      title: v.title || "Untitled",
      views: num(v.view_count),
      likes: num(v.like_count),
      date: v.published_at || "",
      thumbnail: v.thumbnail_url || "",
      seconds: num(v.duration_seconds),
      url: v.url || "",
      source: "youtube",
    }));
  }
  return items
    .filter((i) => i.status === "published")
    .map((i) => ({
      id: i.id,
      title: i.title || "Untitled",
      views: num(i.views),
      likes: num(i.likes),
      date: i.published_date || "",
      thumbnail: "",
      seconds: 0,
      url: i.url || "",
      source: "library",
    }));
}

export function median(values) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function topPosts(posts, n = 5) {
  return [...posts].sort((a, b) => b.views - a.views).slice(0, n);
}

// The single most useful sentence about the numbers.
export function headline(posts) {
  const total = posts.reduce((sum, p) => sum + p.views, 0);
  if (!posts.length || !total) {
    return { title: "Nothing posted yet.", detail: "Sync YouTube or log a published post to see what's working." };
  }
  const [best] = topPosts(posts, 1);
  const share = best.views / total;
  const med = median(posts.map((p) => p.views));
  if (posts.length > 1 && share >= 0.4) {
    return {
      title: `One video did ${Math.round(share * 100)}% of your views.`,
      detail: `"${best.title}" hit ${compact(best.views)}. Everything else combined: ${compact(total - best.views)}.`,
    };
  }
  if (med > 0 && best.views >= med * 3) {
    return {
      title: `Your best video beat your median by ${Math.round(best.views / med)}x.`,
      detail: `"${best.title}" hit ${compact(best.views)}; a typical video gets ${compact(med)}.`,
    };
  }
  return {
    title: `${compact(total)} views across ${posts.length} ${posts.length === 1 ? "video" : "videos"}.`,
    detail: `A typical video gets ${compact(med)}. Best so far: "${best.title}" at ${compact(best.views)}.`,
  };
}

export function compact(n) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n || 0);
}

// 00:32 style timecode.
export function timecode(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
