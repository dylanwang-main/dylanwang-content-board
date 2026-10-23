import { format, parseISO } from "date-fns";
import { STATUSES } from "@/lib/content";

export function usedPlatforms(items) {
  const names = (items || []).map((item) => item.platform).filter(Boolean);
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
}

export function statusCounts(items) {
  const counts = { all: (items || []).length };

  STATUSES.forEach(({ value }) => {
    counts[value] = (items || []).filter((item) => item.status === value).length;
  });

  return counts;
}

export function filterItems(items, { status = "all", platform = "all", search = "" } = {}) {
  const query = search.trim().toLowerCase();

  return (items || []).filter((item) => {
    if (status !== "all" && item.status !== status) return false;
    if (platform !== "all" && item.platform !== platform) return false;
    if (!query) return true;

    return `${item.title || ""}\n${item.body || ""}`.toLowerCase().includes(query);
  });
}

export function itemMeta(item) {
  const parts = [item.platform, item.format, item.pillar].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "No platform yet";
}

export function itemDate(item) {
  const raw =
    item.status === "published"
      ? item.published_date
      : item.status === "scheduled"
        ? item.scheduled_date
        : null;

  const date = typeof raw === "string" && raw ? parseISO(raw) : null;

  return date && !Number.isNaN(date.getTime()) ? format(date, "MMM d") : null;
}