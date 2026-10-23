import { format, startOfMonth, subMonths } from "date-fns";
import { interactions } from "@/lib/content";

export function monthlyTrend(items, months = 6) {
  const end = startOfMonth(new Date());

  return Array.from({ length: months }, (_, index) => subMonths(end, months - 1 - index)).map((month) => {
    const key = format(month, "yyyy-MM");
    const bucket = (items || []).filter((item) => String(item.published_date || "").slice(0, 7) === key);

    return {
      month: format(month, "MMM"),
      views: bucket.reduce((sum, item) => sum + (item.views || 0), 0),
      pieces: bucket.length,
    };
  });
}

export function groupStats(items, key) {
  const buckets = new Map();

  (items || []).forEach((item) => {
    const label = String(item[key] || "").trim() || "Unassigned";
    const bucket = buckets.get(label) || { label, pieces: 0, views: 0, interactions: 0 };

    bucket.pieces += 1;
    bucket.views += item.views || 0;
    bucket.interactions += interactions(item);

    buckets.set(label, bucket);
  });

  return Array.from(buckets.values())
    .map((bucket) => ({
      ...bucket,
      rate: bucket.views ? (bucket.interactions / bucket.views) * 100 : null,
    }))
    .sort((a, b) => b.views - a.views);
}