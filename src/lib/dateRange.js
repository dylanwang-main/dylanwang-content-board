import { parseISO, subDays } from "date-fns";

export function rangeCutoff(range) {
  if (range === "all") return null;
  return subDays(new Date(), range);
}

export function inDateRange(dateString, range) {
  if (range === "all") return true;
  if (!dateString) return false;

  const date = parseISO(dateString);
  if (Number.isNaN(date.getTime())) return false;

  const cutoff = rangeCutoff(range);
  return cutoff ? date >= cutoff : true;
}